-- Finance Tracker schema: categories, transactions, budgets.
--
-- Every table is scoped to auth.users via user_id and protected by Row-Level
-- Security, so the database itself guarantees you only ever see your own rows.
-- Composite foreign keys also guarantee a transaction's category belongs to the
-- same user and has the same type, and that budgets only target your own
-- expense categories.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.categories (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name text not null check (char_length(trim(name)) between 1 and 255),
    type text not null check (type in ('income', 'expense')),
    color text not null default '#0f5e57' check (color ~ '^#[0-9a-fA-F]{6}$'),
    created_at timestamptz not null default now(),

    unique (user_id, name, type),
    -- Targets for the composite foreign keys below.
    unique (id, user_id, type)
);

create table public.transactions (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    category_id bigint not null,
    type text not null check (type in ('income', 'expense')),
    amount numeric(12, 2) not null check (amount > 0),
    date date not null,
    note text check (note is null or char_length(note) <= 255),
    created_at timestamptz not null default now(),

    -- A category with transactions can't be deleted. "No action" (not "restrict")
    -- is checked at statement end, so deleting a whole user still cascades cleanly.
    foreign key (category_id, user_id, type)
        references public.categories (id, user_id, type) on delete no action
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);

create table public.budgets (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    category_id bigint not null,
    -- Always 'expense'; exists only so the foreign key can require an expense category.
    category_type text not null default 'expense' check (category_type = 'expense'),
    month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
    amount numeric(12, 2) not null check (amount >= 0),
    created_at timestamptz not null default now(),

    unique (user_id, category_id, month),
    foreign key (category_id, user_id, category_type)
        references public.categories (id, user_id, type) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "Users manage their own categories" on public.categories
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users manage their own transactions" on public.transactions
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users manage their own budgets" on public.budgets
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Only signed-in users can reach these tables through the API.
revoke all on public.categories, public.transactions, public.budgets from anon;
grant select, insert, update, delete on public.categories, public.transactions, public.budgets to authenticated;

-- ---------------------------------------------------------------------------
-- Default categories for every new user
-- ---------------------------------------------------------------------------

create function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.categories (user_id, name, type, color) values
        (new.id, 'Food', 'expense', '#f97316'),
        (new.id, 'Transport', 'expense', '#0ea5e9'),
        (new.id, 'Bills & Utilities', 'expense', '#ef4444'),
        (new.id, 'Shopping', 'expense', '#a855f7'),
        (new.id, 'Health', 'expense', '#22c55e'),
        (new.id, 'Entertainment', 'expense', '#eab308'),
        (new.id, 'Other Expense', 'expense', '#64748b'),
        (new.id, 'Salary', 'income', '#10b981'),
        (new.id, 'Freelance Income', 'income', '#14b8a6'),
        (new.id, 'Other Income', 'income', '#84cc16');
    return new;
end;
$$;

create trigger on_auth_user_created_seed_categories
    after insert on auth.users
    for each row execute function public.seed_default_categories();
