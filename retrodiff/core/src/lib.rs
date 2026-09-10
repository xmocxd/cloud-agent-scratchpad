//! Line diff, merge actions, ancestor (diff3) rules, and directory compare.
//! Independent implementation used by `cargo test` (the GUI uses the TypeScript port).

use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MergeChoice {
    Left,
    Right,
    BothLeft,
    BothRight,
    Neither,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum HunkKind {
    Equal,
    Change,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Hunk {
    pub id: usize,
    pub kind: HunkKind,
    pub left_lines: Vec<String>,
    pub right_lines: Vec<String>,
    pub choice: MergeChoice,
    pub is_conflict: bool,
}

pub fn split_lines(text: &str) -> Vec<String> {
    if text.is_empty() {
        return vec![];
    }
    let mut parts: Vec<String> = text.split('\n').map(|s| s.to_string()).collect();
    if parts.last().map(|s| s.is_empty()).unwrap_or(false) {
        parts.pop();
    }
    parts
}

pub fn join_lines(lines: &[String]) -> String {
    if lines.is_empty() {
        return String::new();
    }
    let mut s = lines.join("\n");
    s.push('\n');
    s
}

pub fn lcs_script(a: &[String], b: &[String]) -> Vec<(&'static str, String)> {
    let n = a.len();
    let m = b.len();
    let mut dp = vec![vec![0u32; m + 1]; n + 1];
    for i in (0..n).rev() {
        for j in (0..m).rev() {
            dp[i][j] = if a[i] == b[j] {
                dp[i + 1][j + 1] + 1
            } else {
                dp[i + 1][j].max(dp[i][j + 1])
            };
        }
    }
    let mut script = Vec::new();
    let mut i = 0;
    let mut j = 0;
    while i < n && j < m {
        if a[i] == b[j] {
            script.push(("eq", a[i].clone()));
            i += 1;
            j += 1;
        } else if dp[i + 1][j] >= dp[i][j + 1] {
            script.push(("del", a[i].clone()));
            i += 1;
        } else {
            script.push(("ins", b[j].clone()));
            j += 1;
        }
    }
    while i < n {
        script.push(("del", a[i].clone()));
        i += 1;
    }
    while j < m {
        script.push(("ins", b[j].clone()));
        j += 1;
    }
    script
}

pub fn hunks_from_script(script: &[(&'static str, String)], default: MergeChoice) -> Vec<Hunk> {
    let mut hunks = Vec::new();
    let mut i = 0;
    let mut id = 1usize;
    while i < script.len() {
        if script[i].0 == "eq" {
            let mut lines = Vec::new();
            while i < script.len() && script[i].0 == "eq" {
                lines.push(script[i].1.clone());
                i += 1;
            }
            hunks.push(Hunk {
                id: 0,
                kind: HunkKind::Equal,
                left_lines: lines.clone(),
                right_lines: lines,
                choice: default.clone(),
                is_conflict: false,
            });
        } else {
            let mut dels = Vec::new();
            let mut ins = Vec::new();
            while i < script.len() && script[i].0 != "eq" {
                if script[i].0 == "del" {
                    dels.push(script[i].1.clone());
                } else {
                    ins.push(script[i].1.clone());
                }
                i += 1;
            }
            hunks.push(Hunk {
                id,
                kind: HunkKind::Change,
                left_lines: dels,
                right_lines: ins,
                choice: default.clone(),
                is_conflict: false,
            });
            id += 1;
        }
    }
    hunks
}

pub fn diff_lines(left: &str, right: &str) -> Vec<Hunk> {
    let a = split_lines(left);
    let b = split_lines(right);
    hunks_from_script(&lcs_script(&a, &b), MergeChoice::Right)
}

pub fn change_hunks(hunks: &[Hunk]) -> Vec<&Hunk> {
    hunks.iter().filter(|h| h.kind == HunkKind::Change).collect()
}

pub fn lines_for_choice(h: &Hunk) -> Vec<String> {
    if h.kind == HunkKind::Equal {
        return h.left_lines.clone();
    }
    match h.choice {
        MergeChoice::Left => h.left_lines.clone(),
        MergeChoice::Right => h.right_lines.clone(),
        MergeChoice::BothLeft => [h.left_lines.clone(), h.right_lines.clone()].concat(),
        MergeChoice::BothRight => [h.right_lines.clone(), h.left_lines.clone()].concat(),
        MergeChoice::Neither => vec![],
    }
}

pub fn build_merge(hunks: &[Hunk]) -> String {
    let mut out = Vec::new();
    for h in hunks {
        out.extend(lines_for_choice(h));
    }
    join_lines(&out)
}

fn contains_seq(hay: &[String], needle: &[String]) -> bool {
    if needle.is_empty() {
        return true;
    }
    hay.windows(needle.len()).any(|w| w == needle)
}

pub fn diff3_lines(left: &str, right: &str, ancestor: &str) -> Vec<Hunk> {
    let mut hunks = diff_lines(left, right);
    let origin = split_lines(ancestor);
    let l = split_lines(left);
    let r = split_lines(right);
    for h in hunks.iter_mut() {
        if h.kind != HunkKind::Change {
            continue;
        }
        let left_is_orig = h.left_lines.is_empty() || contains_seq(&origin, &h.left_lines);
        let right_is_orig = h.right_lines.is_empty() || contains_seq(&origin, &h.right_lines);
        if left_is_orig && !right_is_orig {
            h.choice = MergeChoice::Right;
            h.is_conflict = false;
        } else if right_is_orig && !left_is_orig {
            h.choice = MergeChoice::Left;
            h.is_conflict = false;
        } else if h.left_lines == h.right_lines {
            h.choice = MergeChoice::Right;
            h.is_conflict = false;
        } else {
            h.is_conflict = !h.left_lines.is_empty() && !h.right_lines.is_empty();
            h.choice = MergeChoice::Right;
        }
    }
    let _ = (l, r);
    hunks
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DirStatus {
    Identical,
    Modified,
    AddedLeft,
    AddedRight,
}

pub fn should_ignore(rel: &str, ignore: &[&str]) -> bool {
    rel.split(['/', '\\']).any(|p| ignore.contains(&p))
}

pub fn compare_trees(
    left: &BTreeMap<String, String>,
    right: &BTreeMap<String, String>,
    ignore: &[&str],
) -> Vec<(String, DirStatus)> {
    let mut keys = BTreeSet::new();
    keys.extend(left.keys().cloned());
    keys.extend(right.keys().cloned());
    let mut out = Vec::new();
    for rel in keys {
        if should_ignore(&rel, ignore) {
            continue;
        }
        let l = left.get(&rel);
        let r = right.get(&rel);
        let status = match (l, r) {
            (Some(a), Some(b)) if a == b => DirStatus::Identical,
            (Some(_), Some(_)) => DirStatus::Modified,
            (Some(_), None) => DirStatus::AddedLeft,
            (None, Some(_)) => DirStatus::AddedRight,
            (None, None) => continue,
        };
        out.push((rel, status));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identical_has_no_changes() {
        let h = diff_lines("a\nb\n", "a\nb\n");
        assert!(change_hunks(&h).is_empty());
    }

    #[test]
    fn replace_hunk() {
        let h = diff_lines("keep\nold\nend\n", "keep\nnew\nend\n");
        let c = change_hunks(&h);
        assert_eq!(c.len(), 1);
        assert_eq!(c[0].left_lines, vec!["old"]);
        assert_eq!(c[0].right_lines, vec!["new"]);
    }

    #[test]
    fn merge_actions() {
        let left = "a\nL\nz\n";
        let right = "a\nR\nz\n";
        let apply = |choice: MergeChoice| {
            let mut h = diff_lines(left, right);
            for x in h.iter_mut() {
                if x.kind == HunkKind::Change {
                    x.choice = choice.clone();
                }
            }
            build_merge(&h)
        };
        assert_eq!(apply(MergeChoice::Left), "a\nL\nz\n");
        assert_eq!(apply(MergeChoice::Right), "a\nR\nz\n");
        assert_eq!(apply(MergeChoice::BothLeft), "a\nL\nR\nz\n");
        assert_eq!(apply(MergeChoice::BothRight), "a\nR\nL\nz\n");
        assert_eq!(apply(MergeChoice::Neither), "a\nz\n");
    }

    #[test]
    fn ancestor_prefers_divergent_side() {
        let h = diff3_lines("a\ncommon\nz\n", "a\nRIGHT\nz\n", "a\ncommon\nz\n");
        let c = change_hunks(&h);
        assert_eq!(c[0].choice, MergeChoice::Right);
        assert!(!c[0].is_conflict);
    }

    #[test]
    fn ancestor_conflict() {
        let h = diff3_lines(
            "alpha\nbravo-left\ncommon line\ndelta\necho-left\n",
            "alpha\nbravo-right\ncommon line\ndelta\necho-right\n",
            "alpha\nbravo\ncommon line\ndelta\necho\n",
        );
        let conflicts: Vec<_> = change_hunks(&h).into_iter().filter(|x| x.is_conflict).collect();
        assert!(!conflicts.is_empty());
    }

    #[test]
    fn directory_statuses_and_ignore() {
        let mut l = BTreeMap::new();
        l.insert("identical.txt".into(), "same".into());
        l.insert("shared.txt".into(), "old".into());
        l.insert("only-left.txt".into(), "L".into());
        l.insert(".git/config".into(), "x".into());
        let mut r = BTreeMap::new();
        r.insert("identical.txt".into(), "same".into());
        r.insert("shared.txt".into(), "new".into());
        r.insert("only-right.txt".into(), "R".into());
        let entries = compare_trees(&l, &r, &[".git", ".svn", "CVS"]);
        let get = |name: &str| {
            entries
                .iter()
                .find(|(n, _)| n == name)
                .map(|(_, s)| s.clone())
        };
        assert_eq!(get("identical.txt"), Some(DirStatus::Identical));
        assert_eq!(get("shared.txt"), Some(DirStatus::Modified));
        assert_eq!(get("only-left.txt"), Some(DirStatus::AddedLeft));
        assert_eq!(get("only-right.txt"), Some(DirStatus::AddedRight));
        assert!(get(".git/config").is_none());
    }
}
