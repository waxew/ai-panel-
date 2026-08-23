create table if not exists public."BookingLoyaltySettings" (
  "workspaceId" text primary key references public."Workspace"(id) on delete cascade,
  enabled boolean not null default true,
  "spendUnitAmount" bigint not null default 100000 check ("spendUnitAmount" > 0),
  "pointsPerUnit" integer not null default 1 check ("pointsPerUnit" > 0),
  "silverThreshold" integer not null default 100 check ("silverThreshold" >= 0),
  "goldThreshold" integer not null default 300 check ("goldThreshold" >= 0),
  "vipThreshold" integer not null default 800 check ("vipThreshold" >= 0),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check ("silverThreshold" <= "goldThreshold" and "goldThreshold" <= "vipThreshold")
);

create table if not exists public."BookingLoyaltyAccount" (
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "pointsBalance" integer not null default 0,
  "qualifyingPoints" integer not null default 0,
  tier text not null default 'BRONZE' check (tier in ('BRONZE','SILVER','GOLD','VIP')),
  "joinedAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  primary key ("workspaceId", "customerId")
);

create table if not exists public."BookingLoyaltyLedger" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "sourcePaymentId" text unique references public."BookingPayment"(id) on delete cascade,
  type text not null check (type in ('EARN','REFUND','REDEEM','ADJUST','BONUS','EXPIRE')),
  "deltaPoints" integer not null default 0,
  reason text,
  "createdByUserId" text references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public."BookingLoyaltyReward" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  title text not null,
  description text,
  "pointsCost" integer not null check ("pointsCost" > 0),
  "rewardType" text not null default 'CUSTOM' check ("rewardType" in ('DISCOUNT_AMOUNT','DISCOUNT_PERCENT','FREE_SERVICE','CUSTOM')),
  "rewardValue" bigint,
  "serviceId" text references public."BookingService"(id) on delete set null,
  stock integer check (stock is null or stock >= 0),
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BookingLoyaltyRedemption" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "rewardId" text not null references public."BookingLoyaltyReward"(id) on delete restrict,
  "pointsSpent" integer not null check ("pointsSpent" > 0),
  code text not null unique,
  status text not null default 'ISSUED' check (status in ('ISSUED','USED','CANCELLED')),
  "issuedAt" timestamptz not null default now(),
  "usedAt" timestamptz,
  "cancelledAt" timestamptz,
  "createdByUserId" text references public."User"(id) on delete set null
);

create table if not exists public."BookingLotteryCampaign" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  title text not null,
  prize text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','OPEN','DRAWN','CANCELLED')),
  "minimumPoints" integer not null default 0 check ("minimumPoints" >= 0),
  "minimumVisits" integer not null default 0 check ("minimumVisits" >= 0),
  "vipOnly" boolean not null default false,
  "startsAt" timestamptz,
  "endsAt" timestamptz,
  "winnerCustomerId" text references public."BookingCustomer"(id) on delete set null,
  "drawnAt" timestamptz,
  "createdByUserId" text references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check ("endsAt" is null or "startsAt" is null or "endsAt" > "startsAt")
);

create table if not exists public."BookingLotteryEntry" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "campaignId" text not null references public."BookingLotteryCampaign"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("campaignId", "customerId")
);

create index if not exists "BookingLoyaltyAccount_customer_idx" on public."BookingLoyaltyAccount"("customerId");
create index if not exists "BookingLoyaltyAccount_workspace_tier_idx" on public."BookingLoyaltyAccount"("workspaceId", tier);
create index if not exists "BookingLoyaltyLedger_workspace_customer_created_idx" on public."BookingLoyaltyLedger"("workspaceId", "customerId", "createdAt" desc);
create index if not exists "BookingLoyaltyLedger_createdBy_idx" on public."BookingLoyaltyLedger"("createdByUserId");
create index if not exists "BookingLoyaltyReward_workspace_active_idx" on public."BookingLoyaltyReward"("workspaceId", "isActive");
create index if not exists "BookingLoyaltyReward_service_idx" on public."BookingLoyaltyReward"("serviceId");
create index if not exists "BookingLoyaltyRedemption_workspace_customer_idx" on public."BookingLoyaltyRedemption"("workspaceId", "customerId", "issuedAt" desc);
create index if not exists "BookingLoyaltyRedemption_reward_idx" on public."BookingLoyaltyRedemption"("rewardId");
create index if not exists "BookingLoyaltyRedemption_createdBy_idx" on public."BookingLoyaltyRedemption"("createdByUserId");
create index if not exists "BookingLotteryCampaign_workspace_status_idx" on public."BookingLotteryCampaign"("workspaceId", status, "createdAt" desc);
create index if not exists "BookingLotteryCampaign_winner_idx" on public."BookingLotteryCampaign"("winnerCustomerId");
create index if not exists "BookingLotteryCampaign_createdBy_idx" on public."BookingLotteryCampaign"("createdByUserId");
create index if not exists "BookingLotteryEntry_workspace_campaign_idx" on public."BookingLotteryEntry"("workspaceId", "campaignId");
create index if not exists "BookingLotteryEntry_customer_idx" on public."BookingLotteryEntry"("customerId");

