# DEVELOPMENT_WORKFLOW.md

**Branches, commits, review, deployment, and recovery.** The most important rule
in this document is §2: nothing reaches the public site without Rob asking.

---

## 1. Branches

| Branch | Role |
|---|---|
| `live` | **Deploys to norwayrob.no.** Only ever receives merges from the draft branch, and only when Rob asks. |
| `claude/norwayrob-booking-site-kc64ih` | **The working branch.** All development happens here. |
| `claude/bus-booking-website-xyve0m` | Legacy. Do not use. Its deploy workflow was removed after it hijacked the domain. |

Start every session by confirming where you are:

```bash
git branch --show-current    # must be claude/norwayrob-booking-site-kc64ih
```

If it does not exist locally:

```bash
git fetch origin claude/norwayrob-booking-site-kc64ih
git checkout claude/norwayrob-booking-site-kc64ih
```

If it does not exist at all, branch from `live`:

```bash
git fetch origin live
git checkout -b claude/norwayrob-booking-site-kc64ih origin/live
```

## 2. The staging rule

Rob established this after a live incident:

> *"for at jeg skal fikse på ting, så kan det ikke gå live med engang"*

**Work is committed and pushed to the draft branch freely.** Pushing there
deploys nothing — the workflow only triggers on `live`.

**Publishing requires an explicit request.** The words are "publiser", "push",
"push til live", or an unmistakable equivalent. These are **not** permission:

- "Det ser bra ut"
- "Fint"
- "Ja" to a question about the design
- Approving a preview

When in doubt, ask. The cost of asking is a sentence; the cost of publishing
something Rob has not seen is his customers seeing it first.

## 3. Commits

One logical change per commit. Norwegian, imperative, describing the outcome for
Rob rather than the mechanism.

```
Skjema: sluttid valgfri - vi regner ut tidsbruken for A-til-B-turer
Vilkar: bussen kjorer ikke fra gruppen (ventetid gar av leietiden)
Antall-hint som flytende popover med pil i stedet for inline-boks
SEO-pakke: rydd gamle filer, rikere schema, OG pa alle sider, 404-side
```

Conventions visible in the history and worth keeping:

- A prefix when the change is scoped to one area: `Skjema:`, `Vilkar:`,
  `Paminnelse:`, `Apps Script:`.
- Roughly 50–72 characters for the subject.
- ASCII-safe subjects (`kjorer`, not `kjører`) — this is how existing history is
  written and it avoids terminal encoding problems.
- A body only when the *why* is not obvious from the subject.

Commit the knowledge base alongside the change it documents, never afterwards.

## 4. The pre-commit checklist

```
[ ] On claude/norwayrob-booking-site-kc64ih
[ ] Cache-buster bumped in ALL FIVE html files if CSS or JS changed
[ ] Shared header/footer updated in all five if touched
[ ] Verified locally at 375 / 768 / 1440
[ ] No console errors
[ ] Keyboard-reachable and visibly focused
[ ] Code.gs syntax-checked if changed
[ ] No secrets, phone numbers, account numbers, customer data
[ ] MASTER_CONTEXT.md / ROADMAP.md updated if a fact or item changed
```

Verify the cache-buster mechanically:

```bash
grep -o 'styles.css?v=[0-9]*' *.html | cut -d: -f2 | sort -u
grep -o 'script.js?v=[0-9]*'  *.html | cut -d: -f2 | sort -u
```

Each command must print exactly one line. Two lines means a page will serve
stale assets.

## 5. Local verification

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Serving over HTTP rather than opening the file directly matters: `file://`
changes how relative paths, the form and fonts behave.

Screenshots, when Rob needs to see something:

```bash
NODE_PATH=/opt/node22/lib/node_modules node -e '
  const { chromium } = require("playwright");
  (async () => {
    const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto("http://localhost:8000");
    await p.screenshot({ path: "/tmp/shot.png", fullPage: true });
    await b.close();
  })();
'
```

