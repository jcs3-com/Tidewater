// Refreshes "Days left" labels in the visitor's browser so they stay current between site rebuilds.
// Mirrors daysLeftLabel() in src/lib/config.ts.
(function(){
  function label(date,status){
    if(status==='SAMPLE')return 'Example';
    if(status==='Awarded')return 'Awarded';
    if(status==='Closed')return 'Closed';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return '';
    var now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
    var days=Math.round((Date.parse(date+'T00:00:00Z')-today)/86400000);
    if(days<0)return 'Closed';
    if(days===0)return 'Due today';
    return days+(days===1?' day left':' days left');
  }
  var els=document.querySelectorAll('[data-days-left]');
  for(var i=0;i<els.length;i++){
    var el=els[i],text=label(el.dataset.date,el.dataset.status);
    el.textContent=text;
    el.classList.toggle('is-urgent',/^(Due today|[1-7] days? left)$/.test(text));
    el.classList.toggle('is-closed',text==='Closed');
  }
})();
