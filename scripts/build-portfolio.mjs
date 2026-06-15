// Build the bilingual (EN/JA) portfolio from all `portfolio:show` day issues,
// grouped by Day (one day = one reflection). Output: public/index.html +
// public/portfolio.md. It reads the thinking loop (Question -> Guess -> Checked
// -> Changed -> Insight -> Next) from EN or JA headings in the issue body and
// comments.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "public", "index.html");
const markdownOutputPath = path.join(root, "public", "portfolio.md");
const showLabel = "portfolio:show";
const hideLabel = "portfolio:hide";

let daysConfig = { days: [] };
try {
  daysConfig = JSON.parse(fs.readFileSync(path.join(root, "config/days.json"), "utf8"));
} catch {
  // optional
}

const steps = [
  { key: "question", en: "Question", ja: "問い", q: "What did you want to know? / 何を知りたい?", aliases: ["question", "問い", "問題提起", "figure out", "want to know", "わからな"] },
  { key: "hypothesis", en: "My guess", ja: "予想", q: "What was your own guess? / 自分の予想は?", aliases: ["guess", "hypothesis", "予想", "仮説", "自分で考え", "first guess"] },
  { key: "check", en: "What I checked", ja: "確かめ", q: "What did you check? / 何を確かめた?", aliases: ["checked", "check", "確かめ", "確認", "tried", "what i did", "やったこと", "根拠", "i did and"] },
  { key: "shift", en: "What changed", ja: "考え直し", q: "Where did your view move? / どこで見方が変わった?", aliases: ["changed", "考えが変", "考え直", "思考の変化", "rethink", "what changed"] },
  { key: "insight", en: "Insight", ja: "気づき", q: "What did you learn? / 何がわかった?", aliases: ["learned", "insight", "気づき", "わかったこと", "得た知見", "なるほど", "i can now"] },
  { key: "future", en: "Next", ja: "次に使う", q: "How will you use it next? / 次にどう使う?", aliases: ["next", "次に", "次回", "use this", "will check", "判断基準", "復習", "avoid it next"] },
];

