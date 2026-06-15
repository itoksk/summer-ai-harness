# AI Course · Thinking Harness / AI講座 思考ハーネス

A place to record **how you think** during the 5-day AI course — **one GitHub issue per day**
(Day 1–5, five reflections in total). The point is not a perfect answer. The point is to show what
you wondered, what you guessed, what you checked, and how your view changed. At the end, your
thinking is published as a web report.

5日間のAI講座で、**自分がどう考えたか** を記録する場所です。**1日＝1つのGitHub Issue**（Day 1〜5、
合計5回）。きれいな答えが目的ではありません。何を不思議に思い、どう予想し、何を確かめ、どう考えが
変わったかを残すのが目的です。最後に、その思考がWebレポートとして公開されます。

```text
Question -> Guess -> Checked -> Changed -> Insight -> Next
問い   ->  予想  ->  確認  ->  考え直し -> 気づき -> 次に使う
```

Your thinking partner is **vibe-local**, an agentic local AI you run on your own machine. It is a
thinking partner, not an answer machine — and it does the setup and publishing for you. See
[`docs/using-local-llm.md`](docs/using-local-llm.md).

思考の相棒は **vibe-local**（自分のPCで動くエージェント型ローカルAI）です。答えを出す機械ではなく、
考える相棒であり、セットアップや公開まで代わりにやってくれます。→ [`docs/using-local-llm.md`](docs/using-local-llm.md)

> **Reflect in English OR Japanese — whichever you like.** The report reads both, so write in the
> language you think best in. / **振り返りは英語でも日本語でもOK。** レポートは両方を読み取るので、
> 自分が考えやすい言語で書いてください。

> **This is your one repo for the week.** It logs your THINKING per day *and* publishes it as your
> portfolio page (GitHub Pages source: **GitHub Actions**) — the link you'll send your family and
> show on Demo Day. Each day you finish turns a square green.
>
> **これは1週間で使う唯一のリポです。** 1日ごとの**思考**を記録し、そのまま**ポートフォリオ**として
> 公開します（GitHub Pages のソースは **GitHub Actions**）— 家族に送り、デモデイで見せるページです。
> 1日を仕上げるたびに緑のマスが付きます。

---

## Setup / 準備

**Day 1 morning, once, with the whole class together** (this is the only manual setup): install
Node.js, the GitHub CLI, and vibe-local, then run `gh auth login`. Your teacher walks everyone
through it.

**Day 1 の朝に、クラス全員で一度だけ**（手作業の準備はこれだけ）: Node.js・GitHub CLI・vibe-local を
入れて `gh auth login`。先生が全員と一緒に進めます。

**Per student / 生徒ごと:**

