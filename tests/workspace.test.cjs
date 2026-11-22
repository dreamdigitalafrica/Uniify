const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(),events={};
function el(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',hidden:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},focus(){},showModal(){},close(){},click(){}});return elements.get(key)}
const values=new Map();
const ctx=vm.createContext({console,document:{querySelector:el,querySelectorAll:()=>[],addEventListener:(n,f)=>(events[n]??=[]).push(f),body:el('body'),activeElement:el('focus'),createElement:el},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},location:{hash:''},window:{CareerEngine:require('../dist/js/career-engine.js'),addEventListener(){},scrollTo(){}},requestAnimationFrame:f=>f(),setTimeout:()=>1,clearTimeout(){},crypto:require('node:crypto').webcrypto,Intl,Date,Blob,URL,FormData:class{constructor(form){return Object.entries(form.data)}}});
vm.runInContext(fs.readFileSync('dist/js/management.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('dist/js/career-ui.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('score().value'),null);
run("state.answers=Object.fromEntries(domains.map(d=>[d[0],'yes']))");assert.equal(run('score().value'),100);
run("state.answers=Object.fromEntries(domains.map(d=>[d[0],'partial']))");assert.equal(run('score().value'),50);
run("state.answers=Object.fromEntries(domains.map(d=>[d[0],'na']))");assert.equal(run('score().value'),null);
run("state.answers={releasePlan:'yes',rights:'partial',branding:'no',audience:'na',budgetPlan:'',goals:'yes'}");assert.equal(run('score().value'),63);assert.equal(run('score().count'),4);
run('applyPlan()');assert.equal(run('activeTasks().length'),2);
run("state.tasks[0].status='Done';state.tasks[0].notes='Keep this';state.answers={rights:'yes',branding:'yes'};applyPlan()");assert.equal(run("state.tasks.find(t=>t.id==='foundation-rights').notes"),'Keep this');assert.equal(run("state.tasks.find(t=>t.id==='foundation-rights').status"),'Done');
run("state.tasks.push({id:'personal',title:'My task',status:'To do',generated:false});applyPlan();applyPlan()");assert.equal(run("state.tasks.filter(t=>t.id==='personal').length"),1);assert.equal(run('state.tasks.length'),4);
run("state.profile={artist:'<script>alert(1)</script>',currency:'NGN'}");assert.ok(run('overview()').includes('&lt;script&gt;'));
for(const view of ['overview','profile','assessment','roadmap','releases','budget','resources','settings','career']){run(`location.hash='#${view}';render()`);assert.ok(elements.get('#view').innerHTML.length>100);}
function submit(id,data,dataset={}){events.submit.forEach(fn=>fn({preventDefault(){},target:{id,data,dataset}}))}
submit('release-form',{title:'First Light',goal:'Reach new listeners',type:'Single',status:'Planning',date:'2026-12-20',budget:'200','milestone-0':'on'});assert.equal(run('state.releases.length'),1);assert.equal(run('state.tasks.filter(t=>t.releaseId===state.releases[0].id).length'),5);
submit('entry-form',{description:'Studio session',type:'Expense',amount:'50.25',date:'2026-11-20'});assert.equal(run('state.entries[0].amount'),50.25);assert.ok(run('budget()').includes('Studio session'));
submit('task-form',{title:'New personal task',status:'In progress',notes:'Notes',due:'2026-12-01',dateMode:'manual',effort:'30',releaseId:'general'});assert.equal(run("state.tasks.find(t=>t.title==='New personal task').notes"),'Notes');
run('save()');assert.ok(values.get('uniify-workspace-v2').includes('First Light'));
console.log('PASS: 9 views, score boundaries and coverage, safe rendering, roadmap idempotency, completion preservation, release milestones, decimal ledger entries, task saves and persistence.');
// Exercise editing/reporting and undo through the same delegated handlers as the UI.
submit('activity-form',{date:'2026-01-10',category:'Gig',description:'Played a show',outcome:'Met a collaborator',releaseId:'general'});
const aid=run('state.careerActivities[0].id');
submit('activity-form',{date:'2026-04-10',category:'Gig',description:'Corrected show date',outcome:'Met a collaborator',releaseId:'general'},{id:aid});assert.equal(run('state.careerActivities.length'),1);assert.equal(run('state.careerActivities[0].date'),'2026-04-10');
submit('observation-form',{platform:'Spotify',metric:'Listeners',value:'0',periodStart:'2026-01-01',periodEnd:'2026-01-31'});assert.equal(run('state.observations[0].value'),0);
run("state.tasks.find(t=>t.releaseId).notes='Retain on undo';state.profile.hours='1–3 hours';adapt('Availability changed');save()");
const revision=JSON.parse(run('JSON.stringify(state.revisions.at(-1))'));
const target={closest(selector){return selector==='[data-undo]'?{dataset:{undo:revision.id}}:null}};
events.click.forEach(fn=>fn({target,stopImmediatePropagation(){}}));assert.equal(run('state.revisions.at(-1).undone'),true);assert.equal(run('state.tasks.find(t=>t.releaseId).notes'),'Retain on undo');
for(const c of revision.changes){const task=JSON.parse(run(`JSON.stringify(state.tasks.find(t=>t.id===${JSON.stringify(c.id)}))`));if(!['Done','Deferred'].includes(task.status)&&task.dateMode!=='manual')assert.equal(task.due,c.before.due);}
run('save()');const persisted=JSON.parse(values.get('uniify-workspace-v2'));assert.equal(persisted.version,3);assert.equal(persisted.careerActivities.length,1);assert.ok(persisted.events.length);assert.ok(persisted.revisions.length);assert.ok(persisted.tasks.some(t=>t.dependencies.length));
run('state=E.migrate(JSON.parse(localStorage.getItem(KEY)));render()');assert.equal(run('state.careerActivities[0].date'),'2026-04-10');
console.log('PASS: activity editing, zero-valued observations, scheduling undo, complete structured persistence and reload.');
