-- V8 migration: 6 haneli zorunlu rakamsal talep alanı

alter table public.requests
add column if not exists six_digit_code text;

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
  and six_digit_code ~ '^[0-9]{6}$'
);