alter table public."BookingLoyaltySettings" enable row level security;
alter table public."BookingLoyaltyAccount" enable row level security;
alter table public."BookingLoyaltyLedger" enable row level security;
alter table public."BookingLoyaltyReward" enable row level security;
alter table public."BookingLoyaltyRedemption" enable row level security;
alter table public."BookingLotteryCampaign" enable row level security;
alter table public."BookingLotteryEntry" enable row level security;

revoke all on public."BookingLoyaltySettings" from anon, authenticated;
revoke all on public."BookingLoyaltyAccount" from anon, authenticated;
revoke all on public."BookingLoyaltyLedger" from anon, authenticated;
revoke all on public."BookingLoyaltyReward" from anon, authenticated;
revoke all on public."BookingLoyaltyRedemption" from anon, authenticated;
revoke all on public."BookingLotteryCampaign" from anon, authenticated;
revoke all on public."BookingLotteryEntry" from anon, authenticated;

grant select, insert, update, delete on public."BookingLoyaltySettings" to service_role;
grant select, insert, update, delete on public."BookingLoyaltyAccount" to service_role;
grant select, insert, update, delete on public."BookingLoyaltyLedger" to service_role;
grant select, insert, update, delete on public."BookingLoyaltyReward" to service_role;
grant select, insert, update, delete on public."BookingLoyaltyRedemption" to service_role;
grant select, insert, update, delete on public."BookingLotteryCampaign" to service_role;
grant select, insert, update, delete on public."BookingLotteryEntry" to service_role;

create schema if not exists private;

