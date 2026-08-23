create type public."ProductStatus" as enum ('AVAILABLE', 'COMING_SOON', 'HIDDEN');
create type public."SubscriptionStatus" as enum ('PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
create type public."InstagramConnectionStatus" as enum ('PENDING', 'ACTIVE', 'ERROR', 'DISABLED');
create type public."OrderStatus" as enum ('WAITING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

create table public."Product" (
  id text primary key,
  name text not null,
  "shortDescription" text not null,
  description text not null,
  category text not null,
  status public."ProductStatus" not null default 'COMING_SOON',
  features jsonb not null default '[]'::jsonb,
  "priceAmount" bigint,
  currency text not null default 'IRR',
  "billingPeriod" text,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."Subscription" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references public."User"(id) on delete cascade,
  "productId" text not null references public."Product"(id) on delete restrict,
  status public."SubscriptionStatus" not null default 'PENDING',
  "startsAt" timestamptz,
  "expiresAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."Order" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references public."User"(id) on delete cascade,
  "productId" text not null references public."Product"(id) on delete restrict,
  amount bigint,
  currency text not null default 'IRR',
  status public."OrderStatus" not null default 'WAITING_PAYMENT',
  provider text,
  "providerRef" text,
  "createdAt" timestamptz not null default now(),
  "paidAt" timestamptz
);

create table public."InstagramAccount" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  username text not null,
  "displayName" text,
  "followersCount" bigint not null default 0,
  "followingCount" bigint not null default 0,
  "postsCount" bigint not null default 0,
  "engagementRate" numeric(8,4),
  metrics jsonb not null default '{}'::jsonb,
  status public."InstagramConnectionStatus" not null default 'PENDING',
  "lastSyncedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("workspaceId", username)
);

create index "Subscription_userId_status_idx" on public."Subscription" ("userId", status);
create index "Order_userId_createdAt_idx" on public."Order" ("userId", "createdAt" desc);
create index "InstagramAccount_workspaceId_status_idx" on public."InstagramAccount" ("workspaceId", status);

create trigger product_set_updated_at before update on public."Product"
for each row execute function public.set_updated_at();
create trigger subscription_set_updated_at before update on public."Subscription"
for each row execute function public.set_updated_at();
create trigger instagram_account_set_updated_at before update on public."InstagramAccount"
for each row execute function public.set_updated_at();

alter table public."Product" enable row level security;
alter table public."Subscription" enable row level security;
alter table public."Order" enable row level security;
alter table public."InstagramAccount" enable row level security;

revoke all on table public."Product" from anon, authenticated;
revoke all on table public."Subscription" from anon, authenticated;
revoke all on table public."Order" from anon, authenticated;
revoke all on table public."InstagramAccount" from anon, authenticated;

grant select, insert, update, delete on table public."Product" to service_role;
grant select, insert, update, delete on table public."Subscription" to service_role;
grant select, insert, update, delete on table public."Order" to service_role;
grant select, insert, update, delete on table public."InstagramAccount" to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text := new.id::text;
  v_workspace_id text := new.id::text || ':workspace';
begin
  insert into public."User" (id, email, "displayName")
  values (v_user_id, coalesce(new.email, v_user_id || '@local.invalid'), null)
  on conflict (id) do update set email = excluded.email;

  insert into public."Workspace" (id, name)
  values (v_workspace_id, 'فضای کاری من')
  on conflict (id) do nothing;

  insert into public."WorkspaceMember" (id, "workspaceId", "userId", role)
  values (v_user_id || ':member', v_workspace_id, v_user_id, 'CUSTOMER')
  on conflict ("workspaceId", "userId") do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_ai_panel on auth.users;
create trigger on_auth_user_created_ai_panel
after insert on auth.users
for each row execute function private.handle_new_auth_user();

insert into public."User" (id, email)
select id::text, coalesce(email, id::text || '@local.invalid')
from auth.users
on conflict (id) do update set email = excluded.email;

insert into public."Workspace" (id, name)
select id::text || ':workspace', 'فضای کاری من'
from auth.users
on conflict (id) do nothing;

insert into public."WorkspaceMember" (id, "workspaceId", "userId", role)
select id::text || ':member', id::text || ':workspace', id::text, 'CUSTOMER'
from auth.users
on conflict ("workspaceId", "userId") do nothing;

insert into public."Product" (id, name, "shortDescription", description, category, status, features, "sortOrder") values
('telegram-bot', 'ربات تلگرام', 'ربات آماده برای فروش، خدمات، پشتیبانی و مدیریت مشتری', 'مشتری ربات را در BotFather می‌سازد، توکن را به پنل متصل می‌کند و از داخل پنل منوها، پیام خوش‌آمدگویی، خدمات و پاسخ‌های ربات را مدیریت می‌کند.', 'automation', 'AVAILABLE', '["اتصال امن توکن BotFather","منوی قابل شخصی‌سازی","محصولات و خدمات","کیف پول و پشتیبانی","مدیریت از داشبورد"]'::jsonb, 10),
('instagram-smart-dm', 'دایرکت هوشمند اینستاگرام', 'اتوماسیون دایرکت و پاسخ به کامنت برای پیج‌های فروش و خدمات', 'پس از اتصال حساب اینستاگرام، قوانین پاسخ خودکار، تریگر کامنت، پیام‌های دایرکت و آمار عملکرد از همین پنل مدیریت می‌شوند.', 'automation', 'COMING_SOON', '["پاسخ خودکار دایرکت","تریگر کامنت به دایرکت","قوانین قابل تنظیم","نمایش آمار پیج"]'::jsonb, 20),
('scheduler', 'انتشار زمان‌بندی‌شده', 'زمان‌بندی انتشار پست، استوری و پیام در چند کانال', 'محتوا را از قبل آماده کنید و انتشار آن را برای زمان دلخواه برنامه‌ریزی کنید. این ماژول روی زیرساخت ScheduledJob پنل اجرا می‌شود.', 'publishing', 'COMING_SOON', '["تقویم محتوا","صف انتشار","زمان‌بندی پیام و پست","گزارش وضعیت اجرا"]'::jsonb, 30),
('analytics', 'آنالیز شبکه‌های اجتماعی', 'نمایش شاخص‌های کلیدی و پیشنهادهای قابل اجرا برای رشد', 'آمار حساب‌ها و کمپین‌ها در یک نمای ساده جمع می‌شود تا کاربر بدون رفتن بین چند ابزار، وضعیت رشد و تعامل را ببیند.', 'analytics', 'COMING_SOON', '["خلاصه عملکرد","رشد دنبال‌کننده","تعامل محتوا","پیشنهادهای بهبود"]'::jsonb, 40)
on conflict (id) do update set
  name = excluded.name,
  "shortDescription" = excluded."shortDescription",
  description = excluded.description,
  category = excluded.category,
  status = excluded.status,
  features = excluded.features,
  "sortOrder" = excluded."sortOrder";

delete from public."Workspace" w
where w.id = 'local-workspace'
  and not exists (select 1 from public."WorkspaceMember" m where m."workspaceId" = w.id)
  and not exists (select 1 from public."TelegramBot" b where b."workspaceId" = w.id)
  and not exists (select 1 from public."ScheduledJob" j where j."workspaceId" = w.id);