# Prop Firm Rules — static site

A plain HTML/CSS site (no build step, no JS framework) publishing the verified prop-firm
challenge rules database as SEO content on GitHub Pages. It cross-promotes **Prop Firm
Challenge Tracker** on Google Play.

## Source of truth

Every rule on this site comes from exactly two files, both **outside** this folder:

- `../prop_firm_presets.md` — narrative research notes, verification history, and mechanics
  explanations (drawdown taxonomy, per-firm caveats).
- `../proptracker/engine/presets.js` — the authoritative, currently-live rule data (targets,
  drawdown type/value, daily loss type/value, min trading days, consistency, restrictions,
  `rules_verified` dates) for every firm the app actually ships.

**Never invent a rule that isn't in one of those two files.** If a detail is missing or
unconfirmed, say so on the page (see the "Notes & unconfirmed details" section on every firm
page) rather than guessing. This is also why `payout-denials.html` explicitly does *not*
attribute VPN/IP checks, news-trading blackout windows, lot-size caps, or copy-trading bans to
any specific firm — none of those appear in the two source files, so the page only covers
what's actually documented (consistency rules, minimum trading days, HyroTrader's explicit
restrictions, FundedNext's inactivity rule, and Apex's soft-vs-hard daily loss distinction) and
calls out the rest as a general, unattributed caveat.

**Firms currently in scope (9):** FTMO, TopStep, Apex Trader Funding, FundedNext, FundingPips,
The5%ers, Breakout, HyroTrader, Bitfunded — i.e. exactly the firms present in
`proptracker/engine/presets.js` at the time this site was built. MyFundedFutures was
deliberately excluded: it was removed from the live app's presets as a discontinued firm, so
publishing a rules page for it here would advertise a firm the app itself no longer supports.
If a firm is later removed from (or added to) `presets.js`, mirror that change here.

## File structure

```
rulesite/
  index.html                 Comparison table of all 9 firms + links to every page
  payout-denials.html         Verified payout/pass denial triggers
  firms/{slug}.html           One page per firm — every plan's full rules
  compare/{a}-vs-{b}.html      4 head-to-head pages (fixed set, see below)
  constants/firmLinks.js      Canonical link list — see "Updating a firm link"
  css/style.css               Shared stylesheet (dark theme, matches the apps)
  sitemap.xml, robots.txt      SEO plumbing
```

Firm slugs: `ftmo`, `topstep`, `apex`, `fundednext`, `fundingpips`, `the5ers`, `breakout`,
`hyrotrader`, `bitfunded`. Compare pages are a fixed set: `apex-vs-topstep`,
`ftmo-vs-fundednext`, `breakout-vs-hyrotrader`, `ftmo-vs-the5ers`.

## Domain

Every canonical tag, JSON-LD `url`/`mainEntityOfPage`, `sitemap.xml`, and `robots.txt` is set
to `https://powerfc.github.io/prop-firm-rules` — the GitHub Pages URL for a repo named
`prop-firm-rules` under the `powerfc` account. If you ever rename the repo, move to a custom
domain, or fork this under a different account, update it everywhere with one find-and-replace
run from a shell in `rulesite/`:

```
grep -rl "powerfc.github.io/prop-firm-rules" . | xargs sed -i 's#https://powerfc.github.io/prop-firm-rules#https://your-new-domain#g'
```

## Updating a firm link

1. Edit `constants/firmLinks.js` first — it's the single documented source of truth for every
   firm's current link, affiliate status, and promo note (same shape as
   `proptracker/constants/firmLinks.js`, kept in sync by hand since this site has no build step
   to read it automatically).
2. Propagate the new URL by hand into:
   - `firms/{slug}.html` — the "Visit {Firm}'s official site →" link near the bottom of `<main>`.
   - Any `compare/*.html` page that links to that firm.
   - Update the promo note text (e.g. a discount code) anywhere it's echoed as prose, not just
     in the link itself.
3. If the firm's `affiliate` flag flips (plain link → approved affiliate, or vice versa), no
   other change is needed — the footer disclosure text already covers commission-earning links
   generically and doesn't vary per firm.

## Quarterly re-verification (the doc's own recommended cadence)

`prop_firm_presets.md` calls for a re-verification sweep roughly every quarter. When you do one:

1. Update the source files first — `prop_firm_presets.md` and
   `proptracker/engine/presets.js` — with whatever changed (new numbers, a firm added/removed,
   a `verified`/`rules_verified` flag change). That proptracker update is a separate task from
   this site; do it there first so this site is never ahead of the app.
2. For every firm whose numbers changed, update:
   - The relevant `firms/{slug}.html` table(s), prose explanation, and FAQ text.
   - The `<div class="verified">` badge date and the JSON-LD `datePublished`/`dateModified`.
   - Any `index.html` comparison-table row for that firm.
   - Any `compare/*.html` page that includes that firm.
   - The `<lastmod>` entry for that page in `sitemap.xml`.
3. If a firm is added or removed, add/remove its `firms/{slug}.html` page, its `firmLinks.js`
   entry, its `index.html` row + JSON-LD `ItemList` entry, and its `sitemap.xml` entries. Only
   remove a compare page if one of its two firms is removed — the four compare pairs are
   otherwise fixed.
4. Re-check `payout-denials.html`'s per-firm citations (the consistency-rule table, HyroTrader's
   restrictions, FundedNext's inactivity rule, Apex's soft-daily-loss note) against the updated
   source files — these are the parts most likely to go stale silently.

## Publishing to GitHub Pages

This folder is a plain static site — no `npm install`, no build command, GitHub Pages serves
it as-is.

1. Create a new public GitHub repo named `prop-firm-rules` under the `powerfc` account (don't
   nest it inside the `mobile`/`calculator`/`compound`/`proptracker` app repos) — without a
   README, so it doesn't conflict with the one already in this folder.
2. Push the contents of `rulesite/` to that repo's `main` branch, at the repo root.
3. In the repo's Settings → Pages, set Source = "Deploy from a branch", Branch = `main`,
   folder = `/ (root)`.
4. GitHub Pages will then serve the site at `https://powerfc.github.io/prop-firm-rules/`,
   matching every canonical/JSON-LD/sitemap URL already baked into these files — no further
   domain changes needed unless you later move to a custom domain (see "Domain" above).
5. Confirm `sitemap.xml` and `robots.txt` are reachable at the site root, then submit the
   sitemap in Google Search Console.
