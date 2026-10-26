// Illustrative prep score only: NOT an agency qualification or award prediction.
export const scoreReadiness = (a={}) => {
  let n=0; const gaps=[];
  if(a.entity==='registered')n+=10;else gaps.push('Confirm your legal business entity and good-standing status.');
  if(a.years==='2plus')n+=8;else if(a.years==='1to2')n+=5;else gaps.push('Gather evidence of operating history and relevant commercial work.');
  if(a.licenses==='yes')n+=10;else gaps.push('Confirm which trade, food-service or other licenses apply to your bids.');
  if(a.gl==='yes')n+=12;else gaps.push('Request your general-liability certificate and check limits against each solicitation.');
  if(a.wc==='yes'||a.wc==='not-applicable')n+=10;else gaps.push('Confirm workers’ compensation coverage or a lawful exemption.');
  if(a.bond==='yes')n+=6;else gaps.push('If a solicitation requires a bond, check bonding capacity with your broker.');
  if(a.portals==='yes')n+=8;else gaps.push('Identify and complete vendor-portal registrations before short deadlines.');
  if(a.government==='yes')n+=8;else {n+=4;gaps.push('Build strong commercial references for bids without government-project history.');}
  if(a.staff==='10plus')n+=10;else if(a.staff==='5to9')n+=8;else if(a.staff==='1to4')n+=5;else gaps.push('Define staffing and subcontractor capacity for contracted hours.');
  if(a.jurisdictions)n+=10;else gaps.push('Choose the areas you can actually service.');
  if(a.categories)n+=8;else gaps.push('Choose the kinds of contracts you are equipped to deliver.');
  return {score:Math.min(100,n),gaps};
};