Prefer `element.screenshot()` or `scrollIntoViewIfNeeded()` over `clip` — clip
fails with "Clipped area is either empty or outside" when the region is below
the fold.

## 6. Publishing

Only when asked.

```bash
git checkout live
git merge claude/norwayrob-booking-site-kc64ih
git push -u origin live
git checkout claude/norwayrob-booking-site-kc64ih
```

If the push fails on a network error, retry up to four times with backoff
(2s, 4s, 8s, 16s). Do not retry on a rejection — that is a real conflict.

Then confirm the Actions run succeeded, and check the live site.

### The rule that broke production once

**GitHub Pages serves only the most recent deployment in the whole repository,
regardless of branch.** An old branch's workflow deployed a different project
over norwayrob.no because it ran later.

Before adding or enabling any workflow, check every branch:

```bash
git branch -a --format='%(refname:short)' | while read b; do
  echo "── $b"; git ls-tree -r --name-only "$b" -- .github/workflows/ 2>/dev/null
done
```

There must be exactly one deploy workflow, on all branches combined.

### If the domain shows the wrong site

1. Check for a competing workflow using the command above; remove it.
2. Re-run the correct deployment via `workflow_dispatch`.
3. Confirm `CNAME` exists in the deployed tree.
4. Hard-refresh; if the layout looks broken rather than wrong, it is a stale
   cached stylesheet — bump the cache-buster.

## 7. Showing work to Rob

Rob reviews visually. He cannot read a diff and know what the page will look
like, and he should not have to.

- **Screenshots** for a single view or a before/after.
- **A private preview artifact** for anything multi-page: one self-contained
  HTML file with the Anton font base64-inlined, images as data URIs, and a small
  JS router, published privately. Republish the same file path so the URL stays
  stable and he can refresh instead of hunting for a new link.

Two things that have gone wrong before, so check them:

- Norwegian characters turn to mojibake without `<meta charset="utf-8">`, or
  encode the output with `xmlcharrefreplace`.
- Image `src` matching must tolerate cache-busting query strings:
  ```python
  re.sub(rf'src="{re.escape(path)}(\?[^"]*)?"', replacement, html)
  ```

**Never publish to `live` as a way of showing him something.**

## 8. Changing the Apps Script

The script is not deployed from this repository. The sequence is always:

1. Edit `google-apps-script/Code.gs` in the repo.
2. Syntax-check it.
3. Commit.
4. Give Rob numbered Norwegian steps with the exact menu labels:

   > 1. Åpne regnearket → **Utvidelser → Apps Script**
   > 2. Merk all koden (Ctrl/Cmd + A) og lim inn den nye
   > 3. Trykk **Lagre** (diskett-ikonet)
   > 4. **Deploy → Manage deployments** → blyanten → **Version: New version** → **Deploy**
   >
   > URL-en holder seg lik — du trenger ikke endre noe på nettsiden.

Step 4 is the one people forget. Without it the old version keeps running and
nothing appears to change.

**Never** ask him to change the deployment URL unless it genuinely rotated. It
is hardcoded in `script.js`, and a wrong URL breaks every submission with no
visible error at all.

## 9. Rollback

The site is static, so rollback is a revert:

```bash
git checkout live
git revert <sha>          # or git reset --hard <good-sha> for a clean branch
git push -u origin live
```

Deployment takes about a minute. Rollback of the Apps Script means pasting the
previous version back and redeploying — there is no automated path. Keep the
previous version's content available before overwriting.

## 10. Definition of done

A task is finished when:

- [ ] It does what was asked, completely.
- [ ] Verified locally; the checklist in §4 passes.
- [ ] Committed with a clear Norwegian message.
- [ ] Knowledge base updated in the same commit if facts changed.
- [ ] Pushed to the draft branch.
- [ ] **Not** published, unless Rob asked.
- [ ] Reported honestly — what changed, what was verified, what was not.
