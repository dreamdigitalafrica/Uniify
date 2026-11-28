const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,ResourceLoader}=require('jsdom'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..');
class Scripts extends ResourceLoader {
 constructor(beforeDesign){super();this.beforeDesign=beforeDesign;}
 async fetch(url){
  const name=path.basename(url);
  if(name==='workspace-design.js') await this.beforeDesign?.();
  return fs.readFileSync(path.join(dir,'dist/js',name));
 }
}
const tick=()=>new Promise(r=>setTimeout(r,10));
async function until(fn){for(let i=0;i<200;i++){if(fn())return;await tick()}throw Error('Timed out waiting for workspace');}
const copy=v=>JSON.parse(JSON.stringify(v));
function boot(db,{owner='artist-a',fail=false,beforeDesign}={}){let failing=fail;const html=fs.readFileSync(path.join(dir,'dist/workspace.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');const d=new JSDOM(html,{url:'https://www.uniifyforartists.com/workspace.html#overview',runScripts:'dangerously',resources:new Scripts(beforeDesign),pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.confirm=()=>true;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.fetch=async(url,opts={})=>{let status=200,data;if(url==='/api/auth/session')data={id:owner,artist:owner,onboarded:true,onboarding:{goal:'Grow my audience'}};else if(url==='/api/workspace'){const row=db.get(owner)||{data:null,revision:0};if(opts.method==='PUT'){if(failing)throw Error('offline');const body=JSON.parse(opts.body);if(body.revision!==row.revision){status=409;data={error:'Revision conflict'}}else{const saved={data:body.data,revision:row.revision+1};db.set(owner,copy(saved));data={revision:saved.revision}}}else data=copy(row);}else data={ok:true};return {ok:status<300,status,json:async()=>data};}}});const script=d.window.document.createElement('script');script.src='/js/account-session.js';d.window.document.body.append(script);return {d,setFail(v){failing=v}}}
test('account workspace saves, reloads on another device, isolates accounts and retains failed writes',async()=>{const db=new Map(),a=boot(db);await until(()=>a.d.window.document.querySelector('.studio-bottom-nav'));assert.equal(await a.d.window.uniifyCloud.flush(),true);assert.ok(db.get('artist-a').data.tasks.length);
 const b=boot(db);await until(()=>b.d.window.document.querySelector('.studio-bottom-nav'));await b.d.window.uniifyCloud.flush();assert.equal(b.d.window.document.querySelector('.greeting h1').textContent,'Welcome back, artist-a.');
 // Same revision on two devices: save one; the other must stop with its pending copy intact.
 const revision=db.get('artist-a').revision;const left=copy(db.get('artist-a').data),right=copy(left);left.profile.artist='Saved on device A';a.d.window.uniifyCloud.save(left);await a.d.window.uniifyCloud.flush();right.profile.artist='Pending on device B';b.d.window.uniifyCloud.save(right);assert.equal(await b.d.window.uniifyCloud.flush(),false);assert.equal(db.get('artist-a').data.profile.artist,'Saved on device A');assert.equal(b.d.window.document.querySelector('.local-badge').textContent,'Changed on another device');assert.ok(b.d.window.localStorage.getItem('uniify-account-artist-a-pending').includes('Pending on device B'));
 const c=boot(db,{owner:'artist-b'});await until(()=>c.d.window.document.querySelector('.studio-bottom-nav'));await c.d.window.uniifyCloud.flush();assert.equal(db.get('artist-b').data.profile.artist,'artist-b');
 c.setFail(true);const pending=copy(db.get('artist-b').data);pending.profile.artist='Offline edit';c.d.window.uniifyCloud.save(pending);assert.equal(await c.d.window.uniifyCloud.flush(),false);assert.ok(c.d.window.localStorage.getItem('uniify-account-artist-b-pending'));c.setFail(false);assert.equal(await c.d.window.uniifyCloud.flush(),true);assert.equal(db.get('artist-b').data.profile.artist,'Offline edit');assert.equal(c.d.window.localStorage.getItem('uniify-account-artist-b-pending'),null);
 for(const item of[a,b,c])item.d.window.close();assert.ok(revision>0);
});


test('workspace waits for the final interface before rendering account records',async()=>{
 let releaseDesign, designRequested=false;
 const gate=new Promise(resolve=>{releaseDesign=resolve;});
 const {d}=boot(new Map(),{beforeDesign(){designRequested=true;return gate;}});
 const {document}=d.window;
 try{
  await until(()=>designRequested && d.window.document.querySelector('#account-links [data-signout]'));
  assert.equal(document.body.hasAttribute('data-workspace-loading'),true);
  assert.equal(document.querySelector('#view h1'),null);
  releaseDesign();
  await until(()=>!document.body.hasAttribute('data-workspace-loading'));
  assert.equal(document.querySelector('#workspace-loading'),null);
  assert.equal(document.querySelector('#view h1').textContent,'Welcome back, artist-a.');
 }finally{
  releaseDesign();
  d.window.close();
 }
});
