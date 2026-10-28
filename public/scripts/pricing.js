// Founder-approved Bid Desk pricing (policy v1.1, 2026-10-28). Single source of truth for
// the website, the Opportunity Finder, the server and tests. Flat fees only: never a
// percentage of award, contingent fee or success fee. Restaurant Advisory is NOT priced here.
export const BID_DESK_TIER_BOUNDARY = 100000; // exactly $100,000 belongs to Tier II
export const BID_DESK_FLOOR = 1250;
export const bidDeskTiers = Object.freeze([
  Object.freeze({id:'sba-1', name:'Single Bid Architecture', range:'Under $100,000', min:0, max:BID_DESK_TIER_BOUNDARY - 0.01, price:1250}),
  Object.freeze({id:'sba-2', name:'Single Bid Architecture — Tier II', range:'$100,000 and above', min:BID_DESK_TIER_BOUNDARY, max:Infinity, price:2500})
]);
export const formatUsd = (n) => '$' + Math.round(n).toLocaleString('en-US');
// Returns the applicable tier for an estimated contract value, or null when no usable value exists.
export function tierForContractValue(value) {
  if (typeof value === 'string' && !value.replace(/[$,\s]/g, '')) return null;
  const v = typeof value === 'string' ? Number(value.replace(/[$,\s]/g, '')) : value;
  if (v === null || v === undefined || v === '' || !Number.isFinite(v) || v < 0) return null;
  return v >= BID_DESK_TIER_BOUNDARY ? bidDeskTiers[1] : bidDeskTiers[0];
}
// Custom quotes for complex or ongoing work are never below the applicable tier.
export const minimumQuote = (value) => (tierForContractValue(value) || bidDeskTiers[0]).price;
