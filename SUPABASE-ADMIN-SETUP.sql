-- Pixel Arcade — configuration admin sécurisée
-- À exécuter dans Supabase SQL Editor.
-- IMPORTANT : ne mets jamais la clé service_role dans config.js ou dans le navigateur.

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists disabled_at timestamptz null;

create table if not exists public.player_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game text,
  last_seen timestamptz not null default now()
);

alter table public.player_presence enable row level security;

-- Un joueur connecté peut seulement écrire sa propre présence.
drop policy if exists "presence own upsert" on public.player_presence;
create policy "presence own upsert" on public.player_presence
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- L'admin sera vérifié dans l'Edge Function avec la clé service_role.
-- Ne donne PAS de SELECT public sur cette table.

create index if not exists player_presence_last_seen_idx on public.player_presence(last_seen desc);

-- Après avoir créé ton compte administrateur, récupère son UUID depuis
-- Supabase > Authentication > Users, puis exécute :
-- update public.profiles set is_admin=true where id='UUID-DE-TON-COMPTE';

-- Pour les comptes désactivés, l'Edge Function utilise auth.users.banned_until
-- et profiles.disabled_at. La clé service_role reste uniquement côté Edge Function.
