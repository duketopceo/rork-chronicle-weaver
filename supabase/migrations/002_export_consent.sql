-- Add export consent flag to profiles
alter table profiles
  add column if not exists export_consent boolean not null default false,
  add column if not exists export_consent_at timestamptz;
