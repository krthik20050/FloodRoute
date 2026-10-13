-- Draft persistence foundation. The MVP uses fixtures and exposes no writes.
-- Apply only to a dedicated Supabase project after reviewing trust/moderation rules.
create table if not exists public.flood_reports (
  id uuid primary key default gen_random_uuid(),
  edge_id text not null,
  description text not null check (char_length(description) between 1 and 2000),
  severity text not null check (severity in ('high', 'moderate')),
  verification text not null default 'unverified' check (verification in ('unverified', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.flood_reports enable row level security;
revoke all on public.flood_reports from anon, authenticated;
-- No RLS policies: clients cannot select, insert, update or delete.
-- A future audited server moderation workflow must grant narrowly scoped access.
