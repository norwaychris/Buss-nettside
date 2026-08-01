# PROJECT_INSTRUCTIONS.md

**How to work on NorwayRob.** This is the operating manual: how to start a
session, how to make a change, how to verify it, and how to hand it back.
`AI_RULES.md` lists the hard prohibitions; this document describes the process.

---

## 1. Session protocol

Every session, in this order:

1. **Read `CLAUDE.md`** — it loads automatically. Do not skip it.
2. **Read `MASTER_CONTEXT.md`** — the current true state of the business and
   the site. It changes; your memory of it does not.
3. **Read only the topic documents your task touches.** The routing table in
   `CLAUDE.md` tells you which. Reading all eighteen every time wastes context
   and buries the ones that matter.
4. **Check the branch.** `git branch --show-current` must be
   `claude/norwayrob-booking-site-kc64ih`. If it is `live`, stop and switch.
5. **Check working tree state.** `git status`. Do not start on top of someone
   else's uncommitted work without understanding it.

At the end of a session, if you changed a fact about the business, the stack,
or a decision — **update `MASTER_CONTEXT.md` in the same commit**. A knowledge
base that drifts is worse than no knowledge base, because it is trusted.

## 2. How to approach a change

### 2.1 Understand the request as asked

Rob describes outcomes, not implementations: *"make the box darker and more
transparent"*, *"the image looks weird"*, *"make the form look more
professional"*. Translate that into a concrete change, make it, and show him.
Do not expand the scope. When he said "only change the hero section", he meant
only the hero section — twice.

### 2.2 Ask only when the answer changes the work

Rob is not a developer and will not enjoy being asked about implementation
details. Ask when two readings of his request would produce materially
different results. Otherwise pick the sensible option, do it, and say what you
chose in one sentence.

### 2.3 Make the smallest change that fully solves it

This is a 3,000-line static site with no framework and no tests. Its greatest
strength is that anyone can open a file and understand it. Every abstraction
you add takes that away. Do not introduce a build step, a framework, a package
manager, or a dependency without an explicit decision recorded in
`ARCHITECTURE.md`.

### 2.4 Check the ripple

A change to a shared component is a change to every page. Before you finish:

- Changed `styles.css` or `script.js`? **Bump the cache-busting query string
  in every HTML file that references it.** All of them. See
  `DEVELOPMENT_WORKFLOW.md` §4.
- Changed the header, footer or brand block? It is duplicated in
  `index.html`, `om.html`, `vilkar.html`, `personvern.html` and `404.html`.
  Update all five or the site becomes visibly inconsistent.
- Changed a form field name? It is a spreadsheet column. See
  `ARCHITECTURE.md` §5 before touching it.
- Changed a customer-facing promise? Check whether it also appears in
  `vilkar.html`, the FAQ, the JSON-LD `FAQPage` block, and the email
  templates. Promises leak across all four.

### 2.5 Verify before claiming done

There are no automated tests. Verification is manual and non-negotiable:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Check, at minimum:

- The page renders at 375px, 768px and 1440px width.
- The form submits and the success overlay appears.
- No console errors.
- Keyboard-only: Tab through the page; every interactive element is reachable
  and visibly focused.
- If you changed `Code.gs`, syntax-check it — Apps Script gives no useful
  errors until runtime:
  ```bash
  cp google-apps-script/Code.gs /tmp/check.js && node --check /tmp/check.js
  ```

If you did not verify something, say so. Never report a change as working
because it should work.

## 3. How to show work to Rob

Rob reviews visually, not in diffs. He cannot read a pull request and know what
the page will look like. Two options:

- **Local screenshots.** Serve the site and capture with Playwright
  (Chromium at `/opt/pw-browsers/chromium`). Good for a single view.
- **A private preview artifact.** A self-contained HTML page with fonts and
  images inlined and a small JS router, published privately. This is the
  established mechanism for multi-page review, and republishing the same file
  path keeps the URL stable so he can refresh instead of hunting for a new
  link.

Never publish to `live` as a way of showing him something.

## 4. Commit discipline

One logical change per commit. Norwegian subject lines, imperative, describing
the *outcome* for Rob rather than the mechanism:

```
Skjema: sluttid valgfri - vi regner ut tidsbruken for A-til-B-turer
Vilkar: bussen kjorer ikke fra gruppen (ventetid gar av leietiden)
SEO-pakke: rikere schema, OG pa alle sider, sitemap lastmod, 404-side
```

Details in `DEVELOPMENT_WORKFLOW.md` §3.

## 5. Publishing

**Only when Rob explicitly asks.** The words are "publiser", "push", "push
til live", or an unambiguous equivalent. "Det ser bra ut" is not permission.

```bash
git checkout live
git merge claude/norwayrob-booking-site-kc64ih
git push -u origin live
git checkout claude/norwayrob-booking-site-kc64ih
```

Then confirm the Actions run succeeded. GitHub Pages serves only the most
recent deployment across the whole repository — a second workflow on another
branch will silently take over the domain. This has happened. See
`DEVELOPMENT_WORKFLOW.md` §6.

## 6. Working with the Apps Script

The script in `google-apps-script/Code.gs` is **not deployed by this
repository**. It is copy-pasted into the Apps Script editor inside Rob's
spreadsheet and deployed manually. This means:

- The repository copy is the source of truth **only if someone keeps it in
  sync**. Assume drift is possible. If behaviour does not match the code, the
  deployed version is different.
- After any change, Rob must redeploy: *Deploy → Manage deployments → pencil →
  Version: New version → Deploy*. The URL stays the same.
- Write instructions for him in plain Norwegian, as numbered steps, with the
  exact menu labels. He follows them precisely and they must be correct.
- Never ask him to change the deployment URL unless it genuinely rotated —
  it is hardcoded in `script.js` and a wrong URL silently breaks every
  submission with no visible error.

## 7. Handling copy changes

All customer-facing text is Norwegian. Rob writes and speaks Norwegian and will
correct your tone. Before changing any sentence a customer sees, read
`COPYWRITING_GUIDE.md`. The recurring failure mode is text that is technically
accurate but sounds bureaucratic — Rob has rejected that repeatedly ("det
virker så nøye", "det ser ikke bra ut"). Hard rules live in `vilkar.html`;
everything the customer reads first should sound like a person.

## 8. When you disagree with Rob

Say so once, in one or two sentences, with the concrete consequence — then do
what he asked. He has overruled recommendations before and been right, because
he knows his market. The exceptions where you must not simply comply:

- Anything that would put a fabricated fact on the site.
- Anything that would commit a secret, a bank account or a phone number.
- Anything that would publish without his explicit request.

## 9. Definition of done

A change is done when all of these are true:

- [ ] It does what was asked, completely — not a partial version.
- [ ] Cache-busting bumped if CSS or JS changed.
- [ ] All five HTML files updated if a shared component changed.
- [ ] Verified locally at three widths, with keyboard, with no console errors.
- [ ] `MASTER_CONTEXT.md` updated if a fact or decision changed.
- [ ] `ROADMAP.md` updated if the change closes or creates an item.
- [ ] Committed on the draft branch with a clear Norwegian message.
- [ ] **Not** published, unless Rob asked.
- [ ] Reported honestly: what changed, what you verified, what you did not.
