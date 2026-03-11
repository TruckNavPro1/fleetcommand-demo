-- RUN THIS SCRIPT IN THE SUPABASE SQL EDITOR TO UPDATE YOUR DATABASE

-- 1. Add Pickup Number to Loads
ALTER TABLE public.loads ADD COLUMN pickup_number text;

-- 2. Create Internal Messages Table (Chat)
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read messages (like a global internal chat)
CREATE POLICY "Allow authenticated read messages" ON public.messages FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert messages
CREATE POLICY "Allow authenticated insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id
);

-- 4. In case the user hasn't added any profiles yet via trigger, 
-- allow them to see the table is ready for insertion.