1. **"Use this template"** → create your own repository. On
   [github.com/itoksk/summer-ai-harness](https://github.com/itoksk/summer-ai-harness) click
   **"Use this template" → "Create a new repository"**. / このテンプレートから自分のリポを作成。
2. **Clone your copy, then open it in vibe-local.** In a terminal:
   `gh repo clone <your-username>/<your-repo>` (**your** copy — not `itoksk/...`), `cd` into the
   folder, then run `vibe-local`. / 自分のコピーをクローンして vibe-local で開く。ターミナルで
   `gh repo clone 自分のID/リポ名`（`itoksk/...` ではなく **自分の** コピー）→ そのフォルダに `cd` →
   `vibe-local` 起動。
3. **Say "start today's reflection"** (English) or **「今日の振り返りを始めたい」** (Japanese).
   vibe-local does the rest — it installs anything missing, creates the day's issue, interviews
   you, builds your report, publishes it, and enables Pages. / **「今日の振り返りを始めたい」**と言う。
   あとは vibe-local が全部 — 不足の導入・Issue作成・インタビュー・レポート生成・公開・Pages有効化。

That's it. You don't run install / label / Pages commands by hand — vibe-local handles them.
これだけ。インストールやラベルやPagesのコマンドは手で打ちません。vibe-local がやります。

<sub>**If the AI can't (fallback) / AIができないとき（手動の予備手順）:** `npm install` → `npm run check`; create labels with the **Actions → Sync labels → Run workflow** (or `gh auth login` then `npm run sync-labels`); turn on Pages at **Settings → Pages → Source = `GitHub Actions`**.</sub>

## Update to the latest harness / 最新のハーネスに更新

Already made your copy and the teacher pushed a fix? One command — **same on Windows and macOS**:
すでにコピー済みで、先生が修正を出した? 1コマンド（**Windows / macOS 共通**）:

```bash
npm run sync
```

It pulls the latest behaviour/content files from the template and, if git is connected, commits + pushes — **it prints the repo it pushes to, so you can confirm git is linked.** It never touches your reflections (GitHub issues) or `learning-log/`.
最新の挙動・コンテンツ系ファイルを取り込み、git が繋がっていれば commit & push まで行い、**push 先のリポを表示します（連携できているか確認できる）。** 振り返り（GitHub Issue）や `learning-log/` には触れません。

**Confirm git is connected, then the sure-fire steps / 連携の確認＋確実な手順:**

```bash
git remote -v        # origin = YOUR repo? / origin が自分のリポか
gh auth status       # "Logged in"? / ログイン済みか
npm run sync         # pull updates / 更新を取り込む
# if it did NOT push (it tells you) / push されなかったら:
git add -A && git commit -m "sync harness from template" && git push
```

**First time on an OLD copy** (made before `npm run sync` existed)? Bootstrap once (Node, any OS); after that `npm run sync` always works:
**旧いコピーの初回だけ**（`npm run sync` 追加前のコピー）: 下で一度だけ取り込めば、以降は `npm run sync` でOK:

```bash
node -e "fetch('https://raw.githubusercontent.com/itoksk/summer-ai-harness/main/scripts/sync-from-template.mjs').then(r=>r.text()).then(t=>require('node:fs').writeFileSync('scripts/sync-from-template.mjs',t)).then(()=>console.log('ok'))"
node scripts/sync-from-template.mjs
```

## Each day / 各日

See the 5 days and their essential questions in [`docs/day-map.md`](docs/day-map.md).
5日間と問いの一覧は [`docs/day-map.md`](docs/day-map.md)。

> **During the day**, jot your first guesses on paper (30 sec, no computer). **At the end of the
> day**, open vibe-local and say "start today's reflection" — it runs the loop below for you.
> Teachers: [`docs/teacher-playbook.md`](docs/teacher-playbook.md). Students: [`docs/student-quickref.md`](docs/student-quickref.md).
>
> **日中** は最初の予想を紙にメモ（30秒・PC不要）。**1日の最後** に vibe-local を開いて「今日の振り返りを
> 始めたい」と言えば、下の流れを代わりに回します。講師: [`docs/teacher-playbook.md`](docs/teacher-playbook.md) /
> 生徒: [`docs/student-quickref.md`](docs/student-quickref.md)。

What vibe-local does when you say "start today's reflection" / 「今日の振り返りを始めたい」で vibe-local がやること:

1. Ensures setup (install, labels, Pages) — quietly, only if needed. / セットアップ確認（導入・ラベル・Pages）— 必要なときだけ静かに。
2. Asks which day, then creates the issue (`npm run new:day -- --day N`). / どの日か聞いてIssue作成。
3. Interviews you in your language, using your paper guesses and the day's questions. / あなたの言語で、紙の予想と問いを使ってインタビュー。
4. Writes your reflection into the issue and builds the report (`npm run build:thinking-depth -- --issue N`). / 振り返りをIssueに書き、レポート生成。
5. Commits, merges to `main`, **then** closes the issue — closing publishes. / コミット→`main`合流→**そのあと**Close（Closeで公開）。

You just think and answer. / あなたは考えて答えるだけ。

## Publishing / 公開

When the day issue is **closed**, the `Portfolio` workflow builds your report from `main` and
publishes it to GitHub Pages. So the order matters (vibe-local follows it for you):

1日のIssueを **閉じる** と、`Portfolio` ワークフローが `main` からレポートを作り、Pagesに公開します。
順番が大事です（vibe-local がこの順で進めます）:

1. Commit your changes. / 変更をコミット。
2. Merge to `main`. / `main` に合流。
3. **After merging to `main`, close the issue.** / **`main` に合流してからIssueを閉じる。**

Published pages / 公開されるページ:

- `index.html` — full portfolio, one card per day / 全体ポートフォリオ（1日1枚）
- `thinking-depth.html` — latest day report / 最新の1日レポート
- `thinking-depth/issue-<N>.html` — per-issue report / Issueごとのレポート
- `portfolio.md` / `thinking-depth.md` — Markdown fallback if Pages fails / Pages失敗時のフォールバック

URL: `https://<owner>.github.io/<repo>/`

## Commands / コマンド

You normally never type these — vibe-local runs them. They're here for reference and for the
manual fallback. / 普段は打ちません。vibe-local が実行します。参考と予備手順のために載せています。

```bash
npm run check                                  # validate the harness / 構造チェック
npm run sync-labels                            # create/update labels / ラベル同期
npm run new:day -- --day N                     # create a day reflection issue / 1日のIssue作成
npm run build:portfolio                        # build the full portfolio / ポートフォリオ生成
npm run build:thinking-depth -- --issue N      # build one day report / 1日レポート生成
```

## Folders / フォルダー

```text
.github/ISSUE_TEMPLATE/   Issue forms (day / question / stuck) / Issueフォーム
.github/workflows/        CI + Pages publishing / CIとPages公開
config/labels.json        Label definitions / ラベル定義
config/days.json          The 5 days + focus + essential questions / 5日間と核・問い
docs/                     Day map, teacher playbook, student quickref, local-AI guide / 一覧・講師台本・生徒用1枚・手順
prompts/                  Prompts the local AI uses / ローカルAIが使うプロンプト
learning-log/             Optional longer markdown logs / 任意の長文ログ
goals/                    Course goals / コースのゴール
scripts/                  Label sync, issue creator, report builders / スクリプト
AGENTS.md                 vibe-local runbook for the AI thinking partner / AIのランブック
```

## Troubleshooting / 困ったとき

Normally vibe-local handles all of this. If it can't, here's the manual path.
普段は vibe-local が全部やります。できないときの手動手順です。

| Symptom / 症状 | Fix / 直し方 |
| --- | --- |
| New issues get no `day:` label, or filters are empty / Issueに day が付かない・絞り込みが空 | Run the **Sync labels** workflow once (Actions → Run workflow). The `day-labeler` also auto-creates the day label. / **Sync labels** を1回実行(Actions→Run workflow)。day は自動作成もされます。 |
| Report page is 404 / nothing publishes / レポートが404・公開されない | Settings → Pages → Source = **GitHub Actions**. Publishing runs when you **close** an issue and builds from `main` — so merge to `main` first, then close. / Source を **GitHub Actions** に。公開はIssueの**Close時**・`main`から生成。先に main 合流→Close。 |
| `npm: command not found` | Install Node.js (it's in the Day 1 morning setup). / Node.js を入れる(Day 1 朝のセットアップに含む)。 |
| `vibe-local: command not found` right after installing / 導入直後に vibe-local が無い | It's on your PATH after you open a **new terminal**. See [`docs/using-local-llm.md`](docs/using-local-llm.md). / **新しいターミナル**でPATHが通る。 |
| `gh` exists but "not authenticated" / gh はあるが未認証 | `gh auth login` → GitHub.com → HTTPS → log in with a browser. / `gh auth login`(GitHub.com→HTTPS→ブラウザ)。 |
| Can't clone your copy / `repository not found` when cloning / 自分のコピーをクローンできない・`repository not found` | The copy is **private** and you're not authenticated, `gh` is signed in to a **different account** than owns the copy, or the copy isn't created yet. Run `gh auth login`, then check with `gh auth status` + `gh repo list` that your copy shows up, then clone **your** URL: `gh repo clone <you>/<repo>` (not `itoksk/...`). / コピーが **private** で未認証、`gh` が **別アカウント**、またはコピー未作成。`gh auth login` → `gh auth status`・`gh repo list` で自分のコピーが出るか確認 → **自分の** URLを `gh repo clone 自分のID/リポ名`(`itoksk/...` ではない)。 |
| Clone asks for a password / `Permission denied (publickey)` / クローンでパスワードを聞かれる・公開鍵エラー | Clone over HTTPS, not SSH: use `gh repo clone <you>/<repo>` (or run `gh auth setup-git` once so git reuses your `gh` login). / SSHではなくHTTPSで。`gh repo clone 自分のID/リポ名`(または一度 `gh auth setup-git` で git に gh のログインを使わせる)。 |

## The promise / 大事な約束

This harness is not for handing homework to an AI. First write your own thinking. Ask for hints,
not answers. The most important thing to keep is **how you thought** — not what the AI said.

これは宿題をAIに丸投げするためのものではありません。まず自分で考える。答えではなくヒントをもらう。
いちばん大事に残すのは「AIが言ったこと」ではなく、**あなたがどう考えたか** です。

## License / ライセンス

MIT — see [LICENSE](LICENSE). Based on the Codex Study Harness model, adapted for the
Canadian Academy AI intensive course. / MIT。Codex Study Harness を本講座向けに改変。
