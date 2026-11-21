// General DC Business Checklist — single source for /checklist and the downloadable PDF.
// Every requirement is checked against the official agency page listed in `sources`.
// When anything changes, update `updated`, then rebuild the PDF: node scripts/checklist/build-pdf.mjs

export const checklistMeta = {
  title: 'DC Business Checklist',
  subtitle: 'A general roadmap for starting and running a business in Washington, DC',
  updated: 'November 21, 2026',
  pdf: '/downloads/tidewater-dc-business-checklist.pdf',
  note: 'General information, not legal or tax advice. Requirements depend on your structure, location and activities, and they change. Confirm each step with the agency before you rely on it.',
};

export type ChecklistItem = { task: string; detail: string; link?: { label: string; href: string } };
export type ChecklistSection = { step: string; title: string; when: string; items: ChecklistItem[] };

export const checklist: ChecklistSection[] = [
  {
    step: '01', title: 'Set up the business', when: 'Before anything else',
    items: [
      { task: 'Choose your structure', detail: 'Sole proprietorship, general partnership, LLC, corporation or nonprofit. Sole proprietors and general partnerships do not file entity paperwork; LLCs, corporations, nonprofits and limited partnerships register with DLCP before applying for any license, permit or tax account.' },
      { task: 'Register your entity in BOSS', detail: 'DLCP’s Business One Stop Solution replaced CorpOnline on August 10, 2026 and now holds corporate registration and business licensing in one account (sign in with Access DC). Entities formed outside DC file a foreign registration before doing business here.', link: { label: 'boss.dc.gov', href: 'https://boss.dc.gov' } },
      { task: 'Keep a registered agent', detail: 'Every registered entity must keep a registered agent: a DC resident or a company physically located in DC.' },
      { task: 'Register any trade name', detail: 'Operating under a name other than your legal or entity name requires a trade name registration ($55). It renews by April 1 of the second year after registration and every two years after that.', link: { label: 'DLCP trade names', href: 'https://dlcp.dc.gov/node/1619191' } },
      { task: 'Get an EIN', detail: 'Apply for a free Employer Identification Number from the IRS. You need it for DC tax registration, banking and hiring.', link: { label: 'IRS EIN', href: 'https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number' } },
    ],
  },
  {
    step: '02', title: 'Register for DC taxes', when: 'After entity and EIN',
    items: [
      { task: 'File the FR-500 at MyTax.DC.gov', detail: 'One online registration sets up the DC tax accounts that apply to you, such as sales and use, withholding and franchise tax. Attach your articles or trade name certificate. Nonprofits also request exemption from OTR.', link: { label: 'MyTax.DC.gov', href: 'https://mytax.dc.gov' } },
      { task: 'Confirm Clean Hands', detail: 'DLCP will not issue a license if you owe the District more than $1,000. Request or check your Certificate of Clean Hands in MyTax.DC.gov. Grants, contracts and permits ask for it too.', link: { label: 'OTR Clean Hands', href: 'https://otr.cfo.dc.gov/page/certificate-clean-hands' } },
      { task: 'Know your sales tax position', detail: 'You need a Certificate of Registration before making taxable sales. The general rate is 6% through September 30, 2027 and 7% from October 1, 2027. Restaurant meals, alcohol, parking and hotel stays carry higher rates.', link: { label: 'OTR sales tax', href: 'https://otr.cfo.dc.gov/page/sales-tax-information-tax-law-and-guidance' } },
    ],
  },
  {
    step: '03', title: 'Secure your location', when: 'Before you sign a lease or open',
    items: [
      { task: 'Check zoning before signing', detail: 'Confirm the space is zoned for your use and that any existing Certificate of Occupancy matches what you plan to do there.' },
      { task: 'Commercial space: Certificate of Occupancy', detail: 'Issued by the Department of Buildings (DOB). Required for a business operating from a commercial location in DC.', link: { label: 'DOB', href: 'https://dob.dc.gov' } },
      { task: 'Home-based: Home Occupation Permit', detail: 'Required when the business runs from a home in DC. If your business is not located in DC, neither permit is required.' },
    ],
  },
  {
    step: '04', title: 'Get licensed', when: 'After steps 1–3',
    items: [
      { task: 'Apply for your Basic Business License', detail: 'Apply online in BOSS. Your activities determine the license category. Licenses run two or four years and expire on the last day of the month; a lapsed license draws a $75 penalty.', link: { label: 'DLCP licensing', href: 'https://dlcp.dc.gov/service/business-licensing-division' } },
      { task: 'Food businesses', detail: 'DC Health plan review for new, remodeled or converted spaces, a food establishment license and inspections, plus a certified food protection manager.', link: { label: 'DC Health food safety', href: 'https://dchealth.dc.gov/service/food-safety-and-hygiene-inspection-services-division' } },
      { task: 'Alcohol', detail: 'ABCA licenses alcohol sales; new applications include public notice and a protest period, which affects your opening timeline. Restaurants file quarterly food and alcohol sales statements.', link: { label: 'ABCA', href: 'https://abca.dc.gov' } },
      { task: 'Other regulated activities', detail: 'Contractors, salons and barbers, short-term rentals, vending and special events have their own license requirements, insurance or board approvals. Check your category before you start work.' },
    ],
  },
  {
    step: '05', title: 'Hire your first employee', when: 'Before the first payroll',
    items: [
      { task: 'Register with DOES', detail: 'Open an Employer Self-Service Portal account for unemployment insurance and DC Paid Family Leave. Paid Family Leave is employer-paid at 0.75% of wages.', link: { label: 'DOES ESSP', href: 'https://essp.does.dc.gov' } },
      { task: 'Buy workers’ compensation insurance', detail: 'Required as soon as you have one employee.' },
      { task: 'Report every new hire within 20 days', detail: 'Report new and rehired employees to the DC Directory of New Hires.', link: { label: 'DC New Hires', href: 'https://dc-newhire.com' } },
      { task: 'Pay at least the DC minimum wage', detail: '$18.40 an hour since July 1, 2026; the tipped base wage is $10.30, and tips must bring tipped workers up to the full minimum. Rates change every July 1.', link: { label: 'DOES 2026 wage notice', href: 'https://does.dc.gov/sites/default/files/dc/sites/does/publication/attachments/2026%20Minimum%20Wage%20Increase%20Notice.pdf' } },
      { task: 'Give a Notice of Hire', detail: 'Every new employee gets a written Notice of Hire (DOES template) at hiring. Keep signed copies; missing notices carry a $500 penalty per employee.' },
      { task: 'Post the required notices', detail: 'Display the DC Labor Law Universal Notice at each break room or time clock, and provide paid sick and safe leave under the Accrued Sick and Safe Leave Act.', link: { label: 'DOES posters', href: 'https://does.dc.gov/page/owh-employers' } },
      { task: 'Complete federal paperwork', detail: 'Form I-9 for every hire and Form W-4 for federal withholding.' },
    ],
  },
  {
    step: '06', title: 'Stay in good standing', when: 'Put these on the calendar',
    items: [
      { task: 'Biennial report', detail: 'Registered entities file their first biennial report by April 1 of the year after registering, then every two years.' },
      { task: 'Trade name and license renewals', detail: 'Trade names renew by April 1 every second year. Renew your Basic Business License before it expires to avoid lapse penalties.' },
      { task: 'Tax and payroll filings', detail: 'File sales tax, withholding, unemployment and Paid Family Leave returns on the schedule DC assigns, even in periods with no activity. Unfiled returns are the most common Clean Hands failure.' },
      { task: 'Keep a document file', detail: 'Articles, trade name certificate, EIN letter, Clean Hands certificate, Certificate of Good Standing, licenses, insurance certificates and a current W-9. Funders and government buyers ask for these first.' },
    ],
  },
  {
    step: '07', title: 'Get ready for funding and contracts', when: 'Once you are registered',
    items: [
      { task: 'Consider CBE certification', detail: 'DSLBD’s Certified Business Enterprise program gives for-profit businesses with their principal office in DC preference on DC government contracts. Local Business Enterprise status comes first.', link: { label: 'DSLBD CBE', href: 'https://dslbd.dc.gov/page/certification-faqs' } },
      { task: 'Check your neighborhood programs', detail: 'Many DC small-business grants are tied to a location, such as a Main Streets corridor or business improvement district. Note whether your address sits inside one.', link: { label: 'DSLBD', href: 'https://dslbd.dc.gov' } },
      { task: 'Use free help', detail: 'The DLCP Business Resource Center offers free guidance on registration and licensing.', link: { label: 'DLCP Business Resource Center', href: 'https://dlcp.dc.gov/BRC' } },
      { task: 'Track open funding', detail: 'Search source-linked DC, Maryland and Virginia grants and incentives in the free Tidewater Funding Finder.', link: { label: 'Funding Finder', href: 'https://tidewaterbid.com/funding-directory' } },
    ],
  },
];

