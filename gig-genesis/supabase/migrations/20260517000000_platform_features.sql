-- EARNGEN-AI platform: gamification, nearby, payments, NDA, marketplace

-- Gamification
create table if not exists public.user_gamification (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  skill_score integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  xp_reward integer not null default 0
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.skill_exchanges (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  partner_id uuid references auth.users (id) on delete set null,
  offered_skill text not null,
  wanted_skill text not null,
  status text not null default 'open' check (status in ('open', 'matched', 'in_progress', 'completed', 'cancelled')),
  xp_reward integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id text primary key,
  title text not null,
  description text not null,
  xp_reward integer not null,
  badge_id text references public.badges (id)
);

create table if not exists public.user_challenges (
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id text not null references public.challenges (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

-- Nearby discovery
create table if not exists public.user_locations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  city text,
  is_live boolean not null default false,
  availability text not null default 'offline' check (availability in ('offline', 'available', 'busy', 'open_to_collab')),
  skills text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Payments / wallet
create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance_inr numeric(12, 2) not null default 0,
  pending_inr numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users (id) on delete set null,
  to_user_id uuid references auth.users (id) on delete set null,
  amount_inr numeric(12, 2) not null,
  type text not null check (type in ('send', 'receive', 'milestone', 'escrow_hold', 'escrow_release', 'withdraw')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'held')),
  note text,
  created_at timestamptz not null default now()
);

-- NDA
create table if not exists public.nda_agreements (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  counterparty_id uuid references auth.users (id) on delete set null,
  project_title text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_signature', 'signed', 'expired')),
  document_url text,
  trust_score_delta integer not null default 0,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Rewards marketplace
create table if not exists public.marketplace_rewards (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  points_cost integer not null,
  partner_brand text,
  stock integer,
  image_emoji text not null default '🎁',
  expires_at timestamptz
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reward_id text not null references public.marketplace_rewards (id),
  points_spent integer not null,
  status text not null default 'fulfilled' check (status in ('pending', 'fulfilled', 'expired')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.user_gamification enable row level security;
alter table public.user_badges enable row level security;
alter table public.skill_exchanges enable row level security;
alter table public.user_locations enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.nda_agreements enable row level security;
alter table public.redemptions enable row level security;

create policy "Users read own gamification" on public.user_gamification for select using (auth.uid() = user_id);
create policy "Users update own gamification" on public.user_gamification for update using (auth.uid() = user_id);
create policy "Users insert own gamification" on public.user_gamification for insert with check (auth.uid() = user_id);

create policy "Badges are public read" on public.badges for select using (true);
create policy "User badges read own or public profile" on public.user_badges for select using (true);

create policy "Exchanges readable" on public.skill_exchanges for select using (true);
create policy "Users create exchanges" on public.skill_exchanges for insert with check (auth.uid() = requester_id);

create policy "Locations readable when live" on public.user_locations for select using (is_live = true or auth.uid() = user_id);
create policy "Users manage own location" on public.user_locations for all using (auth.uid() = user_id);

create policy "Users read own wallet" on public.wallets for select using (auth.uid() = user_id);
create policy "Users read own transactions" on public.transactions for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users read own NDAs" on public.nda_agreements for select
  using (auth.uid() = creator_id or auth.uid() = counterparty_id);
create policy "Users create NDAs" on public.nda_agreements for insert with check (auth.uid() = creator_id);

create policy "Rewards public read" on public.marketplace_rewards for select using (true);
create policy "Users read own redemptions" on public.redemptions for select using (auth.uid() = user_id);
create policy "Users redeem" on public.redemptions for insert with check (auth.uid() = user_id);
