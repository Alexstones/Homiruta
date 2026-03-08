-- Clean start: Drop existing tables if they exist
drop table if exists expenses cascade;
drop table if exists stops cascade;
drop table if exists routes cascade;
drop table if exists payments cascade;
drop table if exists subscriptions cascade;
drop table if exists users cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  image text,
  password_hash text,
  role text default 'user' check (role in ('user', 'admin')),
  sos_contact text,
  vehicle_type text default 'truck' check (vehicle_type in ('car', 'truck', 'van', 'motorcycle', 'pickup', 'ufo')),
  preferred_map_app text check (preferred_map_app in ('google', 'waze')),
  last_location jsonb,
  subscription_status text default 'none',
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_end_date timestamp with time zone,
  reset_token text,
  reset_token_expiry timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Subscriptions table
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_subscription_id text not null,
  status text not null,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Payments table
create table payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_payment_intent_id text not null,
  amount integer not null,
  currency text not null,
  status text not null,
  created_at timestamp with time zone default now()
);

-- Routes table
create table routes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  date date not null,
  is_optimized boolean default false,
  status text default 'active' check (status in ('draft', 'active', 'completed')),
  total_distance float default 0,
  total_time text,
  start_location jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Stops table
create table stops (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid references routes(id) on delete cascade,
  address text not null,
  customer_name text,
  priority text default 'NORMAL' check (priority in ('HIGH', 'NORMAL', 'FIRST', 'LAST')),
  time_window text,
  notes text,
  lat float not null,
  lng float not null,
  is_completed boolean default false,
  is_failed boolean default false,
  is_current boolean default false,
  "order" integer not null,
  locator text,
  num_packages integer default 1,
  task_type text default 'DELIVERY' check (task_type in ('DELIVERY', 'COLLECTION')),
  arrival_time_type text default 'ANY' check (arrival_time_type in ('ANY', 'SPECIFIC')),
  estimated_duration integer default 10,
  completed_at timestamp with time zone,
  failed_reason text
);

-- Expenses table
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid references routes(id) on delete cascade,
  driver_id uuid references users(id) on delete cascade,
  type text not null check (type in ('FUEL', 'TOLL', 'MAINTENANCE', 'OTHER')),
  amount float not null,
  description text,
  date timestamp with time zone default now()
);

-- Indices for performance
create index idx_routes_user_id on routes(user_id);
create index idx_stops_route_id on stops(route_id);
create index idx_expenses_driver_id on expenses(driver_id);
create index idx_expenses_route_id on expenses(route_id);

-- Admin Stats Function
create or replace function get_admin_stats()
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'users', (select count(*) from users where role = 'user'),
    'routes', (select count(*) from routes),
    'expenses', (select count(*) from expenses),
    'totalSpent', coalesce((select sum(amount) from expenses), 0),
    'breakdown', coalesce((
      select json_object_agg(type, total)
      from (
        select type, sum(amount) as total
        from expenses
        group by type
      ) t
    ), '{}'::json)
  ) into result;
  return result;
end;
$$ language plpgsql security definer;

