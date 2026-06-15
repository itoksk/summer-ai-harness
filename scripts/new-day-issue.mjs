// Create one GitHub issue for a day, pre-filled with that day's essential
// questions (as reference prompts) and the bilingual day-reflection headings,
// labelled day:N. One day = one reflection issue (5 days, 5 issues total).
//
// Students normally do NOT run this by hand — vibe-local runs it for them when
// they say "start today's reflection" / "今日の振り返りを始めたい". It can also be
// run directly:
//
//   npm run new:day -- --day 2
//   npm run new:day -- --day 2 --type reflection
//   npm run new:day -- --day 2 --dry-run     (print the body, create nothing)

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const daysConfig = JSON.parse(fs.readFileSync(path.join(root, "config/days.json"), "utf8"));
const labelConfig = JSON.parse(fs.readFileSync(path.join(root, "config/labels.json"), "utf8"));
const allowedTypes = labelConfig
  .map((label) => label.name)
  .filter((name) => name.startsWith("type:"))
  .map((name) => name.slice("type:".length));

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function printDayMap() {
  console.error("\nAvailable days / 使える日:");
  for (const day of daysConfig.days) {
    console.error(`  Day ${day.day} — ${day.title.en} / ${day.title.jp}`);
  }
  console.error("\nUsage: npm run new:day -- --day <1-5> [--type <name>] [--dry-run]");
}

const args = parseArgs(process.argv.slice(2));
const day = Number(args.day);
const type = typeof args.type === "string" ? args.type : "reflection";
const dryRun = Boolean(args["dry-run"]);

if (!day) {
  console.error("Missing --day. / --day がありません。");
  printDayMap();
  process.exit(1);
}

const dayEntry = daysConfig.days.find((d) => d.day === day);

if (!dayEntry) {
  console.error(`No day found for Day ${day}. / 該当する日がありません。`);
  printDayMap();
  process.exit(1);
}

if (!allowedTypes.includes(type)) {
  console.error(`Unknown --type "${type}". Allowed: ${allowedTypes.join(", ")}`);
  process.exit(1);
}

const questionLines = dayEntry.questions
  .map((q) => `- ${q.en}\n  ${q.jp}`)
  .join("\n");

const title = `[Day ${day}] ${dayEntry.title.en} — reflection / 振り返り`;

const body = `> Day ${day}: ${dayEntry.title.en} / ${dayEntry.title.jp}
> Focus / 核: ${dayEntry.focus.en} / ${dayEntry.focus.jp}
>
> Write in English or Japanese. The goal is to show your thinking, not a perfect answer.
> 英語でも日本語でもOK。きれいな答えより「思考」を残すのが目的です。

## The day's essential questions / その日の問い (reference / 参考)

${questionLines}

## What I did today / 今日やったこと

<!-- The main things you made, tried, or explored today. / 今日作った・試した・調べたことの主なもの。 -->

## My guesses (from my notes) / 予想（メモから）

<!-- Before the activities: what did you think? Use the guesses you jotted on paper. It's fine to be wrong. / 活動の前の予想。紙にメモした予想を使う。間違ってOK。 -->

## What I checked / 確かめたこと

<!-- What did you build, try, observe, or ask to test your guesses? / 予想を確かめるために何を作り・試し・観察し・聞いた? -->

## What changed / 考えが変わったところ

<!-- "At first I thought ___, but ___." / 「最初は___と思ったが、___」 -->

## Insight / 気づき

<!-- One thing you can now explain in your own words. / 自分の言葉で説明できること。 -->

## How I'll use this next / 次にどう使うか

<!-- Next time you see a similar problem, what will you check first? / 次に似た問題でまず何を確認する? -->

## Which AI helped / 一緒に考えたAI

<!-- Ollama / vibe-local / other / none -->

---

- [ ] Guesses written from my paper notes / 紙のメモから予想を書いた
- [ ] What changed in my thinking recorded / 考えが変わったところを書いた
- [ ] One insight in my own words / 気づきを自分の言葉で
- [ ] How I'll use this next / 次にどう使うか
`;

const labels = [`day:${day}`, `type:${type}`, "status:ready", "portfolio:show"];

if (dryRun) {
  console.log(`Title: ${title}\n`);
  console.log(`Labels: ${labels.join(", ")}\n`);
  console.log("Body:\n");
  console.log(body);
  process.exit(0);
}

// No gh? No problem. Print the issue so it can be pasted into the web "New issue"
// form — the day-labeler workflow still applies the day:N label in the browser.
function manualFallback(reason) {
  console.log(`\n${reason}`);
  console.log("Create this day reflection issue in your browser instead (no GitHub CLI needed):\n");
  console.log("  Your repo -> Issues -> New issue -> 'Day reflection'");
  console.log("  (pick Day " + day + "; the labeler adds the day label automatically)");
  console.log("  Or open a blank New issue and paste the title + body below.\n");
  console.log(`Title:\n  ${title}\n`);
  console.log(`Suggested labels: ${labels.join(", ")}\n`);
  console.log("----- Body (copy from here) -----\n");
  console.log(body);
  process.exit(0);
}

// Is gh installed?
const ghCheck = spawnSync("gh", ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
if (ghCheck.error || ghCheck.status !== 0) {
  manualFallback("GitHub CLI (gh) isn't installed — that's fine, it's optional.");
}

// Is gh signed in?
const auth = spawnSync("gh", ["auth", "status"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
if (auth.status !== 0) {
  manualFallback("GitHub CLI isn't signed in (run `gh auth login` to enable one-command creation).");
}

const ghArgs = ["issue", "create", "--title", title, "--body", body];
for (const label of labels) {
  ghArgs.push("--label", label);
}

const result = spawnSync("gh", ghArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
if (result.status !== 0) {
  console.error("Couldn't create the issue with gh:");
  console.error(result.stderr.trim());
  console.error("\nIf labels don't exist yet, run the 'Sync labels' workflow (Actions tab) or `npm run sync-labels`.");
  manualFallback("Falling back to manual (browser) creation:");
}

console.log(result.stdout.trim());
console.log(`Created day reflection issue: Day ${day}.`);
