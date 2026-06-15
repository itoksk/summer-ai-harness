# Using a local AI from the terminal / ターミナルでローカルAIを使う

In this course your thinking partner is an AI that runs **on your own machine**, from the terminal.
Nothing you type leaves your computer. The main tool is **vibe-local** — an agentic local AI that
drives the whole reflection for you (it creates the issue, interviews you, builds and publishes the
report). **Ollama** is the model engine underneath, and you can also chat with it directly.

このコースでは、思考の相棒となるAIを **自分のPC上** で、ターミナルから動かします。
打ち込んだ内容はPCの外に出ません。主役は **vibe-local** — 振り返り全体を回すエージェント型ローカルAI
です（Issue作成・インタビュー・レポート生成・公開まで）。**Ollama** はその下のモデルエンジンで、
直接対話することもできます。

> The AI is a **thinking partner**, not an answer machine.
> First write your own guess. Then ask for a hint, an explanation, or a review — not the final answer.
>
> AIは **思考の相棒** であって、答えを出す機械ではありません。
> まず自分の予想を書く。それからヒント・説明・添削をもらう — 答えそのものではなく。

---

## vibe-local (main) / vibe-local（メイン）

vibe-local is a terminal AI assistant that talks to your local Ollama (no API key) and can run
commands for you. Install the course build once, then launch it. / vibe-local はローカルのOllamaと
話し、コマンドも代わりに実行できるターミナルAI（APIキー不要）。講座ビルドを一度入れて起動します。

1. Install (once) / インストール（1回だけ）:

   *Mac / Linux / WSL:*
   ```bash
   curl -fsSL https://raw.githubusercontent.com/itoksk/vibe-local-private/main/install.sh | bash
   ```

   *Windows (PowerShell):*
   ```powershell
   Invoke-Expression (Invoke-RestMethod -Uri https://raw.githubusercontent.com/itoksk/vibe-local-private/main/install.ps1)
   ```

   It needs Ollama and Python 3 (the installer adds Python if missing). / Ollama と Python 3 が必要（無ければインストーラが入れます）。

2. Put it on your PATH / PATH を通す:

   vibe-local installs to `~/.local/bin`. The installer adds it to your shell profile, so the
   simplest fix is to **open a NEW terminal**. To use it in the SAME terminal right away (Mac /
   Linux / WSL), run: / vibe-local は `~/.local/bin` に入ります。インストーラがプロフィールに追記するので、**新しいターミナルを開く**のが一番簡単。今のターミナルですぐ使うなら（Mac / Linux / WSL）:

   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

   (Without this you may see `command not found: vibe-local`. / これが無いと `command not found: vibe-local` になることがあります。)

3. Start it from the terminal **inside your harness repo** / ハーネスのリポ内でターミナルから起動:

   ```bash
   vibe-local
   ```

4. Say **"start today's reflection"** / **「今日の振り返りを始めたい」**. vibe-local does the rest.
   **「今日の振り返りを始めたい」** と言う。あとは vibe-local がやります。

## Ollama (the engine) / Ollama（エンジン）

You don't usually call Ollama directly — vibe-local uses it. But you can chat with it by hand if you want. / 普段は直接使いません（vibe-localが使う）。手で対話したいときは:

1. Check it is installed / インストール確認: `ollama --version`
2. Pull a model once (ask your teacher which) / モデルを一度取得（どれかは先生に確認）: `ollama pull llama3.2`
3. Start a chat / 対話開始: `ollama run llama3.2` (leave with `/bye`)
4. Paste a prompt from [`prompts/`](../prompts) and talk about the day. / [`prompts/`](../prompts) を貼って、その日について対話。

---

## The daily loop / 1日の流れ

The whole loop is one sentence: open vibe-local in your repo and say **"start today's reflection"**.
流れは一言: リポで vibe-local を開き、**「今日の振り返りを始めたい」** と言う。

vibe-local then, autonomously / vibe-local が自律的に:

1. Sets up anything missing (install / labels / Pages). / 不足の準備（導入・ラベル・Pages）。
2. **Creates today's issue** (`npm run new:day -- --day N`). / **今日のIssueを作成**。
3. Asks you for your **paper guesses**, then **interviews you** with [`prompts/day-reflection.md`](../prompts/day-reflection.md) — hints, not answers. / 紙の **予想** を聞き、[`day-reflection.md`](../prompts/day-reflection.md) で **インタビュー** — 答えではなくヒント。
4. Writes your reflection into the issue and **builds the report** (`npm run build:thinking-depth -- --issue N`). / 振り返りをIssueに書き **レポート生成**。
5. Commits → merges to `main` → **then closes the issue** to publish. / commit → `main`合流 → **そのあとClose** で公開。

## If the AI gives you the answer too fast / AIが答えを早く出しすぎたら

Tell it: *"Don't give me the answer. Give me one hint and ask me a question back."*
こう言いましょう: 「答えは言わないで。ヒントを1つだけ出して、質問を返して。」
