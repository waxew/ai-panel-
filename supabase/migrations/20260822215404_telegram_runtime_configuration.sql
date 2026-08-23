alter table public."TelegramBot"
  add column if not exists "welcomeMessage" text not null default 'سلام! به ربات خوش آمدید. از منوی زیر یکی از گزینه‌ها را انتخاب کنید.',
  add column if not exists "webhookSecretHash" text;

create index if not exists "TelegramButton_botId_sortOrder_idx"
  on public."TelegramButton" ("botId", "sortOrder");