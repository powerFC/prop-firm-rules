'use strict';

// Canonical source of truth for this site's firm links — mirrors the shape
// of proptracker/constants/firmLinks.js exactly (same fields: firm, url,
// affiliate, promo_note) so the two stay easy to compare and keep in sync.
//
// This site has no build step and no JS runtime — it is NOT loaded by any
// HTML page. It exists purely as the single documented source you edit
// FIRST when a link changes, then propagate by hand into:
//   - firms/{slug}.html   → the "Get {firm}" / "Visit {firm}" link in the
//                           monetisation card and in the official-site link
//   - index.html          → the comparison table's per-firm link (if any)
//   - compare/*.html      → either firm's official-site link
//
// See README.md → "Updating a firm link" for the exact propagation steps.
export const FIRM_LINKS = [
  { firm: 'FTMO', url: 'https://trader.ftmo.com/?affiliates=lvwSFjCqtgHnSODhKApb', affiliate: true, promo_note: '' },
  { firm: 'TopStep', url: 'https://topstep.com', affiliate: false, promo_note: '' },
  { firm: 'Apex Trader Funding', url: 'https://apextraderfunding.com', affiliate: false, promo_note: '' },
  { firm: 'FundedNext', url: 'https://fundednext.com?fpr=futuresedge', affiliate: true, promo_note: '' },
  { firm: 'FundingPips', url: 'https://app.fundingpips.com/register?referral_code=E029D261', affiliate: true, promo_note: '' },
  { firm: 'The5%ers', url: 'https://www.the5ers.com/?afmc=1drj', affiliate: true, promo_note: 'Use code BI4X for a discount' },
  { firm: 'Breakout', url: 'https://breakoutprop.com', affiliate: false, promo_note: '' },
  { firm: 'HyroTrader', url: 'https://www.hyrotrader.com/?coupon=lzw1b2j', affiliate: true, promo_note: '5% discount applied through this link' },
  { firm: 'Bitfunded', url: 'https://www.bitfunded.com/client/register?regid=5204661645', affiliate: true, promo_note: '' },
];

// The cross-promo link used on every firm page's monetisation card.
export const PROPTRACKER_URL = 'https://play.google.com/store/apps/details?id=com.elitetrendhub.proptracker';

export function getFirmLink(firm) {
  return FIRM_LINKS.find(f => f.firm === firm) ?? null;
}

export function anyAffiliateActive() {
  return FIRM_LINKS.some(f => f.affiliate);
}
