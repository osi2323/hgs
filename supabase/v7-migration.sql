-- V7 TALep SAYFASI MIGRATION
-- Mevcut V6 veritabanında bir kez çalıştır.

alter table public.requests
add column if not exists request_expiry text;

drop policy if exists "Public create requests" on public.requests;

create policy "Public create requests"
on public.requests
for insert
to anon, authenticated
with check (
  service in ('hgs','km','hasar')
  and char_length(plate) between 4 and 10
  and char_length(full_name) between 2 and 120
  and char_length(phone) between 10 and 15
  and request_code ~ '^[0-9]{18}$'
  and request_expiry ~ '^(0[1-9]|1[0-2])/[0-9]{2}$'
);

-- Kontrol:
-- select id, public_id, request_code, request_expiry from public.requests order by created_at desc limit 20;
