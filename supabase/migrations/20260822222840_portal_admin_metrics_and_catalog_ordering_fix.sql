update public."Product" set "sortOrder" = case id
  when 'telegram-bot' then 10
  when 'instagram-smart-dm' then 20
  when 'whatsapp-business' then 30
  when 'bale-bot' then 40
  when 'rubika-bot' then 50
  when 'discord-bot' then 60
  when 'scheduler' then 70
  when 'analytics' then 80
  else "sortOrder"
end;

create index if not exists "Order_status_createdAt_idx" on public."Order" (status, "createdAt" desc);
create index if not exists "Subscription_status_expiresAt_idx" on public."Subscription" (status, "expiresAt");
create index if not exists "User_createdAt_idx" on public."User" ("createdAt" desc);
