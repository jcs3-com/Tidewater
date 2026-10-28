import {scoreReadiness} from './score.js';
import {formatUsd, bidDeskTiers} from './pricing.js';
import {matchBids, matchPrograms, todayISO} from './finder-logic.js';

const form = document.getElementById('finder-form');
const data = JSON.parse(document.getElementById('finder-data')?.textContent || '{}');
const results = document.getElementById('finder-results');
const contact = document.getElementById('finder-contact');
const calc = document.getElementById('finder-calc');
const feedback = document.getElementById('finder-feedback');
const validation = document.getElementById('finder-validation');
const kindInput = document.getElementById('finder-kind');
const track = (name, props) => { if (typeof window.plausible === 'function') window.plausible(name, {props}); };
const el = (tag, attrs = {}, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v); } for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) n.append(k); return n; };
const nameOf = (list, slug) => (list || []).find(x => x.slug === slug)?.name || slug;
const fmtDate = iso => iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'}) : 'Not announced';
const path = () => form.elements.namedItem('path').value;

function showPath(p) {
  for (const section of form.querySelectorAll('[data-path]')) {
    const active = section.dataset.path === p;
    section.hidden = !active;
    for (const input of section.querySelectorAll('input,select,textarea')) input.disabled = !active;
  }
  calc.hidden = !p; results.hidden = true; contact.hidden = true;
  kindInput.value = p === 'restaurant' ? 'restaurant_finder' : 'quiz';
}
form.addEventListener('change', e => {
  if (e.target.name === 'path') { showPath(e.target.value); track('finder_path', {path: e.target.value}); return; }
  if (!results.hidden && e.target.closest('[data-path]')) { results.hidden = true; contact.hidden = true; }
});
const initial = new URLSearchParams(location.search).get('path');
if (initial === 'bids' || initial === 'restaurant') { const r = form.querySelector(`input[name=path][value=${initial}]`); if (r) { r.checked = true; showPath(initial); } }
else showPath('');

function missing(scope) {
  const bad = [];
  for (const f of scope.querySelectorAll('[data-required]')) {
    if (f.disabled) continue;
    const empty = f.type === 'checkbox' ? !f.checked : !String(f.value).trim();
    const invalid = !empty && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
    f.setAttribute('aria-invalid', String(empty || invalid));
    if (empty || invalid) bad.push(f);
  }
  for (const g of scope.querySelectorAll('[data-required-group]')) {
    const section = g.closest('[data-path]');
    if (section && section.hidden) continue;
    if (!g.querySelector('input:checked')) bad.push(g.querySelector('input'));
  }
  return bad;
}

function bidItem(b) {
  return el('li', {class: 'finder-match'},
    el('span', {class: 'finder-label is-grant'}, 'Open'), el('span', {class: 'finder-label'}, nameOf(data.categories, b.category)),
    el('h3', {}, el('a', {href: b.page}, b.title)),
    el('p', {}, `${nameOf(data.jurisdictions, b.jurisdiction)} · ${b.agency}`),
    el('p', {}, `Due ${fmtDate(b.dueDate)} (confirm the closing time on the official notice).`),
    b.tier ? el('p', {}, `Published estimate puts this in ${b.tier.name}: ${formatUsd(b.tier.price)} flat.`) : el('p', {}, 'No contract value is published; the tier is confirmed with you before any fee.'),
    el('p', {}, el('a', {href: b.source, target: '_blank', rel: 'noopener noreferrer'}, 'Official solicitation ↗')));
}
function programItem(p) {
  const status = p.status === 'Open' ? {text: 'Accepting applications', cls: 'is-grant'} : p.status === 'Upcoming' ? {text: 'Upcoming', cls: ''} : {text: p.status === 'Monitoring' ? 'Not open, monitored' : p.status, cls: p.status === 'Unverified' ? 'is-unverified' : ''};
  const labels = [status, ...p.labels.filter(l => l.text !== 'Unverified lead' || p.status !== 'Unverified')];
  return el('li', {class: 'finder-match'},
    labels.map(l => el('span', {class: `finder-label ${l.cls}`}, l.text)),
    el('h3', {}, p.program), el('p', {}, p.funder),
    p.summary ? el('p', {}, p.summary) : null,
    p.sponsorRequired ? el('p', {}, 'A locality or other public body must apply or sponsor. A private business cannot apply directly.') : null,
    p.ownerCaution ? el('p', {}, 'This program is aimed at property owners. As a tenant you may need your landlord to participate.') : null,
    el('p', {}, `Deadline: ${fmtDate(p.deadline)} · Verified ${fmtDate(p.verified)}`),
    el('p', {}, el('a', {href: p.url, target: '_blank', rel: 'noopener noreferrer'}, 'Official program ↗')));
}
const nextStep = (heading, body, links) => el('div', {class: 'finder-next'}, el('h3', {}, heading), el('p', {}, body), el('div', {class: 'actions'}, links));

