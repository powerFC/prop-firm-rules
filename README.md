# FuturesEdge website — static site

A plain HTML/CSS site (no build step, no JS framework) for **futuresedgetrade.app** — the
FuturesEdge marketing site, app landing pages, prop-firm rules database, and exchange
comparison, published via GitHub Pages with a custom domain (see `CNAME`).

## Site structure

```
/                                  Home
/apps/trading-journal.html         App landing page (SEO)
/apps/prop-firm-tracker.html       App landing page (SEO)
/apps/position-size-calculator.html App landing page (SEO)
/apps/compound-calculator.html     App landing page (SEO) — app not yet live
/prop-firm-rules/                  Verified prop-firm rules database (see below)
/exchanges/index.html              Exchange comparison (fees, leverage, markets)
/exchanges/{bitget,bybit,bingx}.html One page per exchange, with its referral link
/guides/index.html                 Guides & content hub
css/style.css                      Shared stylesheet — one file, every page
sitemap.xml, robots.txt            SEO plumbing — regenerate whenever a page is added/removed
CNAME                              Custom domain (futuresedgetrade.app) — GitHub-managed, don't edit
googleebf924999ffb8567.html        Google Search Console site-verification file — don't remove
```

Every page shares one header nav (Home / Apps / Prop Firm Rules / Exchanges / Guides) and one
footer (site nav + app links + Etsy shop + contact + a disclosure paragraph), styled from the
single `css/style.css`. There is no build step — edit the HTML files directly.

## Prop Firm Rules — source of truth

Every rule under `/prop-firm-rules/` comes from exactly two files, both **outside** this repo:

- `../prop_firm_presets.md` — narrative research notes, verification history, and mechanics
  explanations (drawdown taxonomy, per-firm caveats).
- `../proptracker/engine/presets.js` — the authoritative, currently-live rule data (targets,
  drawdown type/value, daily loss type/value, min trading days, consistency, restrictions,
  `rules_verified` dates) for every firm the app actually ships.

**Never invent a rule that isn't in one of those two files.** If a detail is missing or
unconfirmed, say so on the page (see the "Notes & unconfirmed details" section on every firm
page) rather than guessing. This is also why `prop-firm-rules/payout-denials.html` explicitly
does *not* attribute VPN/IP checks, news-trading blackout windows, lot-size caps, or
copy-trading bans to any specific firm — none of those appear in the two source files, so the
page only covers what's actually documented and calls out the rest as a general, unattributed
caveat.

**Firms currently in scope (9):** FTMO, TopStep, Apex Trader Funding, FundedNext, FundingPips,
The5%ers, Breakout, HyroTrader, Bitfunded — i.e. exactly the firms present in
`proptracker/engine/presets.js` at the time this section was built. MyFundedFutures was
deliberately excluded: it was removed from the live app's presets as a discontinued firm, so
publishing a rules page for it here would advertise a firm the app itself no longer supports.
If a firm is later removed from (or added to) `presets.js`, mirror that change here.

```
prop-firm-rules/
  index.html                 Comparison table of all 9 firms + links to every page
  payout-denials.html        Verified payout/pass denial triggers
  firms/{slug}.html          One page per firm — every plan's full rules
  compare/{a}-vs-{b}.html    4 head-to-head pages (fixed set, see below)
  constants/firmLinks.js     Canonical link list — see "Updating a firm link"
```

Firm slugs: `ftmo`, `topstep`, `apex`, `fundednext`, `fundingpips`, `the5ers`, `breakout`,
`hyrotrader`, `bitfunded`. Compare pages are a fixed set: `apex-vs-topstep`,
`ftmo-vs-fundednext`, `breakout-vs-hyrotrader`, `ftmo-vs-the5ers`.

## Exchange facts

Every fee, leverage cap and market claim on `/exchanges/` is taken directly from the exchange's
own public fee schedule / contract-info pages (Bitget, Bybit, BingX), not from memory or
third-party roundups. Where a fact isn't cleanly verifiable from a public page, the table uses
"—" rather than a guess. Re-check these numbers periodically — exchange fee tiers and leverage
caps change without notice.

