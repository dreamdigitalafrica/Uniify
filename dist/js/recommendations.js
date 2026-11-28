/* Versioned rules, not an autonomous agent. All actions are performed by the artist. */
(function(root){
 const version=1;
 const foundations=[
 ['releasePlan','Release planning','Draft your release plan','Write one release goal and list preparation, delivery and follow-up actions.',60,'/guide-release'],
 ['rights','Rights & credits','Document your rights and credits','List contributors, roles, ownership records and agreements to confirm.',45,'/guide-credits'],
 ['branding','Artist identity','Review your artist identity','Compare artist name, biography, photographs and links across your public profiles. Update one mismatch.',30,'/guide-routine'],
 ['audience','Audience','Choose an audience metric','Choose a platform and metric. Record its value and measurement period in Career Progress.',20,'/guide-routine'],
 ['budgetPlan','Money','Build your music budget','Record your available budget and planned expenses. Keep free actions available when money is limited.',30,'/guide-release'],
 ['goals','Career goals','Set a measurable career goal','Choose one outcome, a review date, and how you will measure it.',20,'/guide-routine']];
 function suggest(s){const p=s.profile||{},a=s.answers||{},out=[],releases=s.releases||[],observations=s.observations||[];const small=p.hours==='1–3 hours';
 const add=(id,title,domain,steps,reason,effort,priority,dependencies=[],releaseId=null)=>out.push({id,title,domain,steps,reason,effort:small?Math.min(effort,30):effort,minutes:small?Math.min(effort,30):effort,priority,dependencies,releaseId,ruleVersion:version,generated:true,manager:true,archived:false,status:'To do',notes:'',due:'',dateMode:'auto',suggestedDate:'',order:999});
 for(const [id,domain,title,steps,effort,url] of foundations){if((id==='audience'&&p.goal==='Grow my audience')||!['no','partial'].includes(a[id])||(id==='releasePlan'&&releases.some(r=>r.status!=='Archived')))continue;let boost=(p.challenge==='Marketing and audience growth'&&['branding','audience'].includes(id))?25:0;add('foundation-'+id,title,domain,steps,`${domain}: you reported ${a[id]==='no'?'not yet in place':'partly in place'}.`+(boost?' Marketing is your stated challenge.':''),effort,60+boost+(a[id]==='no'?10:0));out.at(-1).url=url;}
 const goal=p.goal;
 if(goal==='Grow my audience'){
  add('manager-audience-baseline','Record your audience starting point','Audience','Record one recent observation with its platform, metric, value and exact period. Do not combine followers with monthly listeners.',observations.length?'Your goal is audience growth. Review the latest observation before choosing a campaign.':'Your goal is audience growth; no audience observations are recorded yet.',20,95);
  add('manager-audience-experiment','Plan one audience experiment','Audience',`Choose one existing song and one audience channel. Define a message, three pieces of content and a review date. ${p.budget===''||p.budget==null?'Your budget is unknown: start with free channels.':Number(p.budget)===0?'Your budget is zero: use organic activity only.':'Your available budget is '+p.budget+' '+(p.currency||'GBP')+'. Set an explicit spending cap before any paid test.'}`,`You chose audience growth${p.tracks!==''&&p.tracks!=null?' and reported '+p.tracks+' released tracks':''}. Test a focused approach before committing resources.`,60,90,['manager-audience-baseline']);
  add('manager-audience-review','Review your audience experiment','Audience','Record the next observation using the same platform, metric and comparable period. Write what happened and decide whether to repeat or change the experiment.','Your campaign needs an evidence-based follow-up; completing content tasks alone does not prove growth.',30,80,['manager-audience-experiment']);
 }else if(goal==='Earn more from music'){
  add('manager-income-review','Review your music income and costs','Money','Add your actual income and expenses in Budget & income. Identify one existing activity with potential to earn and list its costs.','You chose earning more from music. Start with your actual records.',30,95);
  add('manager-income-offer','Prepare one music offer','Money','Choose a service you can deliver, such as a performance, production session or lesson. Write its scope, price and delivery time; compare with your recorded costs.','An offer follows your income and cost review. This does not guarantee sales.',45,85,['manager-income-review']);
 }else if(goal==='Find collaborators and opportunities'){
  add('foundation-network','Prepare your collaborator introduction','Connections','Write your role, current project, what you can contribute and the collaboration you want. Include one relevant music link.','You chose collaborators and opportunities as your goal.',30,95);
  add('manager-network-shortlist','Build a relevant collaborator shortlist','Connections','Identify three real contacts or public opportunities you can independently verify. Record fit, requirements and any cost; do not pay before checking legitimacy.','Your next step is finding relevant matches for your introduction.',30,85,['foundation-network']);
 }else if(goal==='Release my first music'&&!releases.some(r=>r.status!=='Archived')){
  add('manager-first-release','Define your first release','Release planning','Choose the song, outcome and a realistic target date. Create a release in Releases to generate its production and delivery plan.',`You chose a first release${p.stage?' and describe your stage as '+p.stage:''}.`,30,95);
 }else if(goal==='Improve career management'){
  add('manager-weekly-routine','Set a weekly music work session','Career management','Reserve a repeatable slot for one creative action and one career action. Choose a weekly review day.',`Career management is your goal${p.hours?'; your weekly availability is '+p.hours:''}.`,20,95);
 }
 if(!out.length)add('foundation-review','Choose one measurable next step','Career goals','Review your goal and choose a specific action you can complete this week. Complete the assessment for more relevant guidance.','No assessed gaps are known. Missing answers are not treated as failures.',20,40);
 for(const r of releases.filter(r=>r.status!=='Archived'&&r.status!=='Released')){
  const effort=r.type==='Album'?90:r.type==='EP'?60:30;
  add(r.id+':audience-plan','Define the audience for '+r.title,'Promotion',`Write who this ${r.type.toLowerCase()} is for, select one channel, and draft a message tied to the release goal. ${Number(r.budget)===0?'Use free channels.':'Confirm the promotion allocation within the project budget before spending.'}`,`Release goal: ${r.goal||'not recorded'}. Project budget: ${r.budget===''?'unknown':r.budget+' '+(p.currency||'GBP')}.`,effort,88,[r.id+':prepare'],r.id);
 }
 return out.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
 }
 function reconcile(s,now){const desired=suggest(s),ids=new Set(desired.map(t=>t.id)),changes=[];s.tasks||=[];
 for(const task of s.tasks){if((task.manager||(!task.releaseId&&task.generated&&task.id.startsWith('foundation-')))&&!ids.has(task.id)&&!['Done','Deferred'].includes(task.status)&&!task.archived){task.archived=true;task.autoRetired=true;changes.push('Retired suggestion: '+task.title);}}
 for(const next of desired){const old=s.tasks.find(t=>t.id===next.id);if(!old){s.tasks.push(next);changes.push('Added: '+next.title)}else if(!old.archived||old.autoRetired){if(old.autoRetired){old.archived=false;old.autoRetired=false;changes.push('Relevant again: '+old.title)}if(old.reason!==next.reason){changes.push('Updated guidance: '+old.title)}Object.assign(old,{reason:next.reason,steps:next.steps,priority:next.priority,ruleVersion:version,manager:true,dependencies:next.dependencies});}}
 s.managerVersion=version;if(changes.length){s.recommendationHistory||=[];s.recommendationHistory.push({time:now,changes});}return changes;
 }
 const api={version,suggest,reconcile};if(typeof module!=='undefined')module.exports=api;else root.UniifyRecommendations=api;
})(typeof window!=='undefined'?window:globalThis);
