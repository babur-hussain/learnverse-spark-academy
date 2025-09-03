create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  device_id uuid references public.notification_devices(id) on delete set null,
  token text,
  status text not null, -- sent | failed
  error text,
  created_at timestamptz not null default now()
);

alter table public.notification_logs enable row level security;

create policy "Admins can view logs"
on public.notification_logs for select
using (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Admins can insert logs"
on public.notification_logs for insert
with check (
  exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create index if not exists idx_notification_logs_notification on public.notification_logs(notification_id);

