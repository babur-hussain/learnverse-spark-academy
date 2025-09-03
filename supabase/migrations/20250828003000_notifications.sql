-- Notifications schema: device tokens and notifications log

create table if not exists public.notification_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  token text unique not null,
  platform text check (platform in ('ios','android','web')) not null,
  app_version text,
  enabled boolean not null default true,
  last_seen_at timestamptz default now(),
  created_at timestamptz not null default now()
);

alter table public.notification_devices enable row level security;

create policy "Users can manage their own device tokens"
on public.notification_devices
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  data jsonb,
  target text not null, -- e.g., 'all' | 'role:student' | 'user:<uuid>'
  created_by uuid references auth.users(id) on delete set null,
  sent_count integer default 0,
  status text default 'queued', -- queued | sent | failed
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Admins can read notifications"
on public.notifications for select
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  )
);

create policy "Admins can insert notifications"
on public.notifications for insert
with check (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  )
);

-- Helpful index for lookups
create index if not exists idx_notification_devices_user on public.notification_devices(user_id);
create index if not exists idx_notification_devices_enabled on public.notification_devices(enabled);

