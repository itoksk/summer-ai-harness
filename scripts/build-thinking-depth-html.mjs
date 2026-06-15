// Build a bilingual (EN/JA) "thinking-depth" report for one day, from a GitHub
// issue (--issue N) or a learning-log markdown file (--source path). It reads the
// thinking loop — Question -> Guess -> Checked -> Changed -> Insight -> Next —
// from EN or JA headings and shows how the student's view moved. Not a grade.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const defaultOutputPath = path.join(root, "public", "thinking-depth.html");

let daysConfig = { days: [] };
try {
  daysConfig = JSON.parse(fs.readFileSync(path.join(root, "config/days.json"), "utf8"));
} catch {
  // optional
}

// The six steps of the thinking loop. Each carries bilingual display text and a
// list of heading aliases (EN + JA) used to classify a section heading.
const steps = [
  {
    key: "question",
    ja: "問い",
    en: "Question",
    promptJa: "何を知りたい?",
    promptEn: "What did you want to know?",
    hintJa: "疑問を自分の言葉にできているか。",
    hintEn: "Is the question in your own words?",
    emptyJa: "まだ「何を知りたいか」が一文で残っていません。",
    emptyEn: "The question isn't written in one sentence yet.",
    aliases: ["question", "問い", "問題提起", "figure out", "want to know", "わからな", "わからない"],
  },
  {
    key: "hypothesis",
    ja: "予想",
    en: "My guess",
    promptJa: "自分ではどう考えた?",
    promptEn: "What was your own guess?",
    hintJa: "答えを見る前の予想があるか。",
    hintEn: "Is there a guess from before the answer?",
    emptyJa: "答えを見る前の予想がまだ少ないです。",
    emptyEn: "There isn't much of a guess from before the answer.",
    aliases: ["guess", "hypothesis", "予想", "仮説", "自分で考え", "first guess", "i think"],
  },
  {
    key: "check",
    ja: "確かめ",
    en: "What I checked",
    promptJa: "何を見て確かめた?",
    promptEn: "What did you check?",
    hintJa: "試したこと・根拠が残っているか。",
    hintEn: "Did you record what you tried or your evidence?",
    emptyJa: "何を根拠に確かめたかがまだはっきりしていません。",
    emptyEn: "It's not yet clear what you checked it against.",
    aliases: ["checked", "check", "確かめ", "確認", "tried", "根拠"],
  },
  {
    key: "shift",
    ja: "考え直し",
    en: "What changed",
    promptJa: "どこを直した?",
    promptEn: "Where did your view move?",
    hintJa: "最初の考えからどこを直したか。",
    hintEn: "What moved from your first guess?",
    emptyJa: "最初の考えから、どこを直したのかがまだ読み取りにくいです。",
    emptyEn: "It's hard to see what moved from your first guess.",
    aliases: ["changed", "考えが変", "考え直", "思考の変化", "rethink", "differently", "what changed"],
  },
  {
    key: "insight",
    ja: "気づき",
    en: "Insight",
    promptJa: "何がわかった?",
    promptEn: "What did you learn?",
    hintJa: "自分で説明できるようになったことがあるか。",
    hintEn: "Is there something you can now explain yourself?",
    emptyJa: "新しく説明できるようになったことを、もう一文残すとよくなります。",
    emptyEn: "Add one more sentence about what you can now explain.",
    aliases: ["learned", "insight", "気づき", "わかったこと", "得た知見", "なるほど", "i can now"],
  },
  {
    key: "future",
    ja: "次に使う",
    en: "Next",
    promptJa: "次は何に使う?",
    promptEn: "How will you use it next?",
    hintJa: "次に似た問題で使う見分け方や復習があるか。",
    hintEn: "Is there a way to use this on the next problem?",
    emptyJa: "次に似た問題で使う見分け方や復習予定がまだ少ないです。",
    emptyEn: "There isn't much yet about using this next time.",
    aliases: ["next", "次に", "次回", "use this", "will check", "判断基準", "復習", "avoid it next"],
  },
];

