-- RUN THIS ENTIRE SCRIPT IN THE SUPABASE SQL EDITOR

-- 1. Create Profiles Table (Users/Staff)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('office', 'driver', 'mechanic')),
  title text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We assume users are created via Supabase Auth first, 
-- then a trigger or manual insert adds them to the profiles table.

-- 2. Create Vehicles Table
CREATE TABLE public.vehicles (
  id text PRIMARY KEY, -- e.g., 'TRK-001'
  make_model text,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text CHECK (status IN ('active', 'idle', 'maintenance', 'rest')),
  fuel_level integer DEFAULT 100,
  lat numeric,
  lng numeric,
  last_update timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Loads Table
CREATE TABLE public.loads (
  id text PRIMARY KEY, -- e.g., 'LD-9823'
  origin text NOT NULL,
  destination text NOT NULL,
  weight text,
  miles integer,
  pickup_time timestamp with time zone,
  delivery_time timestamp with time zone,
  status text DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Transit', 'Completed', 'Cancelled')),
  assigned_vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) policies to keep data secure
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read loads" ON public.loads FOR SELECT TO authenticated USING (true);

-- Allow office staff to insert/update data
CREATE POLICY "Office staff can insert loads" ON public.loads FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'office')
);
CREATE POLICY "Office staff can update loads" ON public.loads FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'office')
);

CREATE POLICY "Office staff can insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'office')
);
CREATE POLICY "Office staff can update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'office')
);
