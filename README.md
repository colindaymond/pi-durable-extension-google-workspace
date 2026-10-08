# pi-durable-extension-google-workspace

A Google Workspace extension for **Pi Durable** (the SQLite-backed `pi-durable` TUI). It covers Gmail, Drive, Calendar, Docs, Sheets, Slides, Chat and People, with multi-account OAuth.

This is the durable port of [pi-extension-google-workspace](https://github.com/colindaymond/pi-extension-google-workspace). For **pi-mobile**, which cannot load extensions, use [pi-mobile-skill-google-workspace](https://github.com/colindaymond/pi-mobile-skill-google-workspace).

## Differences from the standard Pi extension

| | Standard Pi | This port |
|---|---|---|
| Account context in the prompt | `before_agent_start` rewrites the system prompt | `registerPromptSection("google_workspace_accounts", …)`, which Durable commits before every request, including recovered runs |
| Host imports | `@earendil-works/pi-coding-agent` | The same specifier, resolved by the durable host to its limited local-extension adapter |
| Tool calls with a missing or expired token | Could start an interactive browser login inside the tool | Fail fast and tell the user to run `/gw-login` |
| Sign-in on a machine without a browser | Not supported | The URL is printed and you paste the redirected address back (`--no-browser`, automatic without a display) |

Durable records tool intent and results. `google_workspace` is replay-unsafe: after a restart, an interrupted call is recorded as interrupted and is not repeated, so Workspace writes are not duplicated.

## What it adds

- `google_workspace`, a tool that runs an async JavaScript body with `auth`, `google` and `workspace` helpers, plus an optional `account` parameter for one-off calls to another signed-in mailbox
- `/gw`, `/gw-use`, `/gw-next`, `/gw-prev`, `/gw-status`, `/gw-login`, `/gw-logout`, and the literal `\gw…` aliases
- a committed prompt section that lists the active and other signed-in accounts
- the bundled `google-workspace` skill

## Install (local pi-durable)

The durable host does not install arbitrary packages yet. It loads its ported extensions from a fixed directory and resolves `@earendil-works/pi-coding-agent` there to `extensions/compat.ts`, which must export `ExtensionAPI` with `registerPromptSection`, `ExtensionContext`, and the truncation helpers. To install:

```sh
git clone https://github.com/colindaymond/pi-durable-extension-google-workspace
cd pi-durable-extension-google-workspace && npm install --omit=dev
# Copy into the pi-durable installation's extension directory:
for d in extensions scripts skills; do
  rm -rf ~/.local/share/pi-durable/extensions/google-workspace/$d
  cp -R $d ~/.local/share/pi-durable/extensions/google-workspace/
done
```

The host imports `extensions/google-workspace/extensions/index.ts` and calls its default export with the adapter API. Restart with `pi-durable -c`.

## Sign in

```text
/gw-login you@example.com
/gw-login work@example.com --credentials /secure/path/credentials.json
/gw-login you@example.com --no-browser
```

Without a browser, open the printed URL on any device and sign in. Then copy the `http://localhost:…/oauth2callback?…` address the browser was redirected to (that page does not load) and paste it into the terminal. For a fully headless server, you can also run the login once in a shell:

```sh
node scripts/auth.js login --email you@example.com --no-browser
```

Tokens live in `~/.pi/google-workspace/tokens/` (mode `0600`), and the selected account is stored in `~/.pi/google-workspace/pi-extension.json`. Both are shared with the standard Pi extension and the pi-mobile skill on the same machine. Override them with `GOOGLE_WORKSPACE_CONFIG_DIR` or `GOOGLE_WORKSPACE_TOKENS_DIR`.

The default flow uses the upstream skill's OAuth client and the broker at `google-workspace-extension.geminicli.com`. Review that trust choice, or use your own Desktop OAuth client with `--credentials`.

## Development

```sh
npm install
npm run check   # TypeScript + tests (fake hosts, no Google calls)
```

## Attribution

The OAuth and API helpers are modified from `mitsuhiko/agent-stuff` revision `13bc8f87970bec8830aab0f1c0487d35aa7c0917` (Apache-2.0). See [NOTICE](NOTICE) and [LICENSE](LICENSE).
