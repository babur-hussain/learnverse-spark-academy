-- AI Chat persistent storage
-- Tables: ai_chat_sessions, ai_chat_messages

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_archived boolean not null default false
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ai_chat_sessions_user on public.ai_chat_sessions(user_id);
create index if not exists idx_ai_chat_messages_session on public.ai_chat_messages(session_id);
create index if not exists idx_ai_chat_messages_user on public.ai_chat_messages(user_id);

-- Row Level Security
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

-- Policies: users can manage their own sessions and messages
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_sessions' and policyname = 'ai_chat_sessions_select_own'
  ) then
    create policy ai_chat_sessions_select_own on public.ai_chat_sessions for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_sessions' and policyname = 'ai_chat_sessions_insert_own'
  ) then
    create policy ai_chat_sessions_insert_own on public.ai_chat_sessions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_sessions' and policyname = 'ai_chat_sessions_update_own'
  ) then
    create policy ai_chat_sessions_update_own on public.ai_chat_sessions for update using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_sessions' and policyname = 'ai_chat_sessions_delete_own'
  ) then
    create policy ai_chat_sessions_delete_own on public.ai_chat_sessions for delete using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_messages' and policyname = 'ai_chat_messages_select_own'
  ) then
    create policy ai_chat_messages_select_own on public.ai_chat_messages for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_messages' and policyname = 'ai_chat_messages_insert_own'
  ) then
    create policy ai_chat_messages_insert_own on public.ai_chat_messages for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_messages' and policyname = 'ai_chat_messages_update_own'
  ) then
    create policy ai_chat_messages_update_own on public.ai_chat_messages for update using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_messages' and policyname = 'ai_chat_messages_delete_own'
  ) then
    create policy ai_chat_messages_delete_own on public.ai_chat_messages for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ai_chat_sessions_updated_at on public.ai_chat_sessions;
create trigger trg_ai_chat_sessions_updated_at
before update on public.ai_chat_sessions
for each row execute function public.set_updated_at();


