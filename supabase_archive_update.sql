-- Add is_archived column if it doesn't exist
alter table categories 
add column if not exists is_archived boolean default false not null;
