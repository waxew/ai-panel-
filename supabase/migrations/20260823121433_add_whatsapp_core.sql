create table if not exists public."WhatsAppAccount" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "wabaId" text not null,
  "phoneNumberId" text not null unique,
  "displayPhoneNumber" text,
  "verifiedName" text,
  "accessTokenCiphertext" text not null,
  "tokenType" text not null default 'SYSTEM_USER',
  status public."BotStatus" not null default 'PENDING',
  "webhookSubscribed" boolean not null default false,
  "qualityRating" text,
  "messagingLimit" text,
  "lastSyncedAt" timestamptz,
  "connectionMeta" jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "WhatsAppAccount_workspaceId_idx" on public."WhatsAppAccount"("workspaceId");
create index if not exists "WhatsAppAccount_wabaId_idx" on public."WhatsAppAccount"("wabaId");

create table if not exists public."WhatsAppConversation" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "whatsappAccountId" text not null references public."WhatsAppAccount"(id) on delete cascade,
  "waUserId" text not null,
  "customerPhone" text,
  "customerName" text,
  status text not null default 'OPEN',
  "lastMessageAt" timestamptz,
  "customerServiceWindowExpiresAt" timestamptz,
  "unreadCount" integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("whatsappAccountId", "waUserId")
);

create index if not exists "WhatsAppConversation_workspace_last_idx" on public."WhatsAppConversation"("workspaceId", "lastMessageAt" desc);

create table if not exists public."WhatsAppMessage" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "whatsappAccountId" text not null references public."WhatsAppAccount"(id) on delete cascade,
  "conversationId" text not null references public."WhatsAppConversation"(id) on delete cascade,
  "providerMessageId" text unique,
  direction text not null,
  "messageType" text not null default 'text',
  body text,
  "templateName" text,
  status text not null default 'RECEIVED',
  "pricingCategory" text,
  "isTemplate" boolean not null default false,
  "providerTimestamp" timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now()
);

create index if not exists "WhatsAppMessage_conversation_created_idx" on public."WhatsAppMessage"("conversationId", "createdAt" desc);
create index if not exists "WhatsAppMessage_workspace_created_idx" on public."WhatsAppMessage"("workspaceId", "createdAt" desc);

create table if not exists public."WhatsAppAutomationRule" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "whatsappAccountId" text references public."WhatsAppAccount"(id) on delete cascade,
  name text not null,
  "triggerType" text not null,
  "triggerConfig" jsonb not null default '{}'::jsonb,
  "actionType" text not null default 'SEND_MESSAGE',
  "actionConfig" jsonb not null default '{}'::jsonb,
  "isActive" boolean not null default false,
  executions integer not null default 0,
  "lastTriggeredAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "WhatsAppAutomationRule_workspace_idx" on public."WhatsAppAutomationRule"("workspaceId");
create index if not exists "WhatsAppAutomationRule_account_active_idx" on public."WhatsAppAutomationRule"("whatsappAccountId", "isActive");

create table if not exists public."WhatsAppTemplate" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "whatsappAccountId" text not null references public."WhatsAppAccount"(id) on delete cascade,
  "metaTemplateId" text,
  name text not null,
  language text not null,
  category text not null,
  status text not null,
  components jsonb not null default '[]'::jsonb,
  "qualityScore" text,
  "lastSyncedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("whatsappAccountId", name, language)
);

create index if not exists "WhatsAppTemplate_workspace_idx" on public."WhatsAppTemplate"("workspaceId");

alter table public."WhatsAppAccount" enable row level security;
alter table public."WhatsAppConversation" enable row level security;
alter table public."WhatsAppMessage" enable row level security;
alter table public."WhatsAppAutomationRule" enable row level security;
alter table public."WhatsAppTemplate" enable row level security;

revoke all on table public."WhatsAppAccount" from anon, authenticated;
revoke all on table public."WhatsAppConversation" from anon, authenticated;
revoke all on table public."WhatsAppMessage" from anon, authenticated;
revoke all on table public."WhatsAppAutomationRule" from anon, authenticated;
revoke all on table public."WhatsAppTemplate" from anon, authenticated;

insert into public."AppSecret" (id, value)
values ('whatsapp_token_encryption', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

insert into public."AppSecret" (id, value)
values ('whatsapp_webhook_verify_token', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;