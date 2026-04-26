-- Chronicle Weaver initial schema
-- Additive alongside Firebase — activated via EXPO_PUBLIC_USE_SUPABASE=true

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  subscription_tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users own their profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Stories
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  era text not null,
  setting jsonb not null default '{}',
  status text not null default 'active', -- active | completed | abandoned
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table stories enable row level security;
create policy "Users own their stories"
  on stories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Characters
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories on delete cascade not null,
  name text not null,
  background text,
  attributes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table characters enable row level security;
create policy "Character access via story ownership"
  on characters for all
  using (
    exists (
      select 1 from stories
      where stories.id = characters.story_id
        and stories.user_id = auth.uid()
    )
  );

-- Turns
create table if not exists turns (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories on delete cascade not null,
  turn_number integer not null,
  player_input text,
  ai_response text not null,
  model_used text,
  tokens_used integer,
  created_at timestamptz not null default now()
);

alter table turns enable row level security;
create policy "Turn access via story ownership"
  on turns for all
  using (
    exists (
      select 1 from stories
      where stories.id = turns.story_id
        and stories.user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_stories_user_id on stories(user_id);
create index if not exists idx_turns_story_id on turns(story_id);
create index if not exists idx_turns_story_turn on turns(story_id, turn_number);
