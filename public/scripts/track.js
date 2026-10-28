// Privacy-friendly conversion events. Sends nothing unless a Plausible domain is configured.
document.addEventListener('click',e=>{const el=e.target.closest('[data-track]');if(!el||typeof window.plausible!=='function')return;
  const props={};for(const [k,v] of Object.entries(el.dataset))if(k.startsWith('track')&&k!=='track')props[k.slice(5).toLowerCase()]=v;
  window.plausible(el.dataset.track,{props});});
