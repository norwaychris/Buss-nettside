# CLAUDE.md — read this first, every session

This file is loaded automatically at the start of every Claude Code session in
this repository. It is deliberately short. Its only job is to point you at the
knowledge base and stop you from making the four mistakes that would cost the
most.

---

## What this project is

**NorwayRob** — a bus rental business in Bergen, Norway, run by Rob, a bus
driver with 15 years of experience and 2.2M TikTok followers. This repository
is the marketing and lead-capture website at **https://norwayrob.no**.

Static HTML/CSS/JS. No build step. No framework. Deployed to GitHub Pages.
Form submissions go to a Google Apps Script Web App, which writes to a Google
Sheet and sends email.

---

## The four rules that override everything else

### 1. Never publish without being asked

`live` is the branch that deploys. Development happens on
`claude/norwayrob-booking-site-kc64ih`. **Never merge to `live` or push to
`live` unless Rob explicitly says "publiser" or "push til live".** He reviews
changes before they reach the public site. This is not a preference — it is
the workflow, and it was established after a live incident.

### 2. Never commit secrets or private contact details

The following must **never** appear in any file in this repository, no matter
how helpful it seems:

- Bank account numbers
- Rob's phone number (it is deliberately not public; it appears only in
  confirmation emails, configured inside Apps Script)
- Personal addresses
- Customer names, emails, or any data from the booking spreadsheet
- API keys or Apps Script deployment secrets

Templates use placeholders like `[XXXX.XX.XXXXX]`. Keep it that way.

### 3. Never invent facts about the business

No fabricated reviews, testimonials, ratings, customer counts, or statistics.
This has come up before and real testimonials were removed because they were
fake. If a number is not verified in `docs/BUSINESS.md`, do not put it on the
site. **The bus has not been purchased yet** — do not write copy that assumes
a specific vehicle, seat count, or feature.

### 4. Never hardcode business facts in markup

Seat capacity, pricing, response times, and cancellation windows change. They
belong in one configurable place, not scattered across five HTML files.
See `docs/ARCHITECTURE.md` → "Configuration over hardcoding".

---

## Where everything lives

Read the document that matches what you are about to do. Do not read all of
them every time.

| If you are about to… | Read |
|---|---|
| Do anything at all | `docs/MASTER_CONTEXT.md` |
| Work as an AI agent on this repo | `docs/AI_RULES.md`, `docs/PROJECT_INSTRUCTIONS.md` |
| Change anything customer-facing | `docs/COPYWRITING_GUIDE.md`, `docs/BRAND_GUIDE.md` |
| Change layout, colour, spacing | `docs/DESIGN_SYSTEM.md`, `docs/UI_GUIDELINES.md` |
| Add or modify a UI component | `docs/COMPONENT_GUIDE.md` |
| Change the booking form or flow | `docs/UX_GUIDELINES.md` |
| Touch HTML, CSS or JS structure | `docs/ARCHITECTURE.md`, `docs/CODE_STYLE.md` |
| Change titles, meta, schema, URLs | `docs/SEO_GUIDE.md` |
| Add images, fonts or scripts | `docs/PERFORMANCE.md` |
| Change interactive elements | `docs/ACCESSIBILITY.md` |
| Commit, branch, or deploy | `docs/DEVELOPMENT_WORKFLOW.md` |
| Understand *why* something is the way it is | `docs/PRODUCT_VISION.md`, `docs/BUSINESS.md` |
| Decide what to build next | `docs/ROADMAP.md` |

---

## Language convention

Documents are split by audience, not by preference:

- **Norwegian** — business, brand, copy, UX and roadmap documents. Rob reads
  these to make decisions, and all customer-facing text is Norwegian anyway.
- **English** — architecture, code style, performance, accessibility, SEO
  mechanics, and agent instructions.

All **website content, commit messages describing content, and email templates
are Norwegian**. Code identifiers, comments in CSS/JS, and technical
documentation are English or Norwegian per `docs/CODE_STYLE.md`.

---

## Current state, in one paragraph

The site is live and indexed. The bus is **not yet purchased**. Every form
submission is therefore an *inquiry*, not a booking — nothing on the site may
promise guaranteed availability, and no payment is taken until Rob confirms he
can deliver. The immediate build priorities are in `docs/ROADMAP.md`; the top
one is spreadsheet-driven, approval-gated email automation.
