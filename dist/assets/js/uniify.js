/* The supplied template's geometry is retained; controls now support artist planning. */
feather.replace();
const go=()=>location.assign('workspace.html');
document.querySelectorAll('.btn-play').forEach(b=>{b.setAttribute('aria-label','Open artist workspace');b.onclick=go});
document.querySelectorAll('.btn-more').forEach(b=>{b.disabled=true;b.tabIndex=-1;b.setAttribute('aria-hidden','true')});
let saved=[];try{saved=JSON.parse(localStorage.getItem('uniify-saved-topics')||'[]')}catch{}
document.querySelectorAll('button').forEach(b=>{if(b.querySelector('[data-feather="heart"],.feather-heart')){const row=b.closest('.list-item');const title=row?.querySelector('.list-title')?.textContent.trim()||'Your next move';const update=()=>{const on=saved.includes(title);b.setAttribute('aria-label',(on?'Unsave ':'Save ')+title);b.setAttribute('aria-pressed',on);row?.classList.toggle('saved',on)};update();b.onclick=()=>{saved=saved.includes(title)?saved.filter(t=>t!==title):[...saved,title];try{localStorage.setItem('uniify-saved-topics',JSON.stringify(saved))}catch{}update()}}});
document.querySelectorAll('.card-body .btn').forEach(b=>b.onclick=go);
const note=document.querySelector('#career-note');try{note.value=localStorage.getItem('uniify-career-note')||''}catch{}
const status=document.createElement('span');status.id='note-status';status.setAttribute('role','status');document.querySelector('#note-form .d-flex').prepend(status);
document.querySelector('#note-form').onsubmit=e=>{e.preventDefault();try{localStorage.setItem('uniify-career-note',note.value);status.textContent='Saved in this browser.'}catch{status.textContent='Storage unavailable. Copy your note to keep it.'}};
const search=document.querySelector('#topic-search');search.closest('form').onsubmit=e=>e.preventDefault();search.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();document.querySelectorAll('[data-id]:not(.page-hero)').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(q))});
document.querySelectorAll('[data-toggle="fullscreen"]').forEach(a=>{a.setAttribute('role','button');a.setAttribute('aria-label','Toggle fullscreen');a.tabIndex=0;a.onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();a.onkeydown=e=>{if(e.key==='Enter')a.click()}});
document.querySelectorAll('[data-target="#navbarCollapse"]').forEach(a=>{a.setAttribute('aria-label','Toggle navigation');a.setAttribute('aria-expanded','false');a.onclick=()=>a.setAttribute('aria-expanded',a.getAttribute('aria-expanded')!=='true')});
document.querySelectorAll('img').forEach(i=>i.alt='');
window.addEventListener('scroll',()=>document.querySelector('#header').classList.toggle('scrolled',scrollY>30),{passive:true});
