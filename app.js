(() => {
  'use strict';
  const spreads = [
    ['ONE','One Card',1],['SCA','Situation · Challenge · Advice',3],['PPF','Past · Present · Future',3],
    ['LOVE','Love & Relationships',5],['CAREER','Career & Work',5],['PATHS','Two Paths',5],
    ['GROWTH','Personal Growth',5],['CELTIC','Celtic Cross',10]
  ];
  const $ = id => document.getElementById(id);
  let selected = 'SCA', pending = null;
  $('spreads').replaceChildren(...spreads.map(([id,name,count]) => {
    const b = document.createElement('button'); b.type='button'; b.className='spread';
    b.dataset.id=id; b.setAttribute('aria-pressed',String(id===selected));
    const label=document.createElement('strong');label.textContent=name;
    const meta=document.createElement('small');meta.textContent=`${count} card${count===1?'':'s'}`;
    b.append(label,meta);b.addEventListener('click',()=>{selected=id;document.querySelectorAll('.spread').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});return b;
  }));
  function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text||'';if(cls)e.className=cls;return e;}
  function block(title,body){const el=node('div','','reading-block');el.append(node('h3',title),node('p',body));return el;}
  function show(data){
    $('saved-question').textContent=`“${data.question}”`;
    $('cards').replaceChildren(...data.cards.map(c=>{const e=node('div','','card');e.append(node('div','✦','symbol'),node('small',c.positionName),node('strong',c.cardName),node('small',c.orientation));return e;}));
    const r=data.reading, container=$('reading'); container.replaceChildren(block('Overall message',r.overallMessage));
    r.cardInterpretations.forEach(item=>{const e=node('div','','interpretation');e.append(node('strong',`${item.positionName} — ${item.cardName}`),node('p',item.interpretation));container.append(e);});
    container.append(block('Putting it together',r.synthesis),block('For your reflection',r.reflection));
    $('result').classList.remove('hidden');$('result').scrollIntoView({behavior:'smooth'});
  }
  function send(payload){
    const endpoint=window.TAROT_CONFIG?.endpoint;
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint||''))throw Error('Set your Apps Script /exec URL in config.js first.');
    const form=document.createElement('form');form.method='POST';form.action=endpoint;form.target='tarot-transport';form.style.display='none';
    for(const [key,value] of Object.entries(payload)){const input=document.createElement('input');input.name=key;input.value=value;form.append(input);}
    document.body.append(form);form.submit();form.remove();
  }
  // HtmlService uses an inner Google iframe, so event.source differs from our outer frame.
  // Authenticate the Google origin AND the unpredictable per-request nonce.
  window.addEventListener('message',event=>{
    if(!pending || !/^https:\/\/[a-z0-9-]*script\.googleusercontent\.com$/.test(event.origin))return;
    const message=event.data;if(!message||message.type!=='TAROT_RESULT'||message.nonce!==pending.nonce)return;
    clearTimeout(pending.timer);pending=null;$('draw').disabled=false;
    if(message.ok){$('status').textContent='Reading saved.';show(message.data);}else $('status').textContent=message.error||'The reading could not be completed. Please try again.';
  });
  $('draw').addEventListener('click',()=>{
    const question=$('question').value.trim();
    if(!question){$('status').textContent='Please enter a question first.';$('question').focus();return;}
    if(pending)return;
    const nonce=crypto.randomUUID(),session=localStorage.getItem('tarot-session')||crypto.randomUUID();
    localStorage.setItem('tarot-session',session);
    $('draw').disabled=true;$('status').textContent='Shuffling the deck and reflecting on your question…';$('result').classList.add('hidden');
    pending={nonce,timer:setTimeout(()=>{pending=null;$('draw').disabled=false;$('status').textContent='The request timed out. Check the deployment and try again.';},90000)};
    try{send({action:'reading',question,spreadId:selected,sessionId:session,nonce});}
    catch(e){clearTimeout(pending.timer);pending=null;$('draw').disabled=false;$('status').textContent=e.message;}
  });
  $('again').addEventListener('click',()=>{$('result').classList.add('hidden');$('question').value='';$('question').focus();window.scrollTo({top:0,behavior:'smooth'});});
})();
