-- Savings goals.
--
-- Money moved into a goal is an ordinary expense transaction (category
-- "Savings") linked to the goal; money taken out is an income transaction
-- (category "Savings Withdrawal") linked to it. A goal's balance is therefore
-- deposits minus withdrawals, and deposits reduce the month's net like any
-- other expense (see ADR-005).

create table public.savings_goals (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name text not null check (char_length(trim(name)) between 1 and 255),
    target_amount numeric(12, 2) not null check (target_amount > 0),
    target_date date,
    color text not null default '#0f5e57' check (color ~ '^#[0-9a-fA-F]{6}$'),
    created_at timestamptz not null default now(),

    unique (user_id, name),
    -- Target for the composite foreign key below.
    unique (id, user_id)
);

alter table public.transactions add column goal_id bigint;

-- A transaction can only point at its owner's goal. Deleting a goal keeps the
-- transactions (the money really moved) and just unlinks them.
alter table public.transactions
    add constraint transactions_goal_fkey
    foreign key (goal_id, user_id) references public.savings_goals (id, user_id)
    on delete set null (goal_id);

create index transactions_goal_idx on public.transactions (goal_id) where goal_id is not null;

alter table public.savings_goals enable row level security;

create policy "Users manage their own savings goals" on public.savings_goals
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

revoke all on public.savings_goals from anon;
grant select, insert, update, delete on public.savings_goals to authenticated;