function renderBids(values) {
  const {score, gaps} = scoreReadiness(values);
  form.elements.namedItem('readinessScore').value = String(score);
  form.elements.namedItem('gapList').value = gaps.join('\n');
  const {exact, sameCategory} = matchBids(data.bids || [], {category: values.categories, jurisdiction: values.jurisdictions}, todayISO(), Object.fromEntries((data.jurisdictions || []).map(j => [j.slug, j.region])));
  const area = nameOf(data.jurisdictions, values.jurisdictions), cat = nameOf(data.categories, values.categories);
  const band = score >= 75 ? 'Ready to compete on a well-matched solicitation.' : score >= 50 ? 'Close. A few gaps to close before or during your first bid.' : 'Early. Closing the gaps below comes before bidding.';
  results.replaceChildren(
    el('p', {class: 'eyebrow'}, 'Your preliminary result'),
    el('h2', {}, `Readiness: ${score} / 100`),
    el('div', {class: 'readiness-meter', role: 'img', 'aria-label': `Readiness ${score} out of 100`}, el('span', {style: `width:${score}%`})),
    el('p', {class: 'lead'}, band),
    el('h3', {}, gaps.length ? 'Gaps to close' : 'No immediate flags'),
    el('ul', {}, (gaps.length ? gaps : ['Verify every requirement against the actual solicitation.']).map(g => el('li', {}, g))),
    el('h3', {}, `Open ${cat.toLowerCase()} bids in ${area}`),
    exact.length ? el('ul', {class: 'finder-match-list'}, exact.map(bidItem))
      : el('p', {class: 'finder-empty'}, `We are not tracking a verified open ${cat.toLowerCase()} solicitation in ${area} right now. That changes as agencies post new work; send us your profile and we'll match you as verified bids are added.`),
    sameCategory.length ? [el('h3', {}, `Open ${cat.toLowerCase()} bids elsewhere in the region`), el('ul', {class: 'finder-match-list'}, sameCategory.map(bidItem))] : null,
    nextStep('Want Tidewater to build the bid?', `Single Bid Architecture is ${formatUsd(bidDeskTiers[0].price)} flat for a solicitation under $100,000, or ${formatUsd(bidDeskTiers[1].price)} at $100,000 and above. We confirm fit and tier in writing before any fee.`,
      [el('a', {class: 'button', href: '#finder-contact', 'data-track': 'paid_inquiry', 'data-track-source': 'finder-bids'}, 'Ask Tidewater to review'), el('a', {class: 'button-quiet', href: '/pricing'}, 'See what the fee covers')])
  );
  track('finder_result', {path: 'bids', score: String(score), matches: String(exact.length)});
}

function renderRestaurant(values) {
  const {current, watch} = matchPrograms(data.programs || [], values, todayISO());
  const locationLabel = form.querySelector(`#r-location option[value="${CSS.escape(values.location)}"]`)?.textContent || values.location;
  results.replaceChildren(
    el('p', {class: 'eyebrow'}, 'Your preliminary result'),
    el('h2', {}, current.length ? `${current.length} program${current.length === 1 ? '' : 's'} worth a look` : 'Nothing verified is open for this profile today'),
    el('p', {}, `Programs we track for ${locationLabel}, matched to what you want help with. Every listing links to its official source. Labels separate grants from rebates, financing, sponsor-required programs and unverified leads. Eligibility is not an award.`),
    current.length ? el('ul', {class: 'finder-match-list'}, current.map(programItem))
      : el('p', {class: 'finder-empty'}, 'No program in our verified list is accepting applications for this location and project type right now. We update the list as official notices change; send us your project and we will tell you if a round opens.'),
    watch.length ? [el('h3', {}, 'Watched, but not open'), el('p', {class: 'fine'}, 'Past or expected rounds. Do not plan around these until an official notice confirms a new window.'), el('ul', {class: 'finder-match-list'}, watch.map(programItem))] : null,
    nextStep('Want help turning this into a project?', 'Tidewater scopes the improvement, qualifies the funding and manages the work through implementation. Restaurant Advisory engagements are scoped and quoted in writing.',
      [el('a', {class: 'button', href: '#finder-contact', 'data-track': 'paid_inquiry', 'data-track-source': 'finder-restaurant'}, 'Talk through the project'), el('a', {class: 'button-quiet', href: '/restaurant-advisory/funding'}, 'Browse the funding desk')])
  );
  track('finder_result', {path: 'restaurant', matches: String(current.length)});
}

function values() {
  const fd = new FormData(form);
  const v = Object.fromEntries([...fd.entries()].filter(([k]) => k !== 'interests'));
  v.interests = fd.getAll('interests');
  return v;
}

document.getElementById('finder-run')?.addEventListener('click', () => {
  const p = path(); if (!p) return;
  const bad = missing(form.querySelector(`[data-path="${p}"]`));
  if (bad.length) { validation.textContent = 'Please answer the highlighted questions.'; bad[0]?.focus(); return; }
  validation.textContent = '';
  const v = values();
  p === 'bids' ? renderBids(v) : renderRestaurant(v);
  results.hidden = false; contact.hidden = false; results.focus({preventScroll: true});
  results.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (results.hidden) { document.getElementById('finder-run')?.click(); return; }
  const bad = missing(contact);
  if (bad.length) { feedback.textContent = 'Please complete the highlighted fields.'; feedback.dataset.state = 'error'; bad[0]?.focus(); return; }
  const button = contact.querySelector('[type=submit]');
  button.disabled = true; feedback.dataset.state = ''; feedback.textContent = 'Sending…';
  const v = values();
  const payload = {...v, interests: v.interests.join(','), kind: kindInput.value};
  delete payload.path; delete payload.newsletterOptIn;
  try {
    const response = await fetch(form.action, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'We could not send your request. Your answers are still here; please try again or email hello@tidewaterbid.com.');
    feedback.textContent = body.message || 'Received. We will follow up.'; feedback.dataset.state = 'success';
    track('lead', {kind: payload.kind, source: 'opportunity-finder'});
    if (v.newsletterOptIn === 'yes') {
      fetch(form.action, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'newsletter', email: v.email, consent: 'yes', source: 'opportunity-finder', 'cf-turnstile-response': v['cf-turnstile-response']})}).catch(() => {});
    }
  } catch (error) {
    feedback.textContent = error.message || 'Network error. Your answers are still here; please try again.'; feedback.dataset.state = 'error';
    button.disabled = false;
  }
});
