import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "LICENSE",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/day-reflection.yml",
  ".github/ISSUE_TEMPLATE/question.yml",
  ".github/ISSUE_TEMPLATE/stuck-or-broke.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/workflows/portfolio.yml",
  ".github/workflows/quality.yml",
  ".github/workflows/day-labeler.yml",
  ".github/workflows/labels.yml",
  "config/labels.json",
  "config/days.json",
  "docs/day-map.md",
  "docs/using-local-llm.md",
  "docs/reflection-template.md",
  "docs/insight-capture-checklist.md",
  "docs/review-checklist.md",
  "docs/labels.md",
  "prompts/day-reflection.md",
  "prompts/socratic-tutor.md",
  "prompts/stuck-helper.md",
  "goals/course-goals.md",
  "scripts/sync-labels.mjs",
  "scripts/new-day-issue.mjs",
  "scripts/build-portfolio.mjs",
  "scripts/build-thinking-depth-html.mjs",
  "scripts/check-harness.mjs",
];

// Canonical EN headings of the thinking loop (the JA part may follow after "/").
const loopHeadingsEn = [
  "Question",
  "My first guess",
  "What I checked",
  "What changed",
  "Insight",
  "How I'll use this next",
];

const requiredReflectionHeadings = [
  "## What I did today / 今日やったこと",
  "## My guesses (from my notes) / 予想（メモから）",
  "## What I checked / 確かめたこと",
  "## What changed / 考えが変わったところ",
  "## Insight / 気づき",
  "## How I'll use this next / 次にどう使うか",
];

const requiredPrHeadings = [
  "## Related issue / 関連Issue",
  "## What I checked / 確かめたこと",
  "## What changed in my thinking / 考えが変わったところ",
  "Closes #",
];

const requiredAgentsPhrases = [
  "start today's reflection",
  "After merging to `main`",
  "thinking partner",
  "npm run new:day",
  "day:",
];

const requiredReadmePhrases = [
  "npm run new:day",
  "After merging to `main`",
  "GitHub Actions",
];

const requiredPortfolioWorkflowPhrases = [
  "issues:",
  "closed",
  "Resolve thinking-depth issue",
  "Build thinking-depth report",
  "deploy-pages",
];

const requiredLicensePhrases = ["MIT License", "Keisuke Ito"];

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readFile(relativePath) {
  return fs.readFileSync(fullPath(relativePath), "utf8");
}

function fileExists(relativePath) {
  return fs.existsSync(fullPath(relativePath));
}

function listFiles(relativeDir, extension) {
  const dir = fullPath(relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(relativeDir, entry.name).replaceAll("\\", "/"));
}

function listFilesRecursive(relativeDir, extension) {
  const dir = fullPath(relativeDir);
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) results.push(...listFilesRecursive(relativePath, extension));
    else if (entry.isFile() && entry.name.endsWith(extension)) results.push(relativePath);
  }
  return results;
}

function assertIncludes(relativePath, content, expected) {
  for (const item of expected) {
    if (!content.includes(item)) {
      errors.push(`${relativePath}: missing required content: ${item}`);
    }
  }
}

function checkRequiredFiles() {
  for (const relativePath of requiredFiles) {
    if (!fileExists(relativePath)) errors.push(`missing required file: ${relativePath}`);
  }
}

function parseYamlFile(relativePath) {
  try {
    return YAML.parse(readFile(relativePath));
  } catch (error) {
    errors.push(`${relativePath}: invalid YAML: ${error.message}`);
    return null;
  }
}

function checkYamlSyntax() {
  for (const relativePath of listFilesRecursive(".github", ".yml")) parseYamlFile(relativePath);
}

function checkIssueTemplates() {
  const templates = listFiles(".github/ISSUE_TEMPLATE", ".yml").filter((p) => !p.endsWith("config.yml"));

  for (const relativePath of templates) {
    const parsed = parseYamlFile(relativePath);
    if (!parsed || typeof parsed !== "object") {
      errors.push(`${relativePath}: YAML must parse to an object`);
      continue;
    }

    for (const key of ["name", "description", "title", "labels", "body"]) {
      if (!(key in parsed)) errors.push(`${relativePath}: missing top-level key: ${key}`);
    }

    if (!Array.isArray(parsed.labels) || parsed.labels.length === 0) {
      errors.push(`${relativePath}: labels must be a non-empty array`);
    } else {
      const count = (prefix) => parsed.labels.filter((l) => l.startsWith(prefix)).length;
      if (count("type:") !== 1) errors.push(`${relativePath}: labels must include exactly one type:* label`);
      if (count("status:") !== 1) errors.push(`${relativePath}: labels must include exactly one status:* label`);
      if (count("portfolio:") !== 1) errors.push(`${relativePath}: labels must include exactly one portfolio:* label`);
      if (parsed.labels.includes("portfolio:show") && parsed.labels.includes("portfolio:hide")) {
        errors.push(`${relativePath}: labels must not include both portfolio:show and portfolio:hide`);
      }
    }

    if (!Array.isArray(parsed.body) || parsed.body.length === 0) {
      errors.push(`${relativePath}: body must be a non-empty array`);
      continue;
    }

    // Every template must collect the Day so it can be filtered/collected.
    const ids = parsed.body.filter((item) => item && typeof item === "object").map((item) => item.id);
    if (!ids.includes("day")) errors.push(`${relativePath}: body must include a field with id "day"`);
  }
}

