import {bidDeskTiers,formatUsd} from './pricing.js';
const box=document.getElementById('engage');const form=document.getElementById('engage-form');
if(box?.dataset.enabled==='1'&&form){
  const quote=new URLSearchParams(location.search).get('quote')||'';const tier=bidDeskTiers.find(t=>t.id===quote.split('.')[1]);
  document.getElementById('engage-quote').value=quote;
  document.getElementById('engage-offer').textContent=tier?`${tier.name}: ${formatUsd(tier.price)} flat (${tier.range.toLowerCase()}).`:'This link does not contain a valid quote. Ask Tidewater for a new one.';
  if(!tier)form.hidden=true;
  form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const out=form.querySelector('.form-feedback');const b=form.querySelector('[type=submit]');b.disabled=true;out.textContent='Starting secure payment…';
    try{const r=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quote})});const body=await r.json().catch(()=>({}));if(!r.ok||!body.url)throw Error(body.error||'Payment could not be started. No charge was made.');if(window.plausible)window.plausible('checkout_start',{props:{tier:tier.id}});location.assign(body.url);}
    catch(err){out.textContent=err.message;out.dataset.state='error';b.disabled=false;}});
}
