const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
const vm=require('node:vm');
const dir=require('node:path').resolve(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(dir+'/dist/workspace.html','utf8'),{url:'https://www.uniifyforartists.com/workspace.html?demo=1',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
for(const name of ['career-engine','recommendations','management','career-ui','workspace-refinement','digital-manager'])vm.runInContext(fs.readFileSync(dir+'/dist/js/'+name+'.js','utf8'),dom.getInternalVMContext());
function run(s){return vm.runInContext(s,dom.getInternalVMContext())}
run("location.hash='#assessment';render()");assert.ok(w.document.querySelector('[name=context_goal]'));
const f=w.document.querySelector('#assessment-form');for(const [k,v]of Object.entries({context_stage:'Released music, building an audience',context_goal:'Grow my audience',context_challenge:'Marketing and audience growth',context_hours:'1–3 hours',context_tracks:'5',context_budget:'150',context_currency:'GBP',branding:'no',audience:'no'}))f.elements[k].value=v;
f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(run('state.profile.goal'),'Grow my audience');assert.ok(run("state.tasks.some(t=>t.id==='manager-audience-baseline')"));
run("location.hash='#overview';render()");assert.equal(w.document.querySelectorAll('.manager-action').length>0,true);
run("transition(state.tasks.find(t=>t.id==='manager-audience-baseline'),'Done');save();render()");assert.equal(run("E.blocked(state,state.tasks.find(t=>t.id==='manager-audience-experiment'))"),false);
run("location.hash='#releases';render();releaseDialog()");const rf=w.document.querySelector('#release-form');for(const[k,v]of Object.entries({title:'First Light',goal:'Reach listeners',type:'Single',status:'Planning',date:'2026-12-30',budget:'150'}))rf.elements[k].value=v;rf.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(run('state.releases.length'),1);assert.equal(run('state.tasks.filter(t=>t.releaseId).length'),6);
run("location.hash='#overview';render()");w.document.querySelector('[data-manager-checkin]').click();const cf=w.document.querySelector('#manager-checkin');cf.elements.completed.value='Finished recording';cf.elements.obstacle.value='Need more time';cf.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(run('state.checkins.length'),1);
run("location.hash='#career';render()");assert.ok(w.document.querySelector('#view').textContent.includes('Career timeline'));
console.log('PASS: DOM journey assessment → recommendations → completion → release → weekly check-in → Career Progress');w.close();
