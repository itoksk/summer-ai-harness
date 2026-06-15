# Teacher playbook / 講師用 進行台本

How to run the Thinking Harness in class so that every day leaves a real record of
**thinking** and **consultation** — not just a finished answer. The reflection is **once a day**,
and **vibe-local drives it**: the student says "start today's reflection" and the AI creates the
issue, interviews them, builds the report, and publishes — so you can focus on the thinking, not
the terminal.

各日で「思考」と「相談」の記録が必ず残るように、授業で思考ハーネスを回すための講師用台本です。
振り返りは **1日1回**、そして **vibe-local が回します**: 生徒が「今日の振り返りを始めたい」と言えば、
AIがIssue作成・インタビュー・レポート生成・公開まで行うので、講師は端末ではなく思考に集中できます。

> Companion docs: [`day-map.md`](day-map.md) (5 days + questions), [`using-local-llm.md`](using-local-llm.md) (local AI / vibe-local), [`student-quickref.md`](student-quickref.md) (the 1-page card to hand students).
> 関連: [`day-map.md`](day-map.md)（5日間と問い）、[`using-local-llm.md`](using-local-llm.md)（ローカルAI / vibe-local）、[`student-quickref.md`](student-quickref.md)（生徒に配る1枚カード）。

---

## The record policy / 記録の方針 — **3 records per day / 1日3点セット**

Every student leaves **three** records for every day. This is the depth bar.
全日で、生徒は **3つ** の記録を必ず残します。これが深さの基準です。

**The harness runs once a day — at the end of the day.** Two of the three records have to be
*captured live* on paper during the day, then *filed* into the harness at day-end (vibe-local
pulls them in during the interview).
**ハーネスは1日1回、その日の最後に回します。** 3つのうち2つは、日中に *紙でメモ* し、最後にハーネスへ
*清書* します（vibe-local がインタビューで吸い上げます）。

| # | Record / 記録 | Capture live (during the day) / 日中に取る | File at day-end / 最後に記録 |
| --- | --- | --- | --- |
| 1 | **First guesses / 最初の予想** | Jot on paper the moment each question is posed / 問いが出た瞬間に紙へメモ | Type into the day issue (vibe-local asks) / 1日Issueに入力（vibe-localが質問） |
| 2 | **Consultation memo / 相談メモ** | One line when stuck: expected / actual / tried / 詰まったら一行: 期待・実際・試した | Issue comment, or a `stuck` / `question` issue / コメント、または `stuck`・`question` Issue |
| 3 | **Reflection / まとめ** | — (done at day-end) / —（最後に実施） | day issue via the vibe-local reflection → build report / vibe-localの振り返り→レポート生成 |

