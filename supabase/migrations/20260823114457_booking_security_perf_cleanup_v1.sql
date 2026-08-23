create schema if not exists extensions;

alter extension btree_gist set schema extensions;

create index if not exists "BookingMessageOutbox_appointmentId_idx"
  on public."BookingMessageOutbox"("appointmentId");

create index if not exists "BookingMessageOutbox_ruleId_idx"
  on public."BookingMessageOutbox"("ruleId");