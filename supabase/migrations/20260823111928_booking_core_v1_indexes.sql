create index if not exists "BookingAppointment_serviceId_idx" on public."BookingAppointment"("serviceId");
create index if not exists "BookingAppointment_createdByUserId_idx" on public."BookingAppointment"("createdByUserId");
create index if not exists "BookingStaffService_serviceId_idx" on public."BookingStaffService"("serviceId");