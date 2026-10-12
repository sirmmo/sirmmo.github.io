---
title: "stairway"
date: 2026-10-12
draft: false
type: "tool"
kicker: "Tool"
url: "/stairway/"
subtitle: "From an idea in a chat to a running coding agent on my own server, without leaving the conversation."
legend:
  - k: "Repository"
    v: "[github.com/sirmmo/stairway](https://github.com/sirmmo/stairway)"
  - k: "Form"
    v: "One Python file, standard library only. MCP server with its own OAuth 2.1"
  - k: "Agents"
    v: "Claude Code (default) · opencode · crush, the latter two via OpenRouter or any OpenAI-compatible API"
  - k: "Reach"
    v: "claude.ai · claude.ai/code · browser VS Code · Telegram groups"
  - k: "Licence"
    v: "MIT"
links:
  - label: "Source & docs"
    note: "github.com/sirmmo/stairway: README, architecture, deployment, security"
    url: "https://github.com/sirmmo/stairway"
  - label: "The build story"
    note: "dev.to: OAuth without storage, typing into a TUI, the red bars"
    url: "https://dev.to/sirmmo/stairway-from-a-chat-idea-to-a-running-claude-code-experiment-on-my-own-server-2eoh"
---

Most of my side projects start in a chat. I talk an idea through with Claude, usually on my phone, and at some
point the conversation is good enough that I want to *try it*. That's where the momentum used to die: get to a
laptop, SSH into the server, make a folder, start an agent, paste in a summary of everything we just said.

stairway is the step between those two places. It's a small MCP server running on my machine. When the chat
says *"ok, let's try it"*, Claude calls it, and a few seconds later there's a folder, a git repository and a
coding agent already working on the brief we agreed on.

## The route

1. **In the chat**, I ask Claude to create an experiment and brief it. That's one tool call:
   `create_experiment(name, prompt)`.
2. **On the server**, stairway makes `<root>/<name>`, runs `git init` and starts the agent inside a detached
   `screen`, so it survives restarts.
3. **Wherever I am**, I follow it: in claude.ai/code on the phone, in a VS Code that stairway opens in the
   browser, or in a Telegram group where the agent's answers arrive next to the people discussing them.
4. **Later**, the chat can keep steering it with `send_prompt`, and the status page shows every experiment,
   its terminal and what it was told.

## What it is careful about

stairway exists to let an agent run commands on my machine when asked, so it's built around explicit consent.
Existing folders and Telegram groups do nothing until I approve them on the status page. claude.ai connects
through stairway's own OAuth server, whose grants are signed rather than stored, so one secret revokes
everything. Agents never see stairway's own credentials.

## Not only Claude

Claude Code is the default. When I want a different model, or a cheaper one, an experiment can run
[opencode](https://opencode.ai) or [crush](https://github.com/charmbracelet/crush) instead, through
OpenRouter or any OpenAI-compatible provider. Their replies reach Telegram the same way, because stairway
reads each agent's own conversation store rather than scraping its screen.

## Where it came from

I built it in a few sessions of pair-programming with Claude Code, on a fairly old Ubuntu server. That explains
some of its quirks: a byte-pipe proxy for VS Code, a little color filter because GNU screen 4 can't show
24-bit color. It's deliberately small: one file you can read in an evening, and no dependencies to keep up
to date.
