create table public."AppSecret" (
  id text primary key,
  value text not null,
  "createdAt" timestamptz not null default now()
);

alter table public."AppSecret" enable row level security;
revoke all on table public."AppSecret" from anon, authenticated;
grant select on table public."AppSecret" to service_role;

insert into public."AppSecret" (id, value)
values ('telegram_token_encryption', encode(gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;