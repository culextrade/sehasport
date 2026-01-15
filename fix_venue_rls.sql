-- Allow authenticated users (Venue Owners) to create new venues
create policy "Users can register venues." 
on venues for insert 
with check (auth.role() = 'authenticated');

-- Also allow them to update their own venues
create policy "Owners can update their venues." 
on venues for update 
using (auth.uid() = owner_id);