function checkLabelConfig() {
  let labels;
  try {
    labels = JSON.parse(readFile("config/labels.json"));
  } catch (error) {
    errors.push(`config/labels.json: invalid JSON: ${error.message}`);
    return;
  }
  if (!Array.isArray(labels) || labels.length === 0) {
    errors.push("config/labels.json: must be a non-empty array");
    return;
  }
  const seen = new Set();
  for (const [index, label] of labels.entries()) {
    if (!label || typeof label !== "object") {
      errors.push(`config/labels.json: label[${index}] must be an object`);
      continue;
    }
    for (const key of ["name", "description", "color"]) {
      if (!label[key]) errors.push(`config/labels.json: label[${index}] missing ${key}`);
    }
    if (seen.has(label.name)) errors.push(`config/labels.json: duplicate label ${label.name}`);
    seen.add(label.name);
    if (label.color && !/^[0-9a-fA-F]{6}$/.test(label.color)) {
      errors.push(`config/labels.json: invalid color for ${label.name}`);
    }
  }

  // The day label family must exist (the harness is built around it).
  for (const n of [1, 2, 3, 4, 5]) {
    if (!seen.has(`day:${n}`)) errors.push(`config/labels.json: missing label day:${n}`);
  }
  // The harness moved to a per-day model: koma labels must NOT exist.
  for (const n of [1, 2, 3]) {
    if (seen.has(`koma:${n}`)) errors.push(`config/labels.json: koma:${n} must be removed (per-day model)`);
  }
  if (!seen.has("portfolio:show") || !seen.has("portfolio:hide")) {
    errors.push("config/labels.json: portfolio:show and portfolio:hide are required");
  }
}

function checkDayConfig() {
  let config;
  try {
    config = JSON.parse(readFile("config/days.json"));
  } catch (error) {
    errors.push(`config/days.json: invalid JSON: ${error.message}`);
    return;
  }
  if (!config.course?.en || !config.course?.jp) {
    errors.push("config/days.json: missing bilingual course name");
  }
  if (!Array.isArray(config.days) || config.days.length !== 5) {
    errors.push("config/days.json: expected exactly 5 days");
    return;
  }
  for (const day of config.days) {
    const where = `day ${day.day}`;
    if (!day.title?.en || !day.title?.jp) errors.push(`config/days.json: ${where} missing bilingual title`);
    if (!day.focus?.en || !day.focus?.jp) errors.push(`config/days.json: ${where} missing bilingual focus`);
    if (!Array.isArray(day.questions) || day.questions.length === 0) {
      errors.push(`config/days.json: ${where} has no questions`);
      continue;
    }
    for (const q of day.questions) {
      if (!q?.en || !q?.jp) errors.push(`config/days.json: ${where} has a question missing en/jp`);
    }
  }
}

function checkMarkdown() {
  assertIncludes("docs/reflection-template.md", readFile("docs/reflection-template.md"), requiredReflectionHeadings);
  assertIncludes(".github/pull_request_template.md", readFile(".github/pull_request_template.md"), requiredPrHeadings);
  assertIncludes("AGENTS.md", readFile("AGENTS.md"), requiredAgentsPhrases);
  assertIncludes("README.md", readFile("README.md"), requiredReadmePhrases);
  assertIncludes(".github/workflows/portfolio.yml", readFile(".github/workflows/portfolio.yml"), requiredPortfolioWorkflowPhrases);
  assertIncludes("LICENSE", readFile("LICENSE"), requiredLicensePhrases);
}

function checkLearningLogs() {
  const logs = listFiles("learning-log", ".md").filter((p) => !p.endsWith(".gitkeep"));
  for (const relativePath of logs) {
    const content = readFile(relativePath);
    const present = loopHeadingsEn.filter((heading) => content.includes(heading)).length;
    if (present < 3) {
      errors.push(`${relativePath}: needs at least 3 of the loop headings (${loopHeadingsEn.join(", ")})`);
    }
  }
}

checkYamlSyntax();
checkRequiredFiles();
checkIssueTemplates();
checkLabelConfig();
checkDayConfig();
checkMarkdown();
checkLearningLogs();

if (errors.length > 0) {
  console.error("Harness checks failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Harness checks passed.");
