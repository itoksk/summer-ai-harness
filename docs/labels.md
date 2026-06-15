# Labels / ラベル

Labels are the tags on each day issue. They let you (and your teacher) see at a glance
**which day, what kind of work, and what state** an issue is in — and let the teacher collect all
the records for one day in one filter.

ラベルは各日のIssueに付ける目印です。**何日目で、どんな作業で、どんな状態か** が
ひと目で分かり、先生が「ある日の記録だけ」をまとめて回収できるようになります。

Label names stay in English (scripts and GitHub Actions read them). Descriptions are bilingual.
ラベル名は英語のままにします（スクリプトやActionsが読み取るため）。説明はバイリンガルです。

You normally don't manage labels by hand — vibe-local runs `npm run new:day` (which applies them)
and `npm run sync-labels` (which mirrors the full set to GitHub) for you. To sync them manually:
普段は手作業しません。vibe-local が `npm run new:day`（付与）と `npm run sync-labels`（一覧反映）を
実行します。手動で反映するなら:

```bash
npm run sync-labels
```

(Run `gh auth login` first. / 先に `gh auth login` を実行。)

## Required on every day issue / 各日のIssueに必須

- `day:1` … `day:5` — which day / 何日目
- `type:*` — exactly one / ちょうど1つ
- `status:*` — exactly one / ちょうど1つ
- `portfolio:show` or `portfolio:hide` — exactly one / ちょうど1つ

There are no `koma:*` labels — the harness is per-day. / `koma:*` ラベルはありません（1日単位のため）。

## type:* — what kind of work / 作業の種類

| Label | Meaning / 意味 |
| --- | --- |
| `type:concept` | Understand an idea / 仕組みを理解する |
| `type:build` | Make or code something / 作る・コードを書く |
| `type:create` | Image, music, video / 画像・音楽・動画 |
| `type:experiment` | Try and observe / 試して観察する |
| `type:security` | Break or defend on purpose / わざと壊す・守る |
| `type:reflection` | Look back, next steps / 振り返り・次に使うこと |
| `type:question` | A question that came up / 出てきた問い |
| `type:stuck` | Stuck, broke, or wrong / 詰まった・壊れた・間違えた |

The daily reflection issue is `type:reflection`. / 1日の振り返りIssueは `type:reflection`。

## status:* — current state / 今の状態

`status:ready` → `status:in-progress` → `status:reviewing` → `status:done`

## needs:* — what help you want / ほしい助け

`needs:hint`, `needs:explanation`, `needs:example`, `needs:review`, `needs:teacher-check`

## difficulty:* — challenge tier / チャレンジの難度

`difficulty:easy`, `difficulty:medium`, `difficulty:hard`

## ai-tool:* — which local AI helped / 一緒に考えたローカルAI

`ai-tool:vibe-local`, `ai-tool:ollama`, `ai-tool:other`

## portfolio:* — show on the web report or not / Webレポートに載せるか

`portfolio:show` (normal records / 通常の記録), `portfolio:hide` (private / 非公開).
Never use both at once. / 両方同時には付けない。
