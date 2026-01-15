-- Add geolocation columns to venues table
alter table venues 
add column lat float8,
add column lng float8;
