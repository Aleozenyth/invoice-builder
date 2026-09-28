-- Jalankan di Supabase: SQL Editor > New query

-- 1) Data aplikasi: satu dokumen JSON per pengguna
create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
create policy "own data select" on public.user_data for select using ((select auth.uid()) = user_id);
create policy "own data insert" on public.user_data for insert with check ((select auth.uid()) = user_id);
create policy "own data update" on public.user_data for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own data delete" on public.user_data for delete using ((select auth.uid()) = user_id);

-- 2) Langganan: pengguna hanya BOLEH MEMBACA; yang menulis adalah webhook pembayaran (service role)
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz
);
alter table public.subscriptions enable row level security;
create policy "own subscription select" on public.subscriptions for select using ((select auth.uid()) = user_id);

-- 3) Setiap pengguna baru otomatis mendapat paket free
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.subscriptions (user_id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
