import {scoreReadiness} from './score.js';
const form=document.getElementById('readiness-form');const button=document.getElementById('calculate');const results=document.getElementById('results');const followup=document.getElementById('followup');
const quizFields=['entity','years','licenses','gl','wc','bond','portals','government','staff','jurisdictions','categories'];
button?.addEventListener('click',()=>{
  for(const field of quizFields){if(!form.elements.namedItem(field).checkValidity()){form.elements.namedItem(field).reportValidity();return;}}
  const data=Object.fromEntries(new FormData(form).entries());const {score,gaps}=scoreReadiness(data);
  form.elements.namedItem('readinessScore').value=String(score);form.elements.namedItem('gapList').value=gaps.join('\n');
  document.getElementById('score-display').textContent=`${score} / 100`;
  const list=document.getElementById('gap-display');list.replaceChildren();for(const gap of (gaps.length?gaps:['No immediate flags in this check. Verify every requirement in a real solicitation.'])){const li=document.createElement('li');li.textContent=gap;list.append(li)}
  results.hidden=false;followup.hidden=false;results.scrollIntoView({behavior:'smooth',block:'start'});
});
for(const field of quizFields)form.elements.namedItem(field)?.addEventListener('change',()=>{results.hidden=true;followup.hidden=true;form.elements.namedItem('readinessScore').value='';});
form?.addEventListener('submit',async e=>{
  e.preventDefault();if(results.hidden){button.click();return;}if(!form.reportValidity())return;
  const send=form.querySelector('[type=submit]');const output=followup.querySelector('.form-feedback');send.disabled=true;output.textContent='Sending…';
  try{const data=Object.fromEntries(new FormData(form).entries());const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const body=await response.json().catch(()=>({}));if(!response.ok)throw Error(body.error||'Could not send.');output.textContent=body.message||'Result received.';output.dataset.state='success';send.disabled=true;if(window.plausible)window.plausible('lead',{props:{kind:'quiz'}});}
  catch(error){output.textContent=error.message;output.dataset.state='error';send.disabled=false;}
});
