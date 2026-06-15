#!/usr/bin/env node
// Pull the latest harness files from the public template — same command on Windows and macOS.
//   npm run sync     (or: node scripts/sync-from-template.mjs)
//
// It only refreshes harness BEHAVIOUR/CONTENT files. It never touches your work:
// your reflections live as GitHub issues, and learning-log/ + public/ are left alone.
// .github/workflows/ is skipped too (pushing those needs a special token scope).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RAW = "https://raw.githubusercontent.com/itoksk/summer-ai-harness/main";

// Curated, safe list. This script updates ITSELF too, so the list stays current.
const FILES = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "scripts/sync-from-template.mjs",
  "scripts/build-thinking-depth-html.mjs",
  "scripts/build-portfolio.mjs",
  "scripts/new-day-issue.mjs",
  "scripts/check-harness.mjs",
  "scripts/sync-labels.mjs",
  "prompts/day-reflection.md",
  "prompts/socratic-tutor.md",
  "prompts/stuck-helper.md",
  "docs/student-quickref.md",
  "docs/teacher-playbook.md",
  "docs/using-local-llm.md",
  "docs/day-map.md",
  "docs/labels.md",
  "config/days.json",
  "config/labels.json",
];

const root = process.cwd();
let updated = 0;
let skipped = 0;

for (const rel of FILES) {
  try {
    const res = await fetch(`${RAW}/${rel}?t=${Date.now()}`);
    if (!res.ok) {
      console.warn(`  skip ${rel} (HTTP ${res.status})`);
      skipped += 1;
      continue;
    }
    const body = await res.text();
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    const before = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
    if (before === body) continue;
    fs.writeFileSync(abs, body);
    console.log(`  updated ${rel}`);
    updated += 1;
  } catch (error) {
    console.warn(`  skip ${rel} (${error.message})`);
    skipped += 1;
  }
}

console.log(`\nSync: ${updated} updated, ${skipped} skipped.`);
if (updated === 0) {
  console.log("Already up to date.");
  process.exit(0);
}

// Commit + push (best effort). The git CLI is the same on Windows and macOS.
const MANUAL = '  git add -A && git commit -m "sync harness from template" && git push';

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

let remote = "";
let branch = "";
try {
  git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  console.log("\nThis folder is not a git repo. cd into YOUR harness folder, then run `npm run sync` again.");
  process.exit(0);
}
try { remote = git(["remote", "get-url", "origin"]); } catch {}
try { branch = git(["rev-parse", "--abbrev-ref", "HEAD"]); } catch {}

if (!remote) {
  console.log("\nNo GitHub remote yet (git not connected). Files are updated locally — connect and push:");
  console.log("  git remote -v        # should show YOUR github repo");
  console.log(MANUAL);
  process.exit(0);
}

console.log(`\nConnected to: ${remote} (${branch || "current branch"})`);
try {
  execFileSync("git", ["add", "-A"], { cwd: root, stdio: "inherit" });
  execFileSync("git", ["commit", "-m", "sync harness from template"], { cwd: root, stdio: "inherit" });
  execFileSync("git", ["push"], { cwd: root, stdio: "inherit" });
  console.log("\nDone — committed and pushed to GitHub.");
} catch {
  console.log("\nCouldn't push automatically. Check `gh auth status`, then run:");
  console.log(MANUAL);
}