const stages = [
  {
    titleJa: "材料を集める",
    titleEn: "Gathering material",
    shortJa: "まだ準備中",
    shortEn: "Getting started",
    descJa: "学習の記録はありますが、何を考えたかを読む材料がまだ少ない状態です。",
    descEn: "There's a record, but not much yet to read your thinking from.",
    nextJa: "何が知りたいかを一文で書きます。",
    nextEn: "Write what you want to know in one sentence.",
  },
  {
    titleJa: "記録する",
    titleEn: "Recording",
    shortJa: "学びを残した",
    shortEn: "Kept a record",
    descJa: "学んだことや困ったことを、あとから読める形で残せています。",
    descEn: "You've kept what you learned in a readable form.",
    nextJa: "わからなかったことを問いの形にします。",
    nextEn: "Turn what you didn't understand into a question.",
  },
  {
    titleJa: "問いを立てる",
    titleEn: "Asking a question",
    shortJa: "疑問が見える",
    shortEn: "Question is clear",
    descJa: "何を知りたいのかが、自分の言葉で見えています。",
    descEn: "What you want to know is clear, in your own words.",
    nextJa: "答えを聞く前に、自分の予想を書きます。",
    nextEn: "Write your own guess before hearing the answer.",
  },
  {
    titleJa: "予想する",
    titleEn: "Making a guess",
    shortJa: "自分の考えがある",
    shortEn: "Has own guess",
    descJa: "答えを待つ前に、自分なりの見方や仮説を出せています。",
    descEn: "You put out your own guess before the answer.",
    nextJa: "根拠や例を使って予想を確かめます。",
    nextEn: "Check your guess with evidence or an example.",
  },
  {
    titleJa: "考え直す",
    titleEn: "Rethinking",
    shortJa: "見方を動かした",
    shortEn: "Moved your view",
    descJa: "確かめたことをもとに、最初の考えを直したり、より正確にしています。",
    descEn: "You moved or sharpened your first guess after checking.",
    nextJa: "何がわかったのかを短くまとめます。",
    nextEn: "Sum up what you now understand.",
  },
  {
    titleJa: "つなげて説明する",
    titleEn: "Explaining it",
    shortJa: "説明にできた",
    shortEn: "Can explain it",
    descJa: "問い・予想・確認・気づきがつながり、自分の言葉で説明できています。",
    descEn: "Question, guess, check and insight connect into your own explanation.",
    nextJa: "次に似た問題を見たときの見分け方を作ります。",
    nextEn: "Make a way to spot this on the next problem.",
  },
  {
    titleJa: "次に使える形にする",
    titleEn: "Ready to reuse",
    shortJa: "知見化できた",
    shortEn: "Turned into a tool",
    descJa: "今回の学びを、次の問題でも使える判断基準にできています。",
    descEn: "You turned this into something you can reuse next time.",
    nextJa: "確認問題や次の問いを決め、次回も使えるか試します。",
    nextEn: "Pick a next question and test whether it still works.",
  },
];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function normalize(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function normalizeHeading(value) {
  return normalize(value).replace(/\s+/g, "").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\[[ xX]\]\s*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMarkdown(value, maxLength = 220) {
  const compact = stripMarkdown(value);
  if (compact.length <= maxLength) return compact;
  const slice = compact.slice(0, maxLength);
  // End cleanly: prefer a sentence boundary, else a word boundary, never mid-word.
  const sentenceEnd = Math.max(
    slice.lastIndexOf("。"), slice.lastIndexOf("、"),
    slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?"),
    slice.lastIndexOf("！"), slice.lastIndexOf("？"),
  );
  if (sentenceEnd >= maxLength * 0.6) return `${slice.slice(0, sentenceEnd + 1).trim()}…`;
  const spaceEnd = slice.lastIndexOf(" ");
  const cut = spaceEnd >= maxLength * 0.6 ? slice.slice(0, spaceEnd) : slice.slice(0, maxLength - 1);
  return `${cut.trim()}…`;
}

function cleanHeadingTitle(value) {
  return value.replace(/\s+#+$/g, "").trim();
}

function extractSectionEntries(markdown) {
  const text = normalize(markdown);
  const headingPattern = /^(#{1,3})\s+(.+?)\s*$/gm;
  const matches = [...text.matchAll(headingPattern)];
  return matches
    .map((current, index) => {
      const next = matches[index + 1];
      const title = cleanHeadingTitle(current[2]);
      const start = current.index + current[0].length;
      const end = next ? next.index : text.length;
      return { title, body: text.slice(start, end).trim() };
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
  const text = stripMarkdown(value);
  return Boolean(text);
}

function phaseStrength(rawText) {
  const text = stripMarkdown(rawText);
  if (!text) return 0;
  const sentenceCount = text.split(/[。！？.!?]+/).filter((item) => item.trim()).length;
  const hasReasoningWords =
    /(なぜ|理由|根拠|確認|比較|反例|つまり|一方|しかし|だから|次に|判断|具体|例えば|見方|変わ)/.test(text) ||
    /(because|reason|evidence|check|compare|but|however|so |then|next|for example|realised|realized|changed)/i.test(text);
  if (text.length >= 140 || (sentenceCount >= 3 && hasReasoningWords)) return 3;
  if (text.length >= 50 || sentenceCount >= 2 || hasReasoningWords) return 2;
  return 1;
}

function strengthLabel(strength) {
  if (strength >= 3) return { ja: "はっきり見える", en: "clear" };
  if (strength === 2) return { ja: "見える", en: "visible" };
  if (strength === 1) return { ja: "少し見える", en: "faint" };
  return { ja: "これから", en: "not yet" };
}

function strengthWidth(strength) {
  return [8, 38, 68, 100][strength] ?? 8;
}

function splitItems(value, maxItems = 4) {
  const text = normalize(value);
  if (!text) return [];
  const bulletItems = text
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter((line) => line && line !== text && !line.startsWith("<!--"));
  const source = bulletItems.length > 1 ? bulletItems : stripMarkdown(text).split(/[。！？!?]+/);
  return source
    .map((item) => compactMarkdown(item, 110))
    .filter(Boolean)
    .slice(0, maxItems);
}

function listMarkdownFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== ".gitkeep")
    .map((entry) => path.join(relativeDir, entry.name).replaceAll("\\", "/"));
}

function newestMarkdownFile() {
  const candidates = listMarkdownFiles("learning-log");
  if (!candidates.length) return "";
  return candidates
    .map((relativePath) => ({
      relativePath,
      mtime: fs.statSync(path.join(root, relativePath)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)[0].relativePath;
}

function extractTitle(markdown, fallback) {
  const match = normalize(markdown).match(/^#\s+(.+?)\s*$/m);
  return compactMarkdown(match?.[1] ?? fallback, 110);
}

function loadFileSource(sourcePath) {
  const absolutePath = path.resolve(root, sourcePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Source markdown not found: ${sourcePath}`);
  }
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");
  return {
    kind: "file",
    sourceLabel: relativePath,
    title: extractTitle(markdown, "Learning log"),
    labels: [],
    markdown,
  };
}

function githubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
}

function nextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

async function githubRequest(url, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "summer-ai-study-harness",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}\n${text}`);
  }
  return response;
}

async function githubRequestAll(url, token) {
  const results = [];
  let next = url;
  while (next) {
    const response = await githubRequest(next, token);
    results.push(...(await response.json()));
    next = nextLink(response.headers.get("link"));
  }
  return results;
}

function buildIssueSource(issue, comments) {
  const commentMarkdown = comments
    .map((comment, index) => `## Comment ${index + 1}\n\n${comment.body ?? ""}`)
    .join("\n\n");
  const labels = (issue.labels ?? []).map((label) => (typeof label === "string" ? label : label.name));
  const markdown = [issue.body ?? "", commentMarkdown].filter(Boolean).join("\n\n");
  return {
    kind: "issue",
    sourceLabel: `Issue #${issue.number}`,
    title: issue.title,
    url: issue.html_url ?? issue.url,
    issueNumber: issue.number,
    labels,
    markdown,
  };
}

async function loadIssueSourceFromApi(issueNumber) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return null;
  const token = githubToken();
  const issue = await (await githubRequest(`https://api.github.com/repos/${repository}/issues/${issueNumber}`, token)).json();
  const comments = await githubRequestAll(issue.comments_url, token);
  return buildIssueSource(issue, comments);
}

function loadIssueSource(issueNumber) {
  let json;
  try {
    json = execFileSync(
      "gh",
      ["issue", "view", String(issueNumber), "--json", "number,title,body,comments,labels,state,url"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    throw new Error(`Issue #${issueNumber} could not be loaded with GitHub CLI. ${error.message}`);
  }
  const issue = JSON.parse(json);
  return buildIssueSource({ ...issue, html_url: issue.url }, issue.comments ?? []);
}

async function loadSource(args) {
  if (args.issue) return (await loadIssueSourceFromApi(args.issue)) ?? loadIssueSource(args.issue);
  if (args.source) return loadFileSource(args.source);
  const latest = newestMarkdownFile();
  if (!latest) {
    return {
      kind: "empty",
      sourceLabel: "No record yet / 記録なし",
      title: "No day record yet / まだその日の記録がありません",
      labels: [],
      markdown: `# No day record yet / まだその日の記録がありません\n\n## Question / 問い\n\nCreate a day reflection issue and this page will show your thinking. / 1日のIssueを作るとここに思考が表示されます。`,
    };
  }
  return loadFileSource(latest);
}

function dayFromLabels(labels) {
  const day = labels.find((l) => /^day:\d$/.test(l))?.split(":")[1];
  if (!day) return null;
  const dayEntry = daysConfig.days?.find((d) => String(d.day) === day);
  return {
    day,
    dayTitle: dayEntry?.title ?? null,
  };
}

function determineStage(stepModels, hasBasicRecord) {
  const strengthOf = (key) => stepModels.find((s) => s.key === key)?.strength ?? 0;
  const has = (key) => strengthOf(key) > 0;
  let level = hasBasicRecord || stepModels.some((s) => s.strength > 0) ? 1 : 0;
  if (has("question")) level = Math.max(level, 2);
  if (has("question") && has("hypothesis")) level = Math.max(level, 3);
  if ((has("shift") || has("check") || has("future")) && (has("question") || has("hypothesis"))) level = Math.max(level, 4);
  if (has("insight") && (has("shift") || has("hypothesis") || has("future"))) level = Math.max(level, 5);
  if (has("insight") && has("future") && has("check")) level = Math.max(level, 6);
  return { level, ...stages[level] };
}

function buildReportModel(source) {
  const entries = extractSectionEntries(source.markdown);
  const byKey = new Map(steps.map((step) => [step.key, []]));
  for (const entry of entries) {
    const key = matchStepKey(entry.title);
    if (!key || !byKey.has(key)) continue;
    if (hasMeaning(entry.body)) byKey.get(key).push(entry.body);
  }

  const stepModels = steps.map((step) => {
    const raw = byKey.get(step.key).join("\n\n");
    const strength = phaseStrength(raw);
    return {
      ...step,
      raw,
      text: compactMarkdown(raw || (step.emptyEn), 220),
      strength,
      status: strengthLabel(strength),
      width: strengthWidth(strength),
      items: splitItems(raw, 3),
    };
  });

  const get = (key) => stepModels.find((s) => s.key === key);
  const dayInfo = dayFromLabels(source.labels ?? []);

  const question = compactMarkdown(get("question").raw, 240);
  const before = compactMarkdown(get("hypothesis").raw || get("question").raw, 240);
  const after = compactMarkdown(get("shift").raw || get("insight").raw || get("future").raw, 240);
  const actionItems = [
    ...splitItems(get("future").raw, 3),
    ...splitItems(get("check").raw, 2),
  ].slice(0, 5);

  const hasBasic = Boolean(question) || stepModels.some((s) => s.strength > 0);
  const stage = determineStage(stepModels, hasBasic);

  return {
    title: compactMarkdown(source.title || extractTitle(source.markdown, "Day report"), 110),
    dayInfo,
    question,
    before,
    after,
    actionItems,
    steps: stepModels,
    stage,
    source,
    generatedAt: new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };
}

function bi(jaText, enText) {
  return `${escapeHtml(enText)} <span class="ja">${escapeHtml(jaText)}</span>`;
}

function renderStagePath(stage) {
  return `
    <ol class="stage-path" aria-label="Thinking path / 思考の道すじ">
      ${stages
        .map((item, index) => {
          const state = index < stage.level ? "is-done" : index === stage.level ? "is-current" : "";
          return `
            <li class="${state}">
              <span class="stage-dot" aria-hidden="true"></span>
              <strong>${escapeHtml(item.titleEn)}</strong>
              <small>${escapeHtml(item.titleJa)}</small>
            </li>`;
        })
        .join("")}
    </ol>`;
}

function renderStepCards(stepModels) {
  return `
    <div class="phase-grid">
      ${stepModels
        .map(
          (step) => `
            <article class="phase-card ${step.strength > 0 ? "has-evidence" : "is-empty"}">
              <div class="phase-card__head">
                <span>${escapeHtml(step.en)} / ${escapeHtml(step.ja)}</span>
                <b>${escapeHtml(step.status.en)}</b>
              </div>
              <h3>${escapeHtml(step.promptEn)}<br><small>${escapeHtml(step.promptJa)}</small></h3>
              <p>${escapeHtml(step.strength > 0 ? step.text : `${step.emptyEn} ${step.emptyJa}`)}</p>
              <div class="evidence-meter"><i style="width:${step.width}%"></i></div>
              <small>${escapeHtml(step.hintEn)} / ${escapeHtml(step.hintJa)}</small>
            </article>`,
        )
        .join("")}
    </div>`;
}

function renderLoop(stepModels) {
  return `
    <section class="loop-board" aria-label="Learning loop / 思考の一周">
      <div class="section-head">
        <div>
          <span class="eyebrow">Learning Loop</span>
          <h2>How the thinking moved <span class="ja">考えの進み方</span></h2>
        </div>
        <p>Question -> Guess -> Checked -> Changed -> Insight -> Next, read from the issue. / 問い→予想→確認→考え直し→気づき→次に使う、をIssueから拾います。</p>
      </div>
      <ol class="loop-steps">
        ${stepModels
          .map(
            (step, index) => `
              <li class="${step.items.length ? "has-evidence" : "is-empty"}">
                <span class="loop-index">${index + 1}</span>
                <div>
                  <small>${escapeHtml(step.status.en)} / ${escapeHtml(step.status.ja)}</small>
                  <h3>${escapeHtml(step.en)} / ${escapeHtml(step.ja)} <em>${escapeHtml(step.promptEn)}</em></h3>
                  <p>${escapeHtml(step.items.length ? step.items.join(" / ") : `${step.emptyEn} ${step.emptyJa}`)}</p>
                </div>
              </li>`,
          )
          .join("")}
      </ol>
    </section>`;
}

function renderBeforeAfter(model) {
  return `
    <section class="change-board" aria-label="Change / 思考の変化">
      <article>
        <span>Before</span>
        <h2>First view <span class="ja">最初の見方</span></h2>
        <p>${escapeHtml(model.before || "Not recorded yet. / まだ記録されていません。")}</p>
      </article>
      <div class="change-arrow" aria-hidden="true">&rarr;</div>
      <article class="after">
        <span>After</span>
        <h2>View now <span class="ja">今の見方</span></h2>
        <p>${escapeHtml(model.after || "Add one more sentence about how your view changed. / 見方がどう変わったか、もう一文足すとよくなります。")}</p>
      </article>
    </section>`;
}

function renderActionList(items, fallback) {
  const values = items.length ? items : [fallback];
  return `<ul class="action-list">${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function dayBadge(dayInfo) {
  if (!dayInfo) return "";
  const dayTitle = dayInfo.dayTitle ? `${dayInfo.dayTitle.en} / ${dayInfo.dayTitle.jp}` : "";
  return `<span>Day ${escapeHtml(dayInfo.day ?? "?")}${dayTitle ? ` — ${escapeHtml(dayTitle)}` : ""}</span>`;
}

function renderHtml(model) {
  const sourceLink = model.source.url
    ? `<a href="${escapeHtml(model.source.url)}">${escapeHtml(model.source.sourceLabel)}</a>`
    : `<span>${escapeHtml(model.source.sourceLabel)}</span>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thinking-depth report / 思考深化レポート</title>
  <style>
    :root {
      color-scheme: light;
      --paper: #fbf8ef; --surface: #fffdf8; --surface-soft: #f0f7f2;
      --ink: #202426; --muted: #5b6267; --line: #d9d2c3;
      --blue: #2858a6; --teal: #08736e; --green: #507b3a;
      --yellow: #f2c94c; --orange: #d97732;
      --shadow: 0 18px 45px rgba(32, 36, 38, 0.13);
    }
    * { box-sizing: border-box; }
    /* Long words / pasted URLs wrap instead of spilling out of their card. */
    p, h1, h2, h3, li, em, b, strong, small, span, a { overflow-wrap: anywhere; word-break: normal; }
    body {
      margin: 0; color: var(--ink);
      background:
        linear-gradient(90deg, rgba(40, 88, 166, 0.06) 1px, transparent 1px) 0 0 / 44px 44px,
        linear-gradient(rgba(8, 115, 110, 0.05) 1px, transparent 1px) 0 0 / 44px 44px,
        var(--paper);
      font-family: "Inter", "Helvetica Neue", "BIZ UDPGothic", "Hiragino Sans", Meiryo, sans-serif;
      line-height: 1.7;
    }
    a { color: inherit; }
    .ja { color: var(--muted); font-weight: 600; font-size: 0.86em; }
    .page { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 56px; }
    .topbar { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 22px; color: var(--muted); font-size: 0.88rem; }
    .brand { display: inline-flex; gap: 10px; align-items: center; color: var(--ink); font-weight: 800; }
    .brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px; background: var(--teal); color: #fff; }
    .hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr); gap: 22px; align-items: stretch; margin-bottom: 24px; }
    .hero-main, .stage-card, .phase-card, .loop-board, .change-board article, .next-card, .teacher-note {
      border: 1px solid var(--line); background: var(--surface); border-radius: 22px; box-shadow: var(--shadow);
    }
    .hero-main { padding: 34px; min-height: 300px; display: grid; align-content: space-between; gap: 22px; border-top: 7px solid var(--blue); }
    .eyebrow { display: inline-flex; gap: 9px; align-items: center; color: var(--teal); font-size: 0.82rem; font-weight: 800; text-transform: uppercase; }
    .eyebrow::before { content: ""; width: 28px; height: 3px; border-radius: 999px; background: var(--teal); }
    h1, h2, h3, p { margin: 0; }
    h1 { margin-top: 12px; max-width: 18em; overflow-wrap: anywhere; font-size: clamp(1.7rem, 3vw, 2.6rem); line-height: 1.14; }
    .hero-main p, .stage-card p, .phase-card p, .loop-steps p, .change-board p, .teacher-note p { color: var(--muted); }
    .meta-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .meta-row span, .meta-row a { display: inline-flex; align-items: center; min-height: 32px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 999px; background: #f5f0e4; color: var(--muted); font-size: 0.82rem; text-decoration: none; }
    .stage-card { padding: 28px; display: grid; gap: 16px; }
    .stage-card__label { color: var(--orange); font-weight: 800; font-size: 0.82rem; }
    .stage-card strong { display: block; font-size: clamp(1.5rem, 3vw, 2.3rem); line-height: 1.18; color: var(--blue); }
    .stage-card .sub { color: var(--muted); font-size: 0.95rem; }
    .stage-path { list-style: none; display: grid; gap: 10px; margin: 0; padding: 0; }
    .stage-path li { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 9px 10px; align-items: center; color: var(--muted); }
    .stage-path strong, .stage-path small { display: block; grid-column: 2; }
    .stage-path strong { color: inherit; font-size: 0.92rem; }
    .stage-path small { margin-top: -9px; font-size: 0.74rem; }
    .stage-dot { grid-row: span 2; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #cfc7b8; background: var(--surface); }
    .stage-path .is-done, .stage-path .is-current { color: var(--ink); }
    .stage-path .is-done .stage-dot { border-color: var(--teal); background: var(--teal); }
    .stage-path .is-current .stage-dot { border-color: var(--orange); background: var(--yellow); box-shadow: 0 0 0 6px rgba(242, 201, 76, 0.24); }
    .section-head { display: flex; justify-content: space-between; gap: 18px; align-items: end; margin: 34px 0 14px; }
    .section-head h2 { font-size: clamp(1.3rem, 2.5vw, 1.9rem); line-height: 1.2; }
    .section-head p { max-width: 560px; color: var(--muted); font-size: 0.95rem; }
    .phase-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .phase-card { padding: 20px; display: grid; gap: 12px; min-height: 240px; box-shadow: 0 10px 28px rgba(32, 36, 38, 0.1); }
    .phase-card.has-evidence { border-top: 6px solid var(--teal); }
    .phase-card.is-empty { border-style: dashed; background: #f7f1e5; box-shadow: none; }
    .phase-card__head { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
    .phase-card__head span { color: var(--blue); font-size: 0.8rem; font-weight: 800; }
    .phase-card__head b { padding: 4px 9px; border-radius: 999px; background: var(--surface-soft); color: var(--green); font-size: 0.74rem; }
    .phase-card h3 { font-size: 1.1rem; line-height: 1.3; }
    .phase-card h3 small { color: var(--muted); font-weight: 600; font-size: 0.8rem; }
    .phase-card small { color: var(--muted); font-size: 0.78rem; }
    .evidence-meter { height: 12px; overflow: hidden; border-radius: 999px; background: #e3dbcb; }
    .evidence-meter i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--teal), var(--yellow), var(--orange)); }
    .loop-board { margin-top: 18px; padding: 24px; box-shadow: 0 10px 28px rgba(32, 36, 38, 0.1); }
    .loop-board .section-head { margin: 0 0 18px; }
    .loop-steps { list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; }
    .loop-steps li { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 12px; padding: 16px; border: 1px solid var(--line); border-radius: 16px; background: #fffaf0; }
    .loop-steps li.has-evidence { border-left: 6px solid var(--teal); }
    .loop-steps li.is-empty { border-style: dashed; background: #f7f1e5; }
    .loop-index { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 999px; background: var(--blue); color: #fff; font-weight: 900; }
    .loop-steps small { color: var(--green); font-size: 0.74rem; font-weight: 800; }
    .loop-steps h3 { margin: 2px 0 6px; font-size: 1rem; line-height: 1.35; }
    .loop-steps h3 em { display: block; color: var(--muted); font-size: 0.82rem; font-style: normal; font-weight: 700; }
    .change-board { display: grid; grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr); gap: 16px; align-items: stretch; margin-top: 18px; }
    .change-board article { padding: 24px; box-shadow: 0 10px 28px rgba(32, 36, 38, 0.1); }
    .change-board .after { border-top: 6px solid var(--orange); background: #fff9e8; }
    .change-board span { display: block; margin-bottom: 8px; color: var(--teal); font-weight: 800; font-size: 0.78rem; }
    .change-board h2 { margin-bottom: 10px; font-size: 1.2rem; }
    .change-arrow { display: grid; place-items: center; width: 54px; min-height: 100%; border-radius: 18px; background: var(--blue); color: #fff; font-size: 1.6rem; font-weight: 900; }
    .next-card { margin-top: 16px; padding: 24px; border-left: 7px solid var(--green); }
    .next-card h2 { margin-bottom: 12px; font-size: 1.3rem; }
    .action-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
    .action-list li { position: relative; padding: 12px 14px 12px 42px; border-radius: 14px; background: var(--surface-soft); }
    .action-list li::before { content: "\\2713"; position: absolute; left: 14px; top: 12px; color: var(--green); font-weight: 900; }
    .teacher-note { margin-top: 18px; padding: 22px; display: grid; grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr); gap: 18px; background: #eef6fb; box-shadow: none; }
    footer { margin-top: 34px; color: var(--muted); font-size: 0.82rem; text-align: center; }
    /* Cap how much text a card shows so heights stay tidy; full text lives in the issue. */
    .phase-card p, .change-board p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 9; line-clamp: 9; overflow: hidden; }
    .loop-steps p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; line-clamp: 6; overflow: hidden; }
    @media (max-width: 860px) {
      .hero, .phase-grid, .loop-steps, .change-board, .teacher-note { grid-template-columns: 1fr; }
      .change-arrow { width: 100%; min-height: 48px; transform: rotate(90deg); }
      .section-head { display: grid; align-items: start; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">AI</span><span>AI Course · Thinking Harness</span></div>
      <div>Generated / 生成: ${escapeHtml(model.generatedAt)}</div>
    </header>

    <section class="hero">
      <div class="hero-main">
        <div>
          <span class="eyebrow">Thinking-depth report / 思考深化レポート</span>
          <h1>${escapeHtml(model.title)}</h1>
        </div>
        <p>${escapeHtml(model.question || "This page shows how your thinking moved in one day — not a grade. / このページは1日で考えがどう動いたかを示します。点数ではありません。")}</p>
        <div class="meta-row">
          ${dayBadge(model.dayInfo)}
          ${sourceLink}
          <span>Not a grade / 点数ではない</span>
        </div>
      </div>
      <aside class="stage-card">
        <div>
          <span class="stage-card__label">Where you are now / 今の現在地</span>
          <strong>${escapeHtml(model.stage.titleEn)}</strong>
          <span class="sub">${escapeHtml(model.stage.titleJa)}</span>
        </div>
        <p>${escapeHtml(model.stage.descEn)}<br><span class="ja">${escapeHtml(model.stage.descJa)}</span></p>
        ${renderStagePath(model.stage)}
      </aside>
    </section>

    <section>
      <div class="section-head">
        <div>
          <span class="eyebrow">Route Map</span>
          <h2>How clearly each step shows <span class="ja">各ステップの見え方</span></h2>
        </div>
        <p>The bar is not a score. It shows how clearly that step can be read from your record. / 棒は点数ではなく、その考えが記録からどれだけ読めるかです。</p>
      </div>
      ${renderStepCards(model.steps)}
    </section>

    ${renderLoop(model.steps)}

    ${renderBeforeAfter(model)}

    <section class="next-card">
      <h2>What to use next / 次に使えること</h2>
      ${renderActionList(model.actionItems, `${model.stage.nextEn} / ${model.stage.nextJa}`)}
    </section>

    <section class="teacher-note">
      <div>
        <span class="eyebrow">How to read</span>
        <h2>Reading this page <span class="ja">読み方</span></h2>
      </div>
      <p>This is not a test score. It follows, in the student's own words, what they wondered, guessed, checked, changed, and turned into something reusable. / これはテストの点数ではありません。本人の言葉から、問い・予想・確認・考え直し・次に使うことをたどるページです。</p>
    </section>

    <footer>Generated from ${escapeHtml(model.source.sourceLabel)} · local learning artifact / ローカルの学習成果物</footer>
  </main>
</body>
</html>
`;
}

function markdownValue(value, fallback = "—") {
  return normalize(value) || fallback;
}

function escapeMarkdownTable(value) {
  return String(value || "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function renderMarkdown(model) {
  const sourceLine = model.source.url ? `[${model.source.sourceLabel}](${model.source.url})` : model.source.sourceLabel;
  const stepRows = [
    "| Step / ステップ | Visible / 見え方 | Content / 内容 |",
    "| --- | --- | --- |",
    ...model.steps.map(
      (step) =>
        `| ${escapeMarkdownTable(`${step.en} / ${step.ja}`)} | ${escapeMarkdownTable(step.status.en)} | ${escapeMarkdownTable(step.strength > 0 ? step.text : "—")} |`,
    ),
  ].join("\n");
  const actionItems = model.actionItems.length
    ? model.actionItems.map((item) => `- ${item}`).join("\n")
    : `- ${model.stage.nextEn} / ${model.stage.nextJa}`;
  const badge = model.dayInfo ? `Day ${model.dayInfo.day}` : "—";

  return [
    `# Thinking-depth report / 思考深化レポート: ${model.title}`,
    "",
    "Markdown fallback for when GitHub Pages can't publish the HTML. / Pagesで公開できない場合のMarkdown版です。",
    "",
    "## Overview / 概要",
    "",
    `- Source / 生成元: ${sourceLine}`,
    `- Day / 日: ${badge}`,
    `- Generated / 生成日時: ${model.generatedAt}`,
    `- Stage / 現在地: ${model.stage.titleEn} / ${model.stage.titleJa}`,
    `- Question / 問い: ${markdownValue(model.question)}`,
    "",
    "## How the thinking moved / 考えの進み方",
    "",
    stepRows,
    "",
    "## Change / 変化",
    "",
    `- Before / 最初: ${markdownValue(model.before)}`,
    `- After / 後から: ${markdownValue(model.after)}`,
    "",
    "## What to use next / 次に使えること",
    "",
    actionItems,
    "",
  ].join("\n");
}

function writeReport(content, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");
}

const args = parseArgs(process.argv.slice(2));
const source = await loadSource(args);
const model = buildReportModel(source);
const outputPath = path.resolve(root, args.out || defaultOutputPath);
const markdownOutputPath = args["markdown-out"] ? path.resolve(root, args["markdown-out"]) : "";

writeReport(renderHtml(model), outputPath);
if (markdownOutputPath) writeReport(renderMarkdown(model), markdownOutputPath);

console.log(`Thinking-depth HTML generated: ${path.relative(root, outputPath).replaceAll("\\", "/")}`);
if (markdownOutputPath) {
  console.log(`Thinking-depth Markdown generated: ${path.relative(root, markdownOutputPath).replaceAll("\\", "/")}`);
}
console.log(`Source: ${source.sourceLabel}`);
