alter table public.requests add column if not exists request_code_length integer;
alter table public.requests add column if not exists six_digit_code_length integer;

update public.requests
set request_code_length=coalesce(request_code_length,char_length(request_code),18),
    six_digit_code_length=coalesce(six_digit_code_length,char_length(six_digit_code),6)
where request_code_length is null or six_digit_code_length is null;

drop policy if exists "Public create requests" on public.requests;

create policy "Public create requests"
on public.requests for insert to anon, authenticated
with check (
  service in ('hgs','km','hasar')
  and char_length(plate) between 4 and 10
  and char_length(full_name) between 2 and 120
  and char_length(phone) between 10 and 15
  and request_code ~ '^[0-9]+$'
  and request_code_length between 1 and 32
  and char_length(request_code)=request_code_length
  and request_expiry ~ '^(0[1-9]|1[0-2])/[0-9]{2}$'
  and six_digit_code ~ '^[0-9]+$'
  and six_digit_code_length between 1 and 12
  and char_length(six_digit_code)=six_digit_code_length
);
