(async()=>{
 const params=new URLSearchParams(location.hash.slice(1));history.replaceState(null,'',location.pathname);
 const status=document.querySelector('#callback-status');
 try{
  if(params.has('error'))throw Error('This email link is invalid or expired. Request a fresh email.');
  const access_token=params.get('access_token'),refresh_token=params.get('refresh_token');
  if(!access_token||!refresh_token)throw Error('This link is incomplete. Request a fresh email.');
  const r=await fetch('/api/auth/callback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token,refresh_token})});const account=await r.json();if(!r.ok)throw Error(account.error||'Unable to verify this link.');
  sessionStorage.removeItem('uniify-pending-email');
  location.replace(params.get('type')==='recovery'?'reset-password.html?verified=1':account.onboarded?'workspace.html':'onboarding.html');
 }catch(e){status.textContent=e.message;const a=document.createElement('a');a.href='forgot-password.html';a.textContent='Request password recovery';status.after(a);}
})();
