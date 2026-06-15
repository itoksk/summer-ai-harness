# One day, one page / 1日・1枚

Keep this open. The harness runs **once a day, at the end of the day**, and **vibe-local does the
work** — you just think and answer. The goal is to show **how you thought** — not a perfect answer.
これを開いておく。ハーネスは **1日1回、その日の最後** に回し、**vibe-local が作業をやる** — あなたは
考えて答えるだけ。目的は「正解」ではなく、**自分がどう考えたか**。

```text
Question -> Guess -> Checked -> Changed -> Insight -> Next
問い   ->  予想  ->  確認  ->  考え直し -> 気づき -> 次に使う
```

> **Reflect in English OR Japanese.** Write in the language you think best in — the report reads both.
> **振り返りは英語でも日本語でも。** 考えやすい言語で。レポートは両方を読み取る。

---

## During the day — on paper, ~30 sec each / 日中 — 紙に、その都度30秒

Don't open the computer yet. Just jot:
まだPCは開かない。メモするだけ:

- ✅ **Your first guess** the moment each question is posed (before the activity). Wrong is fine.
  問いが出た瞬間の **最初の予想**（活動前）。間違ってOK。
- ✅ **When you get stuck:** one line — expected / actual / what you tried.
  詰まったら一行 — 期待 / 実際 / 試したこと。

> Why on paper? A guess written *after* you know the answer isn't a real guess. These notes keep your record honest.
> なぜ紙? 答えを知った後の予想は予想じゃない。このメモが記録を正直に保つ。

---

## End of day — the reflection / 1日の最後 — 振り返り

**Open vibe-local and say "start today's reflection"** (or 「今日の振り返りを始めたい」). That's it —
vibe-local then does everything:
**vibe-local を開いて「今日の振り返りを始めたい」と言う** だけ。あとは vibe-local が全部やります:

1. Sets up anything missing (install / labels / Pages) and **creates today's issue**. / 不足の準備をして **今日のIssueを作成**。
2. Asks you to **type in the guesses** you jotted on paper. / 紙にメモした **予想を入力** させる。
3. **Interviews you** in your language — what you did, what you checked, where your thinking changed, your insight, what's next. (Hints, not answers.) / あなたの言語で **インタビュー** — やったこと・確かめ・考えが変わった所・気づき・次。（答えではなくヒント。）
4. Writes your reflection into the issue and **builds the report**. / 振り返りをIssueに書き **レポート生成**。
5. Commits → merges to `main` → **then closes the issue.** Closing publishes your report. / commit → `main`合流 → **そのあとClose**。Closeで公開。

> **First time only:** make your copied repo **Public**, then clone YOUR copy, `cd` in, and run `vibe-local` there.
> 初回だけ: コピーした自分のリポを **Public** にし、`git clone`(自分のコピー) → `cd` → `vibe-local`。
>
> **If vibe-local just chats** (the local model is small), do it yourself: create the issue, **write your answers IN it** (an empty template is not a reflection), then **close it** — closing fires the Portfolio Action that builds & publishes your page (no local build needed). Commands are below.
> vibe-local が雑談で終わるなら自分で: Issueを作り、**答えを書き込み**(空テンプレは振り返りではない)、**閉じる** — Close で Portfolio Action が走りページを公開する(ローカルのビルド不要)。コマンドは下。
>
> **Filing a day late?** (Day 1 at the start of Day 2 is normal.) Pass that day's number — `--day 1` — even the next morning.
> 後日に回すとき(Day 1 を Day 2 の朝、は普通)は、翌朝でも その日の番号 `--day 1` を渡す。

**One reflection per day. You talk; vibe-local drives.**
**振り返りは1日1回。あなたは話し、vibe-local が回す。**

---

## If you ever need to do it by hand / 手でやることになったら

Normally you never type these — vibe-local does. But if it can't:
普段は打ちません。vibe-localがやります。でも、できないときは:

```bash
npm run new:day -- --day N                  # create today's issue / 今日のIssue作成
npm run build:thinking-depth -- --issue N   # build the report / レポート生成
```

The prompts vibe-local uses live in [`prompts/`](../prompts): [`socratic-tutor.md`](../prompts/socratic-tutor.md) (behavior), [`day-reflection.md`](../prompts/day-reflection.md) (the day interview), [`stuck-helper.md`](../prompts/stuck-helper.md) (a stuck-note that needs working out).
vibe-local が使うプロンプトは [`prompts/`](../prompts) に: [`socratic-tutor.md`](../prompts/socratic-tutor.md)（ふるまい）、[`day-reflection.md`](../prompts/day-reflection.md)（1日のインタビュー）、[`stuck-helper.md`](../prompts/stuck-helper.md)（詰まりメモを解く）。

> If the AI answers too fast: *"Don't give the answer. One hint and a question back."*
> AIが答えを早く出したら: 「答えは言わないで。ヒント1つと質問を返して。」

---

## The promise / 約束

Ask for hints, not answers. First write your own thinking. What matters is **how you thought**.
答えではなくヒントをもらう。まず自分で考える。大事なのは **自分がどう考えたか**。
