// Supabase's default Site URL also lands here when an older email omitted redirect_to.
if(location.hash.includes('access_token=')||location.hash.includes('error='))location.replace('/auth-callback'+location.hash);
