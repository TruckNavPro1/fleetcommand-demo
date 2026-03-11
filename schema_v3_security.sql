-- COMBINED SCHEMA UPDATE: Adds V2 Features AND V3 Security

-- =========================================================================
-- PART 1: MISSING TABLES & COLUMNS (from v2)
-- =========================================================================

-- 1. Add Pickup Number to Loads (skip if exists)
ALTER TABLE public.loads ADD COLUMN IF NOT EXISTS pickup_number text;

-- 2. Create Internal Messages Table (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- PART 2: MULTI-TENANT SECURITY (from v3)
-- =========================================================================

-- 3. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Add organization_id to all tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.loads ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 5. Enable Row Level Security (RLS) on EVERYTHING
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Create the 'Get My Organization' helper function
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =========================================================================
-- PART 3: DROP INSECURE POLICIES & APPLY STRICT MULTI-TENANT POLICIES
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
DROP POLICY IF EXISTS "Allow office to insert loads" ON public.loads;

-- ORGANIZATIONS: Users can only see their own organization's details
DROP POLICY IF EXISTS "Users view own organization" ON public.organizations;
CREATE POLICY "Users view own organization" ON public.organizations
    FOR SELECT USING (id = public.user_organization_id());

-- PROFILES: Users can see profiles IN THEIR OWN ORGANIZATION, or their own
DROP POLICY IF EXISTS "Users view own organization profiles" ON public.profiles;
CREATE POLICY "Users view own organization profiles" ON public.profiles
    FOR SELECT USING (organization_id = public.user_organization_id() OR id = auth.uid());
    
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- LOADS: View/Modify own organization loads
DROP POLICY IF EXISTS "Users view own organization loads" ON public.loads;
CREATE POLICY "Users view own organization loads" ON public.loads
    FOR SELECT USING (organization_id = public.user_organization_id());

DROP POLICY IF EXISTS "Office users insert loads" ON public.loads;
CREATE POLICY "Office users insert loads" ON public.loads
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

DROP POLICY IF EXISTS "Office users update loads" ON public.loads;
CREATE POLICY "Office users update loads" ON public.loads
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

-- VEHICLES: View/Modify own organization vehicles
DROP POLICY IF EXISTS "Users view own organization vehicles" ON public.vehicles;
CREATE POLICY "Users view own organization vehicles" ON public.vehicles
    FOR SELECT USING (organization_id = public.user_organization_id());

DROP POLICY IF EXISTS "Office users insert vehicles" ON public.vehicles;
CREATE POLICY "Office users insert vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

-- MESSAGES: View/Insert messages for own organization
DROP POLICY IF EXISTS "Users view own organization messages" ON public.messages;
CREATE POLICY "Users view own organization messages" ON public.messages
    FOR SELECT USING (organization_id = public.user_organization_id());

DROP POLICY IF EXISTS "Users insert messages" ON public.messages;
CREATE POLICY "Users insert messages" ON public.messages
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND 
        auth.uid() = sender_id
    );

-- =========================================================================
-- PART 4: DELETE POLICIES & DRIVER UPDATE POLICIES 
-- =========================================================================

-- DRIVERS: Allow drivers to update loads assigned to their vehicle
DROP POLICY IF EXISTS "Drivers update assigned loads" ON public.loads;
CREATE POLICY "Drivers update assigned loads" ON public.loads
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (
            SELECT 1 FROM public.vehicles 
            WHERE vehicles.id = public.loads.assigned_vehicle_id 
            AND vehicles.driver_id = auth.uid()
        )
    );

-- DELETES: Only Office Staff can delete records, and only within their organization
DROP POLICY IF EXISTS "Office users delete loads" ON public.loads;
CREATE POLICY "Office users delete loads" ON public.loads
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

DROP POLICY IF EXISTS "Office users delete vehicles" ON public.vehicles;
CREATE POLICY "Office users delete vehicles" ON public.vehicles
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

DROP POLICY IF EXISTS "Users delete own messages" ON public.messages;
CREATE POLICY "Users delete own messages" ON public.messages
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND 
        sender_id = auth.uid()
    );
