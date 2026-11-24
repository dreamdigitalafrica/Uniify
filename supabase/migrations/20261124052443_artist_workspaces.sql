create table public.artist_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1200000),
 schema_version integer not null default 3 check (schema_version=3),
 revision bigint not null default 1 check (revision>0),
 updated_at timestamptz not null default now()
);
alter table public.artist_workspaces enable row level security;
revoke all on public.artist_workspaces from anon;
grant select, insert, update on public.artist_workspaces to authenticated;
create policy own_select on public.artist_workspaces for select to authenticated using ((select auth.uid())=user_id);
create policy own_insert on public.artist_workspaces for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.artist_workspaces for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.save_artist_workspace(expected_revision bigint, workspace_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.artist_workspaces;
begin
 if auth.uid() is null then raise sqlstate 'PT401' using message='Sign in required'; end if;
 if workspace_data->>'version' is distinct from '3' then raise sqlstate 'PT400' using message='Unsupported workspace version'; end if;
 if expected_revision=0 then
  insert into public.artist_workspaces(user_id,data) values(auth.uid(),workspace_data)
  on conflict(user_id) do nothing returning * into saved;
 else
  update public.artist_workspaces set data=workspace_data,revision=revision+1,updated_at=now()
  where user_id=auth.uid() and revision=expected_revision returning * into saved;
 end if;
 if saved.user_id is null then raise sqlstate 'PT409' using message='Workspace revision conflict'; end if;
 return jsonb_build_object('revision',saved.revision,'updated_at',saved.updated_at);
end $$;
revoke all on function public.save_artist_workspace(bigint,jsonb) from public,anon;
grant execute on function public.save_artist_workspace(bigint,jsonb) to authenticated;
