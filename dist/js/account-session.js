/* Cloud is authoritative for accounts; demo data stays separate. */
(async()=>{
 const demo=new URLSearchParams(location.search).get('demo')==='1';
 try{
  if(demo){window.uniifyStorageKey='uniify-workspace-v2';}
  else{
   async function request(path,options={}){const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});const value=await r.json();if(!r.ok){const error=Error(value.error||'Account services are unavailable.');error.status=r.status;throw error;}return value;}
   const account=await request('/api/auth/session');
   if(!account.onboarded){location.replace('/onboarding');return;}
   const key=window.uniifyStorageKey='uniify-account-'+account.id,pendingKey=key+'-pending';
   let cloud=await request('/api/workspace'),revision=cloud.revision;
   const blank={version:3,profile:{artist:account.artist,...account.onboarding},tasks:[],releases:[],entries:[],history:[],activity:[],answers:{},events:[],careerActivities:[],observations:[],revisions:[]};
   function parse(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
   const pending=parse(pendingKey),legacy=parse(key);
   let initial=cloud.data||blank;
   const candidate=pending?.data||(!cloud.data&&legacy);
   if(candidate){
    const section=document.createElement('section');section.className='panel';const h=document.createElement('h1');h.textContent=pending?'Unsaved changes found':'Import this device’s workspace?';section.append(h);
    const p=document.createElement('p');p.textContent=`${candidate.profile?.artist||'Artist'} · ${candidate.tasks?.length||0} tasks · ${candidate.releases?.length||0} releases · ${candidate.entries?.length||0} financial entries. ${cloud.data?'A cloud copy also exists. Export local changes before choosing the cloud copy.':'Your existing records will be retained.'}`;section.append(p);
    const download=document.createElement('button');download.className='text-link';download.textContent='Export device copy';download.onclick=()=>downloadData(candidate);section.append(download);
    const useLocal=document.createElement('button');useLocal.className='theme-btn-two';useLocal.textContent=pending&&pending.revision!==revision?'Keep changes for review':'Import and continue';useLocal.disabled=!!(cloud.data&&pending?.revision!==revision);section.append(useLocal);
    const useCloud=document.createElement('button');useCloud.className='text-link';useCloud.textContent=cloud.data?'Use latest cloud copy':'Start a new cloud workspace';section.append(useCloud);document.querySelector('#view').append(section);
    initial=await new Promise(resolve=>{useLocal.onclick=()=>{resolve(candidate);section.remove()};useCloud.onclick=()=>{localStorage.removeItem(pendingKey);resolve(initial);section.remove()}});
   }
   window.uniifyInitialState=initial;
   let queued=null,inFlight=null,conflict=false,last=JSON.stringify(cloud.data),timer;
   const badge=document.querySelector('.local-badge');badge.setAttribute('role','status');badge.setAttribute('aria-live','polite');badge.hidden=true;
   const retry=document.createElement('button');retry.className='text-link';retry.textContent='Retry save';retry.hidden=true;badge.after(retry);
   function status(text,failed=false){badge.textContent=text;badge.hidden=true;retry.hidden=!failed;}
   function downloadData(data){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='uniify-pending-workspace.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
   const exportPending=document.createElement('button');exportPending.className='text-link';exportPending.textContent='Export pending changes';exportPending.hidden=true;retry.after(exportPending);exportPending.onclick=()=>downloadData(parse(pendingKey)?.data||initial);
   const latest=document.createElement('button');latest.className='text-link';latest.textContent='Load cloud copy';latest.hidden=true;exportPending.after(latest);latest.onclick=()=>{if(confirm('Export pending changes first. Load the latest cloud copy and discard this device’s pending changes?')){localStorage.removeItem(pendingKey);location.reload()}};
   async function flush(){clearTimeout(timer);if(inFlight)return inFlight;if(conflict)return false;
    inFlight=(async()=>{while(queued){const data=queued;queued=null;status('Saving…');try{const result=await request('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,data})});revision=result.revision;last=JSON.stringify(data);if(queued)localStorage.setItem(pendingKey,JSON.stringify({revision,data:queued}));if(!queued){localStorage.removeItem(pendingKey);status('Saved to cloud');exportPending.hidden=true;}}catch(error){queued=queued||data;conflict=error.status===409;status(conflict?'Changed on another device':navigator.onLine?'Save failed':'Offline — changes pending',!conflict);exportPending.hidden=false;latest.hidden=!conflict;return false;}}return true;})().finally(()=>inFlight=null);return inFlight;
   }
   window.uniifyCloud={save(data){const copy=JSON.parse(JSON.stringify(data));if(JSON.stringify(copy)===last&&!queued)return;queued=copy;try{localStorage.setItem(pendingKey,JSON.stringify({revision,data:copy}))}catch{status('Device backup unavailable');}status(conflict?'Changed on another device':'Changes pending');clearTimeout(timer);timer=setTimeout(flush,350);},flush};
   retry.onclick=flush;window.addEventListener('online',flush);window.addEventListener('beforeunload',e=>{if(queued||inFlight){e.preventDefault();e.returnValue='';}});
   status(cloud.data?'Saved to cloud':'Preparing cloud workspace');
   const signout=document.createElement('button');signout.className='text-link';signout.dataset.signout='';signout.hidden=true;signout.textContent='Sign out';signout.onclick=async()=>{signout.disabled=true;try{if(!await flush())throw Error('Save or export pending changes before signing out.');await request('/api/auth/signout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});localStorage.removeItem(key);sessionStorage.removeItem('uniify-onboarding-draft');location.replace('/signin');}catch(e){status(e.message,true);alert(e.message);signout.disabled=false;}};document.querySelector('#account-links').append(signout);
   document.querySelector('.app-footer > span:nth-of-type(2)').textContent='Private workspace · Cloud sync';
  }
  for(const src of ['career-engine.js','recommendations.js','management.js','career-ui.js','workspace-refinement.js','digital-manager.js','workspace-design.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='js/'+src;script.onload=resolve;script.onerror=reject;document.body.append(script)});
 }catch(error){if(error.status===401||error.status===403){location.replace('/signin');return;}const view=document.querySelector('#view');view.textContent='Unable to open your workspace. '+error.message+' ';const retry=document.createElement('a');retry.href=location.href;retry.textContent='Try again';view.append(retry);}
})();