## Domain

Every canonical tag, JSON-LD `url`/`mainEntityOfPage`, `sitemap.xml`, and `robots.txt` is set to
`https://futuresedgetrade.app`. The custom domain is wired via the `CNAME` file at the repo root
(GitHub auto-creates/maintains this when you set a custom domain in repo Settings → Pages — do
not delete it). If the domain ever changes again, update it everywhere with one find-and-replace
run from a shell at the repo root:

```
grep -rl "futuresedgetrade.app" . --include="*.html" --include="*.xml" --include="*.txt" \
  | xargs sed -i 's#https://futuresedgetrade.app#https://your-new-domain#g'
```

## Updating a firm link

1. Edit `prop-firm-rules/constants/firmLinks.js` first — it's the single documented source of
   truth for every firm's current link, affiliate status, and promo note (same shape as
   `proptracker/constants/firmLinks.js`, kept in sync by hand since this site has no build step
   to read it automatically).
2. Propagate the new URL by hand into:
   - `prop-firm-rules/firms/{slug}.html` — the affiliate CTA card near the top and bottom of `<main>`.
   - Any `prop-firm-rules/compare/*.html` page that links to that firm.
   - Update the promo note text (e.g. a discount code) anywhere it's echoed as prose, not just
     in the link itself.
3. If the firm's `affiliate` flag flips (plain link → approved affiliate, or vice versa), no
   other change is needed — the disclosure text already covers commission-earning links
   generically and doesn't vary per firm.

## Updating an exchange link

Exchange referral links live only on `/exchanges/{slug}.html` (the CTA card) — update the link
there when a code changes. The comparison table on `/exchanges/index.html` links through to
each exchange's own page rather than out to the exchange directly, so it never needs its own
link update.

## Quarterly re-verification (the doc's own recommended cadence)

`prop_firm_presets.md` calls for a re-verification sweep roughly every quarter. When you do one:

1. Update the source files first — `prop_firm_presets.md` and `proptracker/engine/presets.js` —
   with whatever changed (new numbers, a firm added/removed, a `verified`/`rules_verified` flag
   change). That proptracker update is a separate task from this site; do it there first so this
   site is never ahead of the app.
2. For every firm whose numbers changed, update:
   - The relevant `prop-firm-rules/firms/{slug}.html` table(s), prose explanation, and FAQ text.
   - The `<div class="verified">` badge date and the JSON-LD `datePublished`/`dateModified`.
   - Any `prop-firm-rules/index.html` comparison-table row for that firm.
   - Any `prop-firm-rules/compare/*.html` page that includes that firm.
   - The `<lastmod>` entry for that page in `sitemap.xml`.
3. If a firm is added or removed, add/remove its `firms/{slug}.html` page, its `firmLinks.js`
   entry, its `index.html` row + JSON-LD `ItemList` entry, and its `sitemap.xml` entries. Only
   remove a compare page if one of its two firms is removed — the four compare pairs are
   otherwise fixed.
4. Re-check `payout-denials.html`'s per-firm citations against the updated source files — these
   are the parts most likely to go stale silently.
5. Re-check `/exchanges/` fee and leverage figures against each exchange's public fee schedule —
   these change without notice and aren't tied to any source file's re-verification cadence.

## Publishing to GitHub Pages

This folder is a plain static site — no `npm install`, no build command, GitHub Pages serves it
as-is, at the custom domain in `CNAME`.

1. Push to the `main` branch of the `futuresedgetrade` (or equivalent) repo under the `powerfc`
   account, at the repo root.
2. In the repo's Settings → Pages, Source = "Deploy from a branch", Branch = `main`,
   folder = `/ (root)`, and the custom domain set to `futuresedgetrade.app` (GitHub writes the
   `CNAME` file automatically when you do this — don't hand-edit it).
3. Confirm `sitemap.xml` and `robots.txt` are reachable at the site root, then submit the
   sitemap in Google Search Console.