function runGit(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function detectRepository() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const remoteUrl = runGit(["config", "--get", "remote.origin.url"]);
  const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
  if (!match) throw new Error("GitHub repository could not be inferred from remote.origin.url.");
  return match[1].replaceAll("\\", "/");
}

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execFileSync("gh", ["auth", "token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function nextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

async function requestAll(url, token) {
  const results = [];
  let next = url;
  while (next) {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "summer-ai-study-harness-portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(next, { headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}\n${body}`);
    }
    results.push(...(await response.json()));
    next = nextLink(response.headers.get("link"));
  }
  return results;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function normalize(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function normalizeHeading(value) {
  return normalize(value).replace(/\s+/g, "").toLowerCase();
}

function stripMarkdown(value) {
  return normalize(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\[[ xX]\]\s*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMarkdown(value, maxLength = 200) {
  const compact = stripMarkdown(value);
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}...`;
}

function extractSectionEntries(markdown) {
  const text = normalize(markdown);
  const pattern = /^(#{1,3})\s+(.+?)\s*$/gm;
  const matches = [...text.matchAll(pattern)];
  return matches
    .map((current, index) => {
      const next = matches[index + 1];
      const start = current.index + current[0].length;
      const end = next ? next.index : text.length;
      return { title: current[2].replace(/\s+#+$/g, "").trim(), body: text.slice(start, end).trim() };
    })
    .filter((entry) => entry.body);
}

function matchStepKey(title) {
  const normalized = normalizeHeading(title);
  for (const step of steps) {
    for (const alias of step.aliases) {
      if (normalized.includes(alias.replace(/\s+/g, ""))) return step.key;
    }
  }
  return "";
}

function hasMeaning(value) {
  return Boolean(stripMarkdown(value));
}

function labelNames(issue) {
  return (issue.labels ?? []).map((label) => (typeof label === "string" ? label : label.name));
}

function dayFromLabels(labels) {
  return Number(labels.find((l) => /^day:\d$/.test(l))?.split(":")[1]) || 0;
}

function issueType(labels) {
  const t = labels.find((l) => l.startsWith("type:"));
  return t ? t.slice("type:".length) : "—";
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function parseIssue(issue, comments) {
  const labels = labelNames(issue);
  const allMarkdown = [issue.body ?? "", ...comments.map((c) => c.body ?? "")].join("\n\n");
  const entries = extractSectionEntries(allMarkdown);

  const stepValues = {};
  for (const step of steps) stepValues[step.key] = "";
  for (const entry of entries) {
    const key = matchStepKey(entry.title);
    if (key && !stepValues[key] && hasMeaning(entry.body)) {
      stepValues[key] = compactMarkdown(entry.body, 200);
    }
  }

  const day = dayFromLabels(labels);
  const topic = issue.title.replace(/^\[[^\]]+\]\s*/, "");

  return {
    number: issue.number,
    title: issue.title,
    topic,
    url: issue.html_url,
    state: issue.state,
    labels,
    day,
    type: issueType(labels),
    stepValues,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
  };
}

function journeySteps(item) {
  return steps.map((step) => ({
    en: step.en,
    ja: step.ja,
    q: step.q,
    value: item.stepValues[step.key],
  }));
}

function seenCount(item) {
  return journeySteps(item).filter((s) => hasMeaning(s.value)).length;
}

function readLabel(item) {
  const n = seenCount(item);
  if (n >= 5) return "Thinking is clear / 思考がはっきり読める";
  if (n >= 3) return "Path is forming / 道すじが見え始め";
  if (n >= 1) return "Material kept / 材料が残っている";
  return "To record / これから記録";
}

function renderRail(item) {
  return `<ol class="rail">${journeySteps(item)
    .map((s) => {
      const seen = hasMeaning(s.value);
      return `<li class="${seen ? "is-seen" : "is-missing"}"><span>${escapeHtml(s.en)}</span><strong>${escapeHtml(s.ja)}</strong></li>`;
    })
    .join("")}</ol>`;
}

function renderSteps(item) {
  return `<div class="steps">${journeySteps(item)
    .map((s) => {
      const seen = hasMeaning(s.value);
      return `<article class="${seen ? "has" : "needs"}"><span>${escapeHtml(s.en)} / ${escapeHtml(s.ja)}</span><h4>${escapeHtml(s.q)}</h4><p>${escapeHtml(seen ? s.value : "—")}</p></article>`;
    })
    .join("")}</div>`;
}

function renderCard(item) {
  const dayLabel = item.day ? `Day ${item.day}` : "Unlabelled / 未分類";
  return `
    <article class="card">
      <header>
        <div><span>${escapeHtml(dayLabel)} · ${escapeHtml(item.type)} · #${item.number}</span>
        <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.topic)}</a></h3></div>
        <strong>${escapeHtml(readLabel(item))}</strong>
      </header>
      ${renderRail(item)}
      ${renderSteps(item)}
      <footer><span>Updated ${escapeHtml(formatDate(item.updatedAt))}${item.closedAt ? ` · Closed ${escapeHtml(formatDate(item.closedAt))}` : ""}</span><a href="${escapeHtml(item.url)}">Open issue / Issueを開く</a></footer>
    </article>`;
}

function renderDaySection(day, items) {
  const dayEntry = daysConfig.days?.find((d) => d.day === day);
  const dayTitle = dayEntry ? `${dayEntry.title.en} / ${dayEntry.title.jp}` : "Unlabelled / 未分類";
  const sorted = [...items].sort((a, b) => a.number - b.number);
  return `
    <section class="day">
      <div class="day-head"><span class="eyebrow">Day ${day || "?"}</span><h2>${escapeHtml(dayTitle)}</h2></div>
      <div class="cards">${sorted.map(renderCard).join("")}</div>
    </section>`;
}

function renderHtml(items, repository) {
  const recent = [...items];
  const closed = items.filter((i) => i.state === "closed").length;
  const readable = items.filter((i) => seenCount(i) >= 5).length;

  const dayBuckets = new Map();
  for (const item of recent) {
    const key = item.day || 0;
    if (!dayBuckets.has(key)) dayBuckets.set(key, []);
    dayBuckets.get(key).push(item);
  }
  const dayKeys = [...dayBuckets.keys()].sort((a, b) => (a === 0 ? 99 : a) - (b === 0 ? 99 : b));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thinking journey / 思考の道すじ</title>
  <style>
    :root { color-scheme: light; --paper:#f7f4ec; --surface:#fffdf7; --ink:#1f2528; --muted:#657074; --line:#d8d0c0; --teal:#08736e; --blue:#2c5c9f; --amber:#d49b2a; --shadow:0 18px 50px rgba(31,37,40,0.12); }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin:0; color:var(--ink); background: linear-gradient(90deg, rgba(8,115,110,0.06) 1px, transparent 1px) 0 0/48px 48px, linear-gradient(rgba(44,92,159,0.045) 1px, transparent 1px) 0 0/48px 48px, var(--paper); font-family:"Inter","Helvetica Neue","BIZ UDPGothic","Hiragino Sans",Meiryo,sans-serif; line-height:1.7; }
    a { color: inherit; }
    .ja { color: var(--muted); font-weight: 600; font-size: 0.86em; }
    .page { width:min(1120px, calc(100% - 32px)); margin:0 auto; padding:32px 0 56px; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:18px; margin-bottom:22px; color:var(--muted); font-size:0.9rem; }
    .brand { display:inline-flex; align-items:center; gap:10px; color:var(--ink); font-weight:800; }
    .brand-mark { display:grid; place-items:center; width:36px; height:36px; border-radius:10px; background:var(--teal); color:#fff; }
    .hero { border:1px solid var(--line); border-radius:16px; background:rgba(255,253,247,0.92); box-shadow:var(--shadow); padding:clamp(26px,4vw,44px); margin-bottom:24px; }
    .eyebrow { display:inline-flex; color:var(--teal); font-size:0.78rem; font-weight:900; text-transform:uppercase; }
    h1 { margin:10px 0 12px; font-size:clamp(2rem,5vw,3.4rem); line-height:1.08; }
    .hero p { max-width:60rem; margin:0; color:var(--muted); }
    .summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-bottom:24px; }
    .summary article { padding:18px; border:1px solid var(--line); border-radius:14px; background:var(--surface); }
    .summary span { display:block; color:var(--muted); font-size:0.82rem; font-weight:800; }
    .summary strong { display:block; margin-top:4px; font-size:1.8rem; }
    .day { margin-bottom:30px; }
    .day-head { margin:24px 0 14px; }
    .day-head h2 { margin:2px 0 0; font-size:clamp(1.3rem,3vw,2rem); }
    .cards { display:grid; gap:16px; }
    .card { border:1px solid var(--line); border-radius:16px; background:rgba(255,253,247,0.95); box-shadow:var(--shadow); padding:clamp(18px,3vw,26px); }
    .card header { display:flex; justify-content:space-between; gap:16px; align-items:start; margin-bottom:14px; }
    .card header span { display:block; color:var(--muted); font-size:0.8rem; font-weight:800; }
    .card h3 { margin:3px 0 0; font-size:clamp(1.15rem,2vw,1.5rem); line-height:1.3; }
    .card header > strong { max-width:230px; padding:8px 12px; border-radius:999px; background:rgba(212,155,42,0.14); color:#7b5313; text-align:center; font-size:0.82rem; }
    .rail { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px; margin:0 0 14px; padding:0; list-style:none; }
    .rail li { min-height:74px; padding:12px; border:1px solid var(--line); border-radius:14px; background:var(--surface); }
    .rail li::before { content:""; display:block; width:12px; height:12px; border-radius:999px; margin-bottom:10px; background:#c9c3b6; }
    .rail .is-seen { border-color:rgba(8,115,110,0.38); background:#eef8f4; }
    .rail .is-seen::before { background:var(--teal); }
    .rail span { display:block; font-weight:900; font-size:0.9rem; }
    .rail strong { color:var(--muted); font-size:0.78rem; }
    .steps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .steps article { min-height:150px; padding:16px; border:1px solid var(--line); border-radius:14px; background:#fffaf0; }
    .steps .has { background:#fff; border-color:rgba(44,92,159,0.26); }
    .steps span { color:var(--blue); font-size:0.8rem; font-weight:900; }
    .steps h4 { margin:4px 0 8px; font-size:0.95rem; }
    .steps p { margin:0; color:var(--muted); font-size:0.92rem; }
    .card footer { display:flex; justify-content:space-between; align-items:center; gap:14px; margin-top:16px; color:var(--muted); font-size:0.86rem; }
    .generated { margin-top:28px; color:var(--muted); font-size:0.8rem; text-align:right; }
    @media (max-width:860px) { .summary, .steps { grid-template-columns:1fr; } .rail { grid-template-columns:repeat(2,minmax(0,1fr)); } .card header { flex-direction:column; } .card header > strong { max-width:none; text-align:left; } }
  </style>
</head>
<body>
  <main class="page">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">AI</span> Thinking Harness</div>
      <span>From GitHub Issues / ${escapeHtml(repository)}</span>
    </header>
    <section class="hero">
      <span class="eyebrow">Thinking Journey</span>
      <h1>How my thinking moved <span class="ja">思考の道すじ</span></h1>
      <p>One card per day. Each shows, in my own words, how I went from a question to a guess, to checking, to changing my view, to an insight I can reuse. Not a grade. / 日ごとに1枚。問い→予想→確認→考え直し→気づき→次に使う、の順に思考をたどります。点数ではありません。</p>
    </section>
    <section class="summary">
      <article><span>Days recorded / 記録した日</span><strong>${items.length}</strong></article>
      <article><span>Closed / 完了</span><strong>${closed}</strong></article>
      <article><span>Clear thinking / はっきり読める</span><strong>${readable}</strong></article>
    </section>
    ${dayKeys.length ? dayKeys.map((day) => renderDaySection(day, dayBuckets.get(day))).join("\n") : `<p>No <code>${escapeHtml(showLabel)}</code> issues yet. / 対象Issueがまだありません。</p>`}
    <p class="generated">Generated at ${escapeHtml(new Date().toISOString())}</p>
  </main>
</body>
</html>
`;
}

function escapeMd(value) {
  return String(value || "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function mdValue(value, fallback = "—") {
  return normalize(value) || fallback;
}

function renderMarkdown(items, repository) {
  const closed = items.filter((i) => i.state === "closed").length;
  const readable = items.filter((i) => seenCount(i) >= 5).length;
  const sorted = [...items].sort((a, b) => a.day - b.day || a.number - b.number);

  const overview = [
    "| Item / 項目 | Value / 内容 |",
    "| --- | --- |",
    `| Repository | ${escapeMd(repository)} |`,
    `| Days recorded / 記録した日 | ${items.length} |`,
    `| Closed / 完了 | ${closed} |`,
    `| Clear thinking / はっきり読める | ${readable} |`,
  ].join("\n");

  const rows = [
    "| Day | Issue | Topic / テーマ | Steps seen / 見える段階 | State |",
    "| --- | --- | --- | --- | --- |",
    ...sorted.map((item) => {
      const link = item.url ? `[#${item.number}](${item.url})` : `#${item.number}`;
      const day = item.day ? `Day ${item.day}` : "—";
      const markers = journeySteps(item).filter((s) => hasMeaning(s.value)).map((s) => s.en).join(" / ");
      return `| ${escapeMd(day)} | ${link} | ${escapeMd(item.topic)} | ${escapeMd(markers || "—")} | ${item.state === "closed" ? "Closed" : "Open"} |`;
    }),
  ].join("\n");

  const details = sorted
    .map((item) => {
      const head = item.url ? `[#${item.number} ${item.title}](${item.url})` : `#${item.number} ${item.title}`;
      const journey = journeySteps(item).map((s) => `- ${s.en} / ${s.ja}: ${mdValue(s.value)}`).join("\n");
      return [`## ${head}`, "", `- Day: ${item.day ? `Day ${item.day}` : "—"}`, `- Type: ${item.type}`, `- State: ${item.state === "closed" ? "Closed" : "Open"}`, "", journey].join("\n");
    })
    .join("\n\n");

  return [
    "# Portfolio (Markdown fallback) / ポートフォリオ Markdown版",
    "",
    "Fallback for when GitHub Pages can't publish the HTML. Collected from `portfolio:show` day issues.",
    "GitHub Pagesで公開できない場合のフォールバック。`portfolio:show` の1日Issueを集計。",
    "",
    "## Overview / 概要",
    "",
    overview,
    "",
    "## Day list / 日程一覧",
    "",
    rows,
    "",
    "## Records / 記録",
    "",
    details || "No issues yet. / Issueがまだありません。",
    "",
  ].join("\n");
}

async function main() {
  const repository = detectRepository();
  const token = getGitHubToken();
  const url = `https://api.github.com/repos/${repository}/issues?state=all&labels=${encodeURIComponent(showLabel)}&per_page=100`;
  const issues = await requestAll(url, token);

  const visible = issues.filter((issue) => !issue.pull_request).filter((issue) => !labelNames(issue).includes(hideLabel));

  const items = [];
  for (const issue of visible) {
    const comments = await requestAll(`${issue.comments_url}?per_page=100`, token);
    items.push(parseIssue(issue, comments));
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderHtml(items, repository), "utf8");
  fs.writeFileSync(markdownOutputPath, renderMarkdown(items, repository), "utf8");

  console.log(`Portfolio generated: public/index.html (${items.length} issues)`);
  console.log(`Portfolio Markdown generated: public/portfolio.md`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