create or replace function private.booking_loyalty_sync_account(p_workspace_id text, p_customer_id text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer := 0;
  v_qualifying integer := 0;
  v_silver integer := 100;
  v_gold integer := 300;
  v_vip integer := 800;
  v_tier text := 'BRONZE';
begin
  select coalesce(sum(l."deltaPoints"), 0)::integer,
         coalesce(sum(case when l.type in ('EARN','REFUND') then l."deltaPoints" else 0 end), 0)::integer
  into v_balance, v_qualifying
  from public."BookingLoyaltyLedger" l
  where l."workspaceId" = p_workspace_id and l."customerId" = p_customer_id;

  select s."silverThreshold", s."goldThreshold", s."vipThreshold"
  into v_silver, v_gold, v_vip
  from public."BookingLoyaltySettings" s
  where s."workspaceId" = p_workspace_id;

  v_silver := coalesce(v_silver, 100);
  v_gold := coalesce(v_gold, 300);
  v_vip := coalesce(v_vip, 800);
  v_tier := case
    when v_qualifying >= v_vip then 'VIP'
    when v_qualifying >= v_gold then 'GOLD'
    when v_qualifying >= v_silver then 'SILVER'
    else 'BRONZE'
  end;

  insert into public."BookingLoyaltyAccount"("workspaceId","customerId","pointsBalance","qualifyingPoints",tier,"joinedAt","updatedAt")
  values (p_workspace_id,p_customer_id,v_balance,v_qualifying,v_tier,now(),now())
  on conflict ("workspaceId","customerId") do update
  set "pointsBalance" = excluded."pointsBalance",
      "qualifyingPoints" = excluded."qualifyingPoints",
      tier = excluded.tier,
      "updatedAt" = now();
end;
$$;

create or replace function private.booking_loyalty_ledger_sync_account()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.booking_loyalty_sync_account(old."workspaceId", old."customerId");
    return old;
  end if;
  perform private.booking_loyalty_sync_account(new."workspaceId", new."customerId");
  if tg_op = 'UPDATE' and (old."workspaceId", old."customerId") is distinct from (new."workspaceId", new."customerId") then
    perform private.booking_loyalty_sync_account(old."workspaceId", old."customerId");
  end if;
  return new;
end;
$$;

create or replace function private.booking_loyalty_payment_sync()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_enabled boolean;
  v_unit bigint;
  v_per integer;
  v_points integer := 0;
  v_type text := 'EARN';
begin
  select s.enabled, s."spendUnitAmount", s."pointsPerUnit"
  into v_enabled, v_unit, v_per
  from public."BookingLoyaltySettings" s
  where s."workspaceId" = new."workspaceId";

  if coalesce(v_enabled, false) = false then
    return new;
  end if;

  v_type := case when new.type = 'REFUND' then 'REFUND' else 'EARN' end;
  if new.status = 'POSTED' then
    v_points := floor(new.amount::numeric / greatest(v_unit, 1))::integer * greatest(v_per, 1);
    if new.type = 'REFUND' then v_points := -v_points; end if;
  else
    v_points := 0;
  end if;

  if v_points <> 0 or exists(select 1 from public."BookingLoyaltyLedger" where "sourcePaymentId" = new.id) then
    insert into public."BookingLoyaltyLedger"("workspaceId","customerId","sourcePaymentId",type,"deltaPoints",reason,"createdByUserId")
    values (new."workspaceId",new."customerId",new.id,v_type,v_points,
      case when new.status = 'POSTED' then 'امتیاز خودکار از تراکنش مالی' else 'اثر تراکنش مالی ابطال شده' end,
      new."createdByUserId")
    on conflict ("sourcePaymentId") do update
    set "workspaceId" = excluded."workspaceId",
        "customerId" = excluded."customerId",
        type = excluded.type,
        "deltaPoints" = excluded."deltaPoints",
        reason = excluded.reason,
        "createdByUserId" = excluded."createdByUserId";
  end if;
  return new;
end;
$$;

revoke all on function private.booking_loyalty_sync_account(text,text) from public, anon, authenticated;
revoke all on function private.booking_loyalty_ledger_sync_account() from public, anon, authenticated;
revoke all on function private.booking_loyalty_payment_sync() from public, anon, authenticated;

drop trigger if exists booking_loyalty_ledger_sync_account on public."BookingLoyaltyLedger";
create trigger booking_loyalty_ledger_sync_account
after insert or update or delete on public."BookingLoyaltyLedger"
for each row execute function private.booking_loyalty_ledger_sync_account();

drop trigger if exists booking_loyalty_payment_sync on public."BookingPayment";
create trigger booking_loyalty_payment_sync
after insert or update of amount, type, status, "customerId", "workspaceId" on public."BookingPayment"
for each row execute function private.booking_loyalty_payment_sync();

create or replace function public.booking_loyalty_redeem_reward(
  p_workspace_id text,
  p_customer_id text,
  p_reward_id text,
  p_user_id text
) returns text
language plpgsql
set search_path = ''
as $$
declare
  v_reward public."BookingLoyaltyReward"%rowtype;
  v_balance integer := 0;
  v_redemption_id text := gen_random_uuid()::text;
  v_code text := upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
begin
  select * into v_reward
  from public."BookingLoyaltyReward"
  where id = p_reward_id and "workspaceId" = p_workspace_id and "isActive" = true
  for update;
  if not found then raise exception 'Reward not found or inactive'; end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then raise exception 'Reward is out of stock'; end if;

  perform private.booking_loyalty_sync_account(p_workspace_id, p_customer_id);
  select "pointsBalance" into v_balance
  from public."BookingLoyaltyAccount"
  where "workspaceId" = p_workspace_id and "customerId" = p_customer_id
  for update;
  if coalesce(v_balance,0) < v_reward."pointsCost" then raise exception 'Insufficient points'; end if;

  insert into public."BookingLoyaltyRedemption"(id,"workspaceId","customerId","rewardId","pointsSpent",code,status,"createdByUserId")
  values (v_redemption_id,p_workspace_id,p_customer_id,p_reward_id,v_reward."pointsCost",v_code,'ISSUED',p_user_id);
  insert into public."BookingLoyaltyLedger"("workspaceId","customerId",type,"deltaPoints",reason,"createdByUserId")
  values (p_workspace_id,p_customer_id,'REDEEM',-v_reward."pointsCost",'دریافت پاداش: ' || v_reward.title,p_user_id);
  if v_reward.stock is not null then
    update public."BookingLoyaltyReward" set stock = stock - 1, "updatedAt" = now() where id = p_reward_id;
  end if;
  return v_redemption_id;
end;
$$;

create or replace function public.booking_loyalty_cancel_redemption(
  p_workspace_id text,
  p_redemption_id text,
  p_user_id text
) returns void
language plpgsql
set search_path = ''
as $$
declare
  v_red public."BookingLoyaltyRedemption"%rowtype;
begin
  select * into v_red from public."BookingLoyaltyRedemption"
  where id = p_redemption_id and "workspaceId" = p_workspace_id for update;
  if not found then raise exception 'Redemption not found'; end if;
  if v_red.status <> 'ISSUED' then raise exception 'Only issued redemptions can be cancelled'; end if;
  update public."BookingLoyaltyRedemption" set status='CANCELLED', "cancelledAt"=now() where id=v_red.id;
  insert into public."BookingLoyaltyLedger"("workspaceId","customerId",type,"deltaPoints",reason,"createdByUserId")
  values (p_workspace_id,v_red."customerId",'ADJUST',v_red."pointsSpent",'بازگشت امتیاز بابت لغو پاداش ' || v_red.code,p_user_id);
  update public."BookingLoyaltyReward" set stock = case when stock is null then null else stock + 1 end, "updatedAt"=now() where id=v_red."rewardId";
end;
$$;

create or replace function public.booking_lottery_rebuild_entries(
  p_workspace_id text,
  p_campaign_id text
) returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_campaign public."BookingLotteryCampaign"%rowtype;
  v_count integer := 0;
begin
  select * into v_campaign from public."BookingLotteryCampaign"
  where id=p_campaign_id and "workspaceId"=p_workspace_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status not in ('DRAFT','OPEN') then raise exception 'Campaign cannot be rebuilt'; end if;

  delete from public."BookingLotteryEntry" where "campaignId"=p_campaign_id and "workspaceId"=p_workspace_id;
  insert into public."BookingLotteryEntry"("workspaceId","campaignId","customerId")
  select p_workspace_id,p_campaign_id,c.id
  from public."BookingCustomer" c
  left join public."BookingLoyaltyAccount" la on la."workspaceId"=p_workspace_id and la."customerId"=c.id
  left join lateral (
    select count(*)::integer as visits
    from public."BookingAppointment" a
    where a."workspaceId"=p_workspace_id and a."customerId"=c.id and a.status='DONE'
  ) v on true
  where c."workspaceId"=p_workspace_id
    and coalesce(la."pointsBalance",0) >= v_campaign."minimumPoints"
    and coalesce(v.visits,0) >= v_campaign."minimumVisits"
    and (v_campaign."vipOnly"=false or coalesce(la.tier,'BRONZE')='VIP');
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.booking_lottery_draw(
  p_workspace_id text,
  p_campaign_id text,
  p_user_id text
) returns text
language plpgsql
set search_path = ''
as $$
declare
  v_campaign public."BookingLotteryCampaign"%rowtype;
  v_winner text;
begin
  select * into v_campaign from public."BookingLotteryCampaign"
  where id=p_campaign_id and "workspaceId"=p_workspace_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status <> 'OPEN' then raise exception 'Campaign must be open'; end if;
  if v_campaign."winnerCustomerId" is not null then raise exception 'Campaign already drawn'; end if;
  if v_campaign."startsAt" is not null and v_campaign."startsAt" > now() then raise exception 'Campaign has not started'; end if;
  if v_campaign."endsAt" is not null and v_campaign."endsAt" > now() then raise exception 'Campaign has not ended'; end if;

  select e."customerId" into v_winner
  from public."BookingLotteryEntry" e
  where e."workspaceId"=p_workspace_id and e."campaignId"=p_campaign_id
  order by random()
  limit 1;
  if v_winner is null then raise exception 'Campaign has no entries'; end if;

  update public."BookingLotteryCampaign"
  set status='DRAWN', "winnerCustomerId"=v_winner, "drawnAt"=now(), "updatedAt"=now(), "createdByUserId"=coalesce("createdByUserId",p_user_id)
  where id=p_campaign_id;
  return v_winner;
end;
$$;

revoke all on function public.booking_loyalty_redeem_reward(text,text,text,text) from public, anon, authenticated;
revoke all on function public.booking_loyalty_cancel_redemption(text,text,text) from public, anon, authenticated;
revoke all on function public.booking_lottery_rebuild_entries(text,text) from public, anon, authenticated;
revoke all on function public.booking_lottery_draw(text,text,text) from public, anon, authenticated;
grant execute on function public.booking_loyalty_redeem_reward(text,text,text,text) to service_role;
grant execute on function public.booking_loyalty_cancel_redemption(text,text,text) to service_role;
grant execute on function public.booking_lottery_rebuild_entries(text,text) to service_role;
grant execute on function public.booking_lottery_draw(text,text,text) to service_role;
