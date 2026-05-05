-- JSS Career Academy: UPI payment proof system
-- Run this in Supabase SQL Editor after your earlier profiles/progress SQL.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  plan text not null default 'Starter ₹199',
  amount integer not null default 199,
  upi_id text not null default 'bapi.debnath08-1@oksbi',
  transaction_id text not null,
  screenshot_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

drop policy if exists "Users can read own payments" on public.payments;
drop policy if exists "Users can insert own payments" on public.payments;
drop policy if exists "Users can update own pending payments" on public.payments;

create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pending payments"
  on public.payments for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Create private storage bucket for payment screenshots.
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

-- Storage policies: users can upload/read their own folder only.
drop policy if exists "Users upload own payment screenshots" on storage.objects;
drop policy if exists "Users read own payment screenshots" on storage.objects;

create policy "Users upload own payment screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own payment screenshots"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Manual approval method:
-- Supabase > Table Editor > payments > change status from pending to approved.
