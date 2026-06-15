# Day review checklist / 1日の確認チェックリスト

Use this before closing a day reflection issue. It is not a grade — it checks that your *thinking*
is readable. (vibe-local checks most of this for you before it closes the issue.)
1日の振り返りIssueを閉じる前に使います。点数ではなく、あなたの **思考** が読み取れるかの確認です。
（vibe-local がClose前にほとんどを確認します。）

- [ ] The day's questions are noted in my own words (or referenced). / その日の問いを自分の言葉でメモした（または参照した）。
- [ ] I wrote my first guesses **before** seeing the answers (from my paper notes). / 答えの前に予想を書いた（紙のメモから）。
- [ ] The AI gave hints, not just the final answer. / AIは答えだけでなくヒントをくれた。
- [ ] I recorded where my thinking changed. / 考えが変わったところを書いた。
- [ ] I can explain one insight in my own words. / 気づきを自分の言葉で説明できる。
- [ ] I wrote how I'll use this next time. / 次にどう使うか書いた。
- [ ] Labels are set: `day:N`, one `type:*`, one `status:*`, one `portfolio:*`. / ラベルが付いている。

## Closing order / 閉じる順番

Publishing happens **after** you close the issue, and the report is built from `main`.
So the order matters (vibe-local follows it for you):

公開はIssueを **Close した後** に走り、レポートは `main` から作られます。順番が大事です
（vibe-local がこの順で進めます）。

1. Commit your learning-log / report changes. / 学習ログやレポートの変更をコミット。
2. Merge to `main`. / `main` に合流。
3. **After merging to `main`, close the issue.** / **`main` に合流してからIssueをClose。**
4. The Portfolio workflow runs and publishes to GitHub Pages. / Portfolioワークフローが動き、Pagesに公開。

If you close the issue first, the report may be built from old files.
先にIssueを閉じると、古いファイルでレポートが作られることがあります。
