import {tierForContractValue,formatUsd} from './pricing.js';
const form=document.getElementById('tier-check');const out=document.getElementById('tier-result');
form?.addEventListener('submit',e=>{e.preventDefault();
  const raw=form.elements.namedItem('value').value;const tier=tierForContractValue(raw);
  if(!tier){out.textContent='Enter a contract value in dollars, for example 85,000.';out.dataset.state='error';return;}
  out.dataset.state='';out.textContent=`${tier.name}: ${formatUsd(tier.price)} flat. Tier confirmed in writing before any payment.`;
  if(typeof window.plausible==='function')window.plausible('tier_check',{props:{tier:tier.id}});
});
