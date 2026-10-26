// Form submissions use the configured serverless endpoint; no secret leaves the server.
(function(){
  for(const form of document.querySelectorAll('form[data-lead-form]')) {
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const output=form.querySelector('.form-feedback'); const button=form.querySelector('[type=submit]');
      if(!form.reportValidity()) return;
      button.disabled=true; output.textContent='Sending…'; output.dataset.state='';
      try{
        const data=Object.fromEntries(new FormData(form).entries());
        const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),mode:'cors'});
        const result=await response.json().catch(()=>({error:'Unexpected response from the server.'}));
        if(!response.ok) throw new Error(result.error||'Unable to send. Try again.');
        output.textContent=result.message||'Request received.';output.dataset.state='success';form.reset();
        if(typeof window.plausible==='function')window.plausible('lead',{props:{kind:form.dataset.kind||'contact',variant:sessionStorage.getItem('tidewater-headline')||'a'}});
      }catch(error){output.textContent=error.message||'Network error. Please try again.';output.dataset.state='error';}
      finally{button.disabled=false;}
    });
  }
})();
