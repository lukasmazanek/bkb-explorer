# Puppeteer Configuration for BKB Explorer

## Quick Start

Start a **dedicated test Chrome instance** (separate from your normal browser):

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-puppeteer-test \
  --no-first-run \
  --no-default-browser-check \
  "file:///Users/luke/claude/bkb-explorer/index.html"
```

## Why `--user-data-dir` is Required

Chrome requires a non-default data directory for remote debugging. Without it:
```
DevTools remote debugging requires a non-default data directory.
```

## Key Flags

| Flag | Purpose |
|------|---------|
| `--remote-debugging-port=9222` | Enable DevTools protocol |
| `--user-data-dir=/tmp/chrome-puppeteer-test` | Separate profile (won't affect your main Chrome) |
| `--no-first-run` | Skip welcome screens |
| `--no-default-browser-check` | Don't ask to be default browser |

## Connecting from Claude Code

```javascript
// MCP Puppeteer tool
mcp__puppeteer__puppeteer_connect_active_tab()
```

## Verify Connection

```bash
curl -s http://localhost:9222/json/version
```

Should return Chrome version info.

## Troubleshooting

### Port not responding
- Kill all Chrome instances: `pkill -9 "Google Chrome"`
- Restart with flags above

### "Failed to connect to browser"
- Check if port 9222 is in use: `lsof -i :9222`
- Ensure `--user-data-dir` is specified

### Taking over user's browser
- Always use `--user-data-dir=/tmp/chrome-puppeteer-test` (or similar)
- This creates a separate Chrome profile that won't interfere with user's session

## Visual Tests

Run automated visual tests:
```bash
node test-visual.js
```

Screenshots saved to: `test-screenshots/`