The **consultation memo (#2)** is the part teachers usually forget to require. It is *not* a
copy-paste of the AI chat — it is the student's own note in the `stuck-helper` shape:
**expected / actual / what I tried / what I'll check next**. That is what makes a consultation
readable later.

忘れられがちなのは **相談メモ（#2）** です。AIとの会話の貼り付けでは **ありません**。
`stuck-helper` の形（**期待した結果／実際の結果／試したこと／次に確かめること**）で、生徒自身が書いたメモにします。
これが後から読める相談ログになります。

---

## Before Day 1 — one-time setup / Day 1前の一度きりの準備

Do this **once, with the whole class together** on Day 1 morning. This is the only manual setup —
after this, vibe-local handles everything per student.

Day 1 の朝に **クラス全員で一度だけ** 行います。手作業の準備はこれだけ。以降は生徒ごとに vibe-local が
やります。

1. **Install Node.js, the GitHub CLI, and vibe-local**, then `gh auth login`. Walk everyone
   through it together. / **Node.js・GitHub CLI・vibe-local を導入** → `gh auth login`。全員で一緒に。
2. Each student clicks **"Use this template"** on `itoksk/summer-ai-harness` → **Create a new
   repository** (their own copy). / 各生徒が `itoksk/summer-ai-harness` で **Use this template** →
   **Create a new repository**（自分のコピー）。
3. Each student **clones their own copy** and opens it in vibe-local: in a terminal run
   `gh repo clone <their-username>/<their-repo>` (**their** copy, not `itoksk/...`), `cd` into the
   folder, then run `vibe-local`. / 各生徒が **自分のコピーをクローン** して vibe-local で開く:
   ターミナルで `gh repo clone 自分のID/リポ名`（`itoksk/...` ではなく **自分の** コピー）→ `cd` →
   `vibe-local` 起動。
4. Each student says **"start today's reflection"** once to confirm vibe-local can install, label,
   enable Pages, and create an issue. / 各生徒が一度 **「今日の振り返りを始めたい」** と言って、
   導入・ラベル・Pages・Issueが通ることを確認。
5. Collect each student's Pages URL (`https://<user>.github.io/<repo>/`) into your roster.
   各生徒のPages URL（`https://<user>.github.io/<repo>/`）を名簿に集める。

> Students should **not** run `npm install` / `sync-labels` / Pages settings by hand. vibe-local
> does these from the AGENTS runbook. They only become a manual step if vibe-local can't.
> 生徒は `npm install`・`sync-labels`・Pages設定を **手作業しない**。vibe-local がランブックに沿って
> 行います。手動になるのは vibe-local ができないときだけ。

> Gotcha: pushing `.github/workflows/*` needs the `workflow` token scope. If a student's push is
> rejected, run `gh auth refresh -h github.com -s workflow`.
> 注意: `.github/workflows/*` のpushには `workflow` スコープが必要。pushが拒否されたら
> `gh auth refresh -h github.com -s workflow`。

> Gotcha: a student **can't clone their copy** (`repository not found`, or it asks for a password).
> This is almost always auth, in this order of likelihood: (1) the copy is **private** and
> `gh auth login` wasn't completed; (2) `gh` is signed in to a **different account** than the one
> that owns the copy (school vs personal Google login); (3) the copy **wasn't actually created**
> (they forked, or didn't finish "Create a new repository"); (4) they cloned **`itoksk/...`** or an
> **SSH** URL instead of their own HTTPS copy. Triage in two commands: `gh auth status` (signed in?
> which account?) and `gh repo list` (does their copy show up?). Then clone **their** URL over
> HTTPS: `gh repo clone <user>/<repo>`. Don't ask the local model to do the clone — it's a one-time
> manual command, and the small local model is unreliable at it.
> 注意: 生徒が **自分のコピーをクローンできない**（`repository not found`、またはパスワードを聞かれる）。
> ほぼ認証問題で、起こりやすい順に: (1) コピーが **private** なのに `gh auth login` 未完了、
> (2) `gh` が **別アカウント**（学校用と個人用のGoogleログイン）で認証、(3) コピーが **未作成**
> （フォークした／"Create a new repository" を押し切れていない）、(4) 自分のHTTPSコピーではなく
> **`itoksk/...`** や **SSH** URLをクローンした。2コマンドで切り分け: `gh auth status`（認証済み?
> どのアカウント?）と `gh repo list`（自分のコピーが出る?）。確認できたら **自分の** URLをHTTPSで
> `gh repo clone 自分のID/リポ名`。クローンを局所モデルに任せない — 一度きりの手動コマンドで、
> 小さなローカルモデルは取りこぼしやすい。

---

## The daily rhythm / 1日の進行リズム — **reflect at the end of the day / 振り返りは1日の最後に**

Two moments only. During the day, students just jot on paper. At the end of the day, they open
vibe-local **once** and say "start today's reflection" — it turns the whole day into one record.

瞬間は2つだけ。日中は紙にメモするだけ。1日の最後に vibe-local を **1回** 開いて「今日の振り返りを
始めたい」と言えば、その日を1つの記録に変えます。

### A. During the day — offline, ~30 seconds at a time / 日中 — オフライン・その都度30秒
The only thing that can't wait. The computer stays **closed**; no git. Just jot on paper or the worksheet:
待てないのはここだけ。PCは **閉じたまま**、gitもしない。紙かワークシートにメモ:

- **Your first guess**, the moment each essential question is posed (before the activity). A wrong guess is fine — it is the "before" snapshot. / 問いが出た瞬間の **最初の予想**（活動前）。間違いでOK。「活動前」のスナップショット。
- **When you get stuck:** one line — expected / actual / what you tried. / 詰まったら一行 — 期待・実際・試したこと。

> **Teacher says:** "We don't open the harness now. Just write your guess on paper before we start — 30 seconds. We'll reflect on the whole day at the end."
> **講師:** 「今はハーネスを開かない。始める前に予想だけ紙に — 30秒。振り返りは1日の最後にまとめてやる。」
>
> Why jot live? A guess written *after* you know the answer is hindsight, not a prediction. These notes are what keep the end-of-day record honest. / なぜ日中にメモ? 答えを知った後の予想は後知恵で予想ではない。このメモが最後の記録を正直に保つ。

### B. End of day — the reflection / 1日の最後 — 振り返り
Open **vibe-local** and say **"start today's reflection"** / **「今日の振り返りを始めたい」**. It then, autonomously:
**vibe-local** を開いて **「今日の振り返りを始めたい」** と言う。あとは自律的に:

1. Ensures setup (install/labels/Pages) if needed, and creates the day issue (`npm run new:day -- --day N`). / 必要なら導入・ラベル・Pages、そしてIssue作成。
2. Asks the student to type in the **guesses they jotted** during the day → record #1. / 日中にメモした **予想を入力** させる → 記録#1。
3. Runs the reflection interview (what they did / checked / where thinking changed — folding in the stuck-notes) → records #2 & #3. / 振り返りインタビュー（やったこと・確かめ・考えが変わった所、詰まりメモも統合）→ 記録#2・#3。
4. Writes the reflection into the issue and builds the report (`npm run build:thinking-depth -- --issue N`). / 振り返りをIssueに書き、レポート生成。
5. Commits → merges to `main` → **then** closes the issue (closing publishes). / commit → `main`合流 → **そのあと**Close（Closeで公開）。

**One reflection per day. Five in total.** / **振り返りは1日1回、合計5回。**

> The student talks; vibe-local drives. Your job is to make sure the **paper guesses** exist and the **reflection is in their own words** — not the terminal steps.
> 生徒は話し、vibe-local が回す。講師の仕事は **紙の予想** があり **振り返りが本人の言葉** であること —— 端末操作ではない。

> **Order matters / 順番が大事:** merge to `main` **before** close. Close-before-merge publishes the old version. vibe-local follows this; verify if a report looks stale. / Closeの **前** に `main` へ合流。逆だと古い版が公開される。vibe-localはこの順。古ければ確認。

---

## Live facilitation — what to watch for / 進行中に見るポイント

| Symptom / 症状 | Fix / 対処 |
| --- | --- |
| Guesses written at day-end from memory / 予想を最後に思い出して書く | Enforce the live 30-sec paper jot during the day. No live guess = it's hindsight. / 日中の30秒・紙メモを徹底。メモの無い予想は後知恵。 |
| AI gave the answer too fast / AIが答えを早く出した | "Don't give the answer. One hint + a question back." / 「答えは言わないで。ヒント1つと質問を返して。」 |
| Consultation memo is a chat dump / 相談メモが会話の貼り付け | Rewrite in expected/actual/tried/next. / 期待/実際/試した/次の形に書き直す。 |
| Reflection is a feelings essay / まとめが感想文 | Point to "what changed" — where did your thinking move? / 「考えが変わったところ」に戻す。 |
| Student is hand-running npm commands / 生徒が npm を手打ちしている | They shouldn't. Have them say "start today's reflection" and let vibe-local drive. / 不要。「今日の振り返りを始めたい」と言わせ、vibe-localに任せる。 |
| Closed issue, blank report / Closeしたのに空レポート | Merged to `main`? Reopen, merge, close again. / `main`に合流済み? 再Open→merge→再Close。 |

---

## Collecting & reviewing / 回収・確認

- **Live, during class:** open each student's **Issues** tab. An open day issue = the day they're reflecting on; closed = done. Green squares show commit cadence.
  **授業中のライブ確認:** 各生徒の **Issues** タブ。Open=振り返り中の日、Closed=完了。緑のマスでコミット頻度。
- **For grading / portfolio:** their published `https://<user>.github.io/<repo>/` — `index.html` is the full portfolio with one card per day; `thinking-depth/issue-<N>.html` is one day.
  **評価・ポートフォリオ:** 公開URL `https://<user>.github.io/<repo>/` — `index.html` が日ごとの全体、`thinking-depth/issue-<N>.html` が1日分。
- A day "counts" when all 3 records exist and the issue is closed (= report published). Use the 3-record policy above as the checklist.
  1日の「完了」は3点セットが揃い、Issueが閉じている（＝レポート公開）こと。上の3点を点検リストにする。

---

## The 5-day schedule / 5日間の進行表

One reflection issue per day, created by vibe-local when the student says "start today's reflection". Full questions in [`day-map.md`](day-map.md).
振り返りは1日1Issue、生徒が「今日の振り返りを始めたい」と言うと vibe-local が作成。問いの全文は [`day-map.md`](day-map.md)。

| Day | Focus / 核 | Command vibe-local runs / vibe-local が実行 |
| --- | --- | --- |
| 1 | Same words, different results; who owns AI work; direct AIs & ship / 同じ言葉でも違う・AI作品は誰のもの・AIを演出し世界公開 | `npm run new:day -- --day 1` |
| 2 | Words become numbers; inside the 200-line GPT; your own AI & its limits / ことばが数字に・200行GPTの中身・自分のAIと限界 | `npm run new:day -- --day 2` |
| 3 | Turn people into data; teach a machine to see; verify, predict, decide / 人をデータに・機械に見せる・確かめ予測し決める | `npm run new:day -- --day 3` |
| 4 | Stay in the driver's seat; build responsibly & finish / 運転席に座り続ける・責任をもって作り切る | `npm run new:day -- --day 4` |
| 5 | Finish & rehearse; Demo Day and who you become / 仕上げてリハ・デモデイと、その先の自分 | `npm run new:day -- --day 5` |

---

## The one promise to repeat / 繰り返し伝える約束

This is not for handing work to an AI. Write your own thinking first; ask for hints, not answers.
The thing worth keeping is **how you thought** — not what the AI said.

これはAIに丸投げするためのものではありません。まず自分で考え、答えではなくヒントをもらう。
残す価値があるのは **自分がどう考えたか** であって、AIが言ったことではありません。
