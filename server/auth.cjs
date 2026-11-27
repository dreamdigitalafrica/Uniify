'use strict';
const {randomBytes,createHash}=require('node:crypto');
// Supabase owns identities, password hashing, email codes and refresh-token rotation.
const URL_DEFAULT='https://stnetlqzgmuaqormvnvg.supabase.co';
const ORIGIN_DEFAULT='https://www.uniifyforartists.com';
const roles=['Recording artist','Producer','Songwriter','DJ','Instrumentalist','Artist and producer','Other'];
const stages=['Just starting','Released music, building an audience','Growing my career','Established independent artist'];
const goals=['Release my first music','Grow my audience','Earn more from music','Improve career management','Find collaborators and opportunities'];
class Failure extends Error { constructor(status,message){super(message);this.status=status;} }
const reject=(status,message)=>{throw new Failure(status,message)};
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split(/=(.*)/s).slice(0,2)).filter(v=>v.length===2));}
function setSession(res,session,extra=[]){
 const age=30*24*3600;
 res.setHeader('Set-Cookie',[
  `__Host-uniify-access=${session.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`,
  `__Host-uniify-refresh=${session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`, ...extra
 ]);
}
function clearSession(res){res.setHeader('Set-Cookie',['access','refresh'].map(k=>`__Host-uniify-${k}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`));}
function validEmail(value){if(typeof value!=='string'||value.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))reject(400,'Enter a valid email address.');return value.trim();}
function validPassword(value){if(typeof value!=='string'||value.length<10||value.length>128)reject(400,'Use a password between 10 and 128 characters.');return value;}
function publicUser(u){return {id:u.id,email:u.email,artist:u.user_metadata?.artist_name||u.user_metadata?.full_name||u.user_metadata?.name||'',onboarding:u.user_metadata?.uniify_onboarding||null,onboarded:!!u.user_metadata?.uniify_onboarding?.completedAt};}
function createHandler({fetchImpl=fetch,env=process.env}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Cookie');res.setHeader('X-Content-Type-Options','nosniff');
  const send=(status,data)=>res.status(status).json(data);
  try{
   const action=req.query?.action||new URL(req.url,'https://local').pathname.split('/').pop();
   const read=action==='providers'||action==='session'||(action==='workspace'&&req.method==='GET');
   if(req.method!==(action==='workspace'&&!read?'PUT':read?'GET':'POST')){res.setHeader('Allow',action==='workspace'?'GET, PUT':read?'GET':'POST');return send(405,{error:'Method not allowed.'});}
   const origin=env.VERCEL_ENV==='preview'&&env.VERCEL_URL?'https://'+env.VERCEL_URL:env.APP_ORIGIN||ORIGIN_DEFAULT;
   if(!read){
    if(req.headers.origin!==origin)reject(403,'Please submit this request from Uniify.');
    if(!req.headers['content-type']?.startsWith('application/json'))reject(415,'JSON is required.');
   }
   let body=req.body||{};
   if(typeof body==='string'){if(Buffer.byteLength(body)>1200000)reject(413,'Request too large.');try{body=JSON.parse(body)}catch{reject(400,'Invalid request.')}}
   if(!body||Array.isArray(body)||typeof body!=='object'||Buffer.byteLength(JSON.stringify(body))>1200000)reject(400,'Invalid request.');
   const key=env.SUPABASE_PUBLISHABLE_KEY;
   if(!key)reject(503,'Account services are being configured. Please try again later.');
   const base=env.SUPABASE_URL||URL_DEFAULT;
   async function api(path,data,token,method='POST'){
    let response;
    try{response=await fetchImpl(base+'/auth/v1/'+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(method==='GET'?{}:{body:JSON.stringify(data||{})}),signal:AbortSignal.timeout(12000)});}catch{reject(503,'Account services are temporarily unavailable. Please try again.');}
    const result=await response.json().catch(()=>({}));
    if(!response.ok){
     if(response.status===429)reject(429,'Too many attempts. Please wait before trying again.');
     if((result.code||result.error_code)==='email_not_confirmed')reject(403,'Verify your email before signing in.');
     if((result.code||result.error_code)==='over_email_send_rate_limit')reject(429,'Please wait before requesting another email.');
     if(response.status>=500)reject(503,'Account services could not complete the request. Please try again later.');
     reject(400,'Unable to complete this request. Check your details or request a new code.');
    }
    return result;
   }
   if(action==='providers'){
    const settings=await api('settings',null,null,'GET');return send(200,{google:settings.external?.google===true});
   }
   if(action==='google'){
    const settings=await api('settings',null,null,'GET');
    if(!settings.external?.google)reject(503,'Google sign-in is not available yet. Please sign in with email.');
    const verifier=randomBytes(32).toString('base64url');
    const challenge=createHash('sha256').update(verifier).digest('base64url');
    res.setHeader('Set-Cookie',`__Host-uniify-pkce=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`);
    const url=new URL(base+'/auth/v1/authorize');
    for(const [k,v]of Object.entries({provider:'google',redirect_to:origin+'/auth-callback.html',code_challenge:challenge,code_challenge_method:'s256',scopes:'openid email profile',prompt:'select_account'}))url.searchParams.set(k,v);
    return send(200,{url:url.href});
   }
   if(action==='google-callback'){
    const verifier=cookies(req)['__Host-uniify-pkce'];
    if(!verifier||! /^[A-Za-z0-9_-]{43}$/.test(verifier)||typeof body.code!=='string'||!body.code||body.code.length>2048)reject(400,'Google sign-in expired. Please start again from the sign-in page.');
    const s=await api('token?grant_type=pkce',{auth_code:body.code,code_verifier:verifier});
    if(!s.access_token||!s.refresh_token)reject(400,'Unable to complete Google sign-in.');
    const user=await api('user',null,s.access_token,'GET');
    if(!user.email_confirmed_at)reject(403,'Verify your email first.');
    setSession(res,s,['__Host-uniify-pkce=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0']);
    return send(200,publicUser(user));
   }
   async function session(){
    const c=cookies(req);let token=c['__Host-uniify-access'],user;
    if(token){try{user=await api('user',null,token,'GET')}catch(error){if(error.status===503||error.status===429)throw error;}}
    if(!user){
     if(!c['__Host-uniify-refresh'])reject(401,'Please sign in.');
     let refreshed;try{refreshed=await api('token?grant_type=refresh_token',{refresh_token:c['__Host-uniify-refresh']})}catch(error){if(error.status===503||error.status===429)throw error;clearSession(res);reject(401,'Your session expired. Please sign in again.');}
     token=refreshed.access_token;user=await api('user',null,token,'GET');setSession(res,refreshed);
    }
    if(!user.email_confirmed_at)reject(403,'Verify your email first.');
    return {token,user};
   }
   if(action==='callback'){
    if(typeof body.access_token!=='string'||typeof body.refresh_token!=='string'||body.access_token.length>8192||body.refresh_token.length>8192)reject(400,'Invalid email link. Request a new email.');
    const user=await api('user',null,body.access_token,'GET');
    if(!user.email_confirmed_at)reject(403,'Verify your email first.');
    // Validate both tokens belong to a live session by rotating the supplied refresh token.
    const renewed=await api('token?grant_type=refresh_token',{refresh_token:body.refresh_token});
    if(renewed.user?.id!==user.id)reject(403,'Invalid session.');
    setSession(res,renewed);return send(200,publicUser(user));
   }
   if(action==='workspace'){
    const {token,user}=await session();
    async function db(path,method='GET',data){
     let r;try{r=await fetchImpl(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(12000)})}catch{reject(503,'Cloud storage is unavailable. Your changes remain on this device.');}
     const value=await r.json().catch(()=>null);
     if(r.status===409)reject(409,'This workspace changed on another device. Export your pending changes, then load the latest cloud copy.');
     if(!r.ok)reject(r.status===401?401:503,'Unable to access cloud storage. Please retry.');return value;
    }
    if(read){const rows=await db('artist_workspaces?select=data,revision,updated_at&user_id=eq.'+user.id);return send(200,rows[0]||{data:null,revision:0,updated_at:null});}
    if(!Number.isSafeInteger(body.revision)||body.revision<0||!body.data||body.data.version!==3||!body.data.profile||typeof body.data.profile!=='object'||!['tasks','releases','entries','history','activity','events','careerActivities','observations','revisions'].every(k=>Array.isArray(body.data[k]))||!body.data.answers||typeof body.data.answers!=='object')reject(400,'Invalid workspace data.');
    const row=await db('rpc/save_artist_workspace','POST',{expected_revision:body.revision,workspace_data:body.data});
    return send(200,row);
   }
   if(action==='signup'){
    const email=validEmail(body.email),password=validPassword(body.password),artist=body['artist-name'];
    if(typeof artist!=='string'||!artist.trim()||artist.length>120)reject(400,'Enter your artist name (up to 120 characters).');
    await api('signup?redirect_to='+encodeURIComponent(origin+'/auth-callback.html'),{email,password,data:{artist_name:artist.trim()}});
    // Always require verification in our UI, even if the provider is misconfigured.
    return send(200,{ok:true});
   }
   if(action==='signin'){
    const email=validEmail(body.email);if(typeof body.password!=='string'||!body.password||body.password.length>128)reject(400,'Enter your password.');
    const s=await api('token?grant_type=password',{email,password:body.password});
    if(!s.user?.email_confirmed_at)reject(403,'Verify your email before signing in.');
    setSession(res,s);return send(200,publicUser(s.user));
   }
   if(action==='resend-link'){await api('resend',{email:validEmail(body.email),type:'signup',email_redirect_to:origin+'/auth-callback.html'});return send(200,{ok:true});}
   if(action==='forgot-password'){
    const email=validEmail(body.email);
    try{await api('recover?redirect_to='+encodeURIComponent(origin+'/auth-callback.html'),{email})}catch(error){if(error.status===429||error.status===503)throw error;}
    return send(200,{ok:true});
   }
   if(action==='reset-password'){
    const password=validPassword(body.password);
    if(body.code!==undefined)reject(400,'Open the link in your reset email to continue.');
    const s={access_token:(await session()).token};
    if(!s.access_token)reject(400,'Invalid or expired link. Request another reset email.');
    await api('user',{password},s.access_token,'PUT');
    await api('logout?scope=global',{},s.access_token);
    clearSession(res);return send(200,{ok:true});
   }
   if(action==='session'){const {user}=await session();return send(200,publicUser(user));}
   if(action==='onboarding'){
    const {user,token}=await session();
    if(!roles.includes(body.role)||!stages.includes(body.stage)||!goals.includes(body.goal))reject(400,'Choose an option for each onboarding question.');
    const onboarding={role:body.role,stage:body.stage,goal:body.goal,completedAt:new Date().toISOString()};
    await api('user',{data:{uniify_onboarding:onboarding}},token,'PUT');
    return send(200,{...publicUser(user),onboarding,onboarded:true});
   }
   if(action==='signout'){
    try{const {token}=await session();await api('logout?scope=local',{},token)}catch(error){if(error.status!==401)throw error;}finally{clearSession(res);}
    return send(200,{ok:true});
   }
   return send(404,{error:'Not found.'});
  }catch(error){return send(error.status||500,{error:error instanceof Failure?error.message:'Unable to complete the request. Please try again.'});}
 };
}
module.exports={createHandler};