export const checklistSources = [
  { label: 'DLCP — Steps to obtaining a Basic Business License', href: 'https://dlcp.dc.gov/node/1618236' },
  { label: 'DLCP — BOSS launch and FAQ', href: 'https://dlcp.dc.gov/BOSS' },
  { label: 'DLCP — Business licensing FAQs', href: 'https://dlcp.dc.gov/node/1614551' },
  { label: 'DLCP — Trade name registration', href: 'https://dlcp.dc.gov/node/1619191' },
  { label: 'DLCP — Registered agent', href: 'https://dlcp.dc.gov/node/1620566' },
  { label: 'OTR — New business registration (FR-500)', href: 'https://otr.cfo.dc.gov/page/new-business-registration' },
  { label: 'OTR — Sales tax rate notice', href: 'https://otr.cfo.dc.gov/publication/exemptions-federal-and-state-government-agencies-and-related-organizations' },
  { label: 'DOES — 2026 minimum wage notice', href: 'https://does.dc.gov/sites/default/files/dc/sites/does/publication/attachments/2026%20Minimum%20Wage%20Increase%20Notice.pdf' },
  { label: 'DOES — Employer notices and posters', href: 'https://does.dc.gov/page/owh-employers' },
  { label: 'DC Paid Family Leave — Employer information', href: 'https://dcpaidfamilyleave.dc.gov/employer-information/' },
  { label: 'DOES — Workers’ compensation FAQ', href: 'https://does.dc.gov/sites/default/files/dc/sites/does/page_content/attachments/OWC_FAQs_1_23_18.pdf' },
  { label: 'OAG — DC new hire reporting', href: 'https://oag.dc.gov/child-support-services/employers/new-hire-reporting' },
  { label: 'ABCA — Restaurants', href: 'https://abca.dc.gov/page/DCrestaurants' },
  { label: 'DSLBD — CBE certification FAQs', href: 'https://dslbd.dc.gov/page/certification-faqs' },
];
