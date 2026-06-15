# Day reflection prompt / 1日の振り返りプロンプト

An end-of-day reflection interview. vibe-local normally runs this for you when you say
"start today's reflection" / "今日の振り返りを始めたい" — it turns the whole day into a clear
thinking record. You can also paste it into Ollama by hand.

1日の終わりの振り返りインタビューです。「今日の振り返りを始めたい」と言えば vibe-local が
この流れを回し、1日を「読める思考記録」に変えます。Ollama に手で貼ってもOKです。

---

```
We are finishing today (one day of my AI course). Help me turn the whole day into a clear record.
Do NOT invent things I did not do. If something is missing, ask me for it. Give hints, not answers.

Today's essential questions (use them as reference; I don't have to answer each one):
<paste the day's essential questions here>

Interview me ONE question at a time — this is a conversation, not a form.
- Send only ONE question per message, then STOP and wait for my reply.
- NEVER list or number several questions in one message.
- After each answer, react in one short line (a hint, or a nudge if my answer is thin), then ask the NEXT single question.
Go in this order, one per turn (do not show this list to me):
1. What did you actually do today? (the main things you made, tried, or explored)
2. From your paper notes: what were your first guesses, before the activities?
3. What did you check, build, or try to test those guesses?
4. Where did your thinking change today? ("At first I thought ___, but ___.")
5. What is one insight you can now explain in your own words?
6. Next time you see a similar problem, what will you check first?

Only after I have answered all six, give me a short summary I can paste into my GitHub issue, using these headings:
What I did today / My guesses (from my notes) / What I checked / What changed / Insight / How I'll use this next.
Match my language (English or Japanese), and use my own words — don't replace them with yours.
```

---

日本語版:

```
今日（AI講座の1日分）を終えます。1日全体を「読める記録」にするのを手伝ってください。
私がやっていないことを作らないこと。足りなければ私に質問する。答えではなくヒントを。

今日の問い（参考。すべてに答える必要はありません）:
<ここに今日の問い（Essential questions）を貼る>

1問ずつインタビューしてください — これはフォームではなく会話です。
- 1回のメッセージに質問は1つだけ。出したら止まって、私の答えを待つ。
- 複数の質問を並べたり番号で列挙したりしない。
- 答えるたびに、ひと言だけ反応（ヒント、または答えが薄ければ一押し）してから、次の1問へ。
次の順番で、1ターンに1問ずつ（この一覧自体は私に見せない）:
1. 今日、実際に何をした?（作った・試した・調べたことの主なもの）
2. 紙のメモから: 活動の前の「最初の予想」は?
3. その予想を確かめるために、何を確かめ・作り・試した?
4. 今日、考えが変わったのはどこ?（「最初は___と思ったが、___」）
5. 自分の言葉で説明できる「気づき」を1つ。
6. 次に似た問題を見たら、まず何を確認する?

6つ全部に答えたあとで、GitHubのIssueに貼れる短いまとめを、次の見出しで作ってください:
今日やったこと / 予想（メモから） / 確かめたこと / 考えが変わったところ / 気づき / 次にどう使うか。
私の言語（英語/日本語）に合わせ、私の言葉を使うこと（あなたの言葉に置き換えない）。
```

---

After the summary is in your day issue, build your report / まとめを1日のIssueに入れたらレポート生成:

```bash
npm run build:thinking-depth -- --issue <issue number>
```
