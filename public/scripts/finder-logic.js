// Pure Opportunity Finder logic, shared by the browser and the Node tests. No DOM, no network.
import {tierForContractValue} from './pricing.js';
export const VERIFY_WINDOW_DAYS = 45;
const DAY = 86400000;
export const todayISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Never advertise a program as open on stale or expired evidence, even if the static page is old.
export function programStatus(p, today = todayISO()) {
  if (p.status === 'Open' && p.deadline && p.deadline < today) return 'Closed';
  if (p.status === 'Open' && (!p.verified || (Date.parse(today) - Date.parse(p.verified)) > VERIFY_WINDOW_DAYS * DAY)) return 'Unverified';
  return p.status || 'Unverified';
}
const SPONSOR = /\b(localit(y|ies)|political subdivisions?|local governments?|government sponsor|sponsor(ed|ing)? (by|organization)|must (partner|collaborate)|partner with a locality)\b/i;
const OWNER_ONLY = /\b(building owners?|property owners?|not automatically available to tenants|ownership requirements)\b/i;
export function classifyProgram(p, today = todayISO()) {
  const status = programStatus(p, today);
  const text = `${p.applicants || ''} ${p.match || ''}`;
  const labels = [];
  const type = p.type || '';
  if (status === 'Unverified') labels.push({text: 'Unverified lead', cls: 'is-unverified'});
  if (/^Grant/i.test(type)) labels.push({text: 'Grant', cls: 'is-grant'});
  else if (/Rebate|Incentive/i.test(type)) labels.push({text: 'Rebate or incentive', cls: 'is-rebate'});
  else if (/Tax/i.test(type)) labels.push({text: 'Tax incentive', cls: 'is-rebate'});
  else if (/Loan|Financ/i.test(type)) labels.push({text: 'Financing, not a grant', cls: ''});
  else if (/Technical/i.test(type)) labels.push({text: 'Technical assistance', cls: ''});
  const sponsorRequired = SPONSOR.test(text);
  if (sponsorRequired) labels.push({text: 'Requires a government sponsor', cls: 'is-sponsor'});
  return {status, labels, sponsorRequired, ownerOnly: OWNER_ONLY.test(text)};
}
const GEO = {
  'washington-dc': ['DC', 'DMV', 'National'],
  'maryland': ['Maryland', 'DMV', 'National'],
  'northern-virginia': ['Virginia', 'DMV', 'National'],
  'charlottesville': ['Charlottesville / Central VA', 'Virginia', 'National'],
  'virginia-other': ['Virginia', 'National'],
  'other': ['National']
};
const FIT = {
  'funding': ['Funding & Incentives'],
  'efficiency': ['Operational Performance'],
  'equipment': ['Operational Performance'],
  'operations': ['Operational Performance'],
  'food-waste': ['Food Waste & Resource Recovery']
};
export function matchPrograms(programs, {location, interests = [], tenure} = {}, today = todayISO()) {
  const geos = GEO[location] || [];
  const fits = new Set(interests.flatMap(i => FIT[i] || []));
  const wantsEquipment = interests.includes('equipment') || interests.includes('efficiency');
  const relevant = programs.filter(p => (p.geography || []).some(g => geos.includes(g)) &&
    ((p.fit || []).some(f => fits.has(f)) || (wantsEquipment && /Rebate|Incentive/i.test(p.type || '')) || interests.includes('funding')));
  const rows = relevant.map(p => {const c = classifyProgram(p, today); return {...p, ...c, ownerCaution: c.ownerOnly && tenure === 'lease'};});
  const rank = r => (r.status === 'Open' ? 0 : r.status === 'Upcoming' ? 1 : 2) + (r.sponsorRequired ? .5 : 0);
  rows.sort((a, b) => rank(a) - rank(b) || a.program.localeCompare(b.program));
  return {current: rows.filter(r => r.status === 'Open' || r.status === 'Upcoming'), watch: rows.filter(r => r.status !== 'Open' && r.status !== 'Upcoming')};
}
// `regions` maps jurisdiction slug -> market region (e.g. 'dmv', 'charleston'). The "other areas" fallback
// stays inside the visitor's own region so a DMV operator is never shown out-of-market work by default.
export function matchBids(bids, {category, jurisdiction} = {}, today = todayISO(), regions = {}) {
  const live = bids.filter(b => b.dueDate && b.dueDate >= today && b.source);
  const home = regions[jurisdiction];
  const sameRegion = b => !home || !regions[b.jurisdiction] || regions[b.jurisdiction] === home;
  const withTier = b => ({...b, tier: tierForContractValue(b.estimatedValue)});
  const byDue = (a, b) => a.dueDate.localeCompare(b.dueDate);
  return {
    exact: live.filter(b => b.category === category && b.jurisdiction === jurisdiction).sort(byDue).map(withTier),
    sameCategory: live.filter(b => b.category === category && b.jurisdiction !== jurisdiction && sameRegion(b)).sort(byDue).slice(0, 4).map(withTier)
  };
}
