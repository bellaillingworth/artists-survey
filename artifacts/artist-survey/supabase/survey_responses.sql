-- Run in Supabase SQL Editor if you do not already have this table.
-- Matches lib/db/src/schema/survey.ts (Drizzle) column names.

create table if not exists public.survey_responses (
  id bigint generated always as identity primary key,
  favorite_artist text not null,
  genre text not null,
  college_year text not null,
  platforms text not null,
  other_platform text,
  created_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security;

-- PostgREST needs table privileges; without these you may see permission or odd HTTP errors.
grant insert, select on table public.survey_responses to anon;
grant insert, select on table public.survey_responses to authenticated;

-- Anonymous survey: anyone can submit and read rows (aggregates are computed in the app).
drop policy if exists "survey_responses_anon_insert" on public.survey_responses;
create policy "survey_responses_anon_insert"
  on public.survey_responses for insert
  to anon
  with check (true);

drop policy if exists "survey_responses_anon_select" on public.survey_responses;
create policy "survey_responses_anon_select"
  on public.survey_responses for select
  to anon
  using (true);
