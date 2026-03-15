-- =========================================================================
-- FLEETCOMMAND — COMPLETE SCHEMA (replaces v1 through v5)
-- Run this once in the Supabase SQL Editor for a fresh setup.
-- =========================================================================

-- ── 1. ORGANIZATIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
    id   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 2. PROFILES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id              uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name       text NOT NULL,
    role            text NOT NULL CHECK (role IN ('office', 'driver', 'mechanic')),
    title           text,
    organization_id uuid REFERENCES public.organizations(id),
    created_at      timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 3. VEHICLES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
    id              text PRIMARY KEY,           -- e.g. 'TRK-001'
    make_model      text,
    driver_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    status          text CHECK (status IN ('active', 'idle', 'maintenance', 'rest')),
    fuel_level      integer DEFAULT 100,
    lat             numeric,
    lng             numeric,
    organization_id uuid REFERENCES public.organizations(id),
    last_update     timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 4. LOADS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loads (
    id                  text PRIMARY KEY,       -- e.g. 'LD-9823'
    origin              text NOT NULL,
    destination         text NOT NULL,
    weight              text,
    miles               integer,
    pickup_number       text,
    pickup_time         timestamp with time zone,
    delivery_time       timestamp with time zone,
    status              text DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Transit', 'Completed', 'Cancelled')),
    assigned_vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL,
    created_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id     uuid REFERENCES public.organizations(id),
    created_at          timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 5. MESSAGES (internal chat) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content         text NOT NULL,
    organization_id uuid REFERENCES public.organizations(id),
    created_at      timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 6. PARTS INVENTORY ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id              text PRIMARY KEY,
    name            text NOT NULL,
    category        text,
    stock           integer DEFAULT 0,
    min_stock       integer DEFAULT 0,
    unit            text,
    cost            text,
    supplier        text,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- ── 7. WORK ORDERS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.work_orders (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id         text,                      -- vehicle or trailer id (no FK — trailers may not be in vehicles)
    asset_type       text DEFAULT 'Truck'  CHECK (asset_type IN ('Truck', 'Trailer', 'Other')),
    mechanic_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    description      text NOT NULL,
    parts_used       jsonb DEFAULT '[]'::jsonb,
    status           text DEFAULT 'Completed' CHECK (status IN ('In Progress', 'Completed', 'Pending Parts')),
    priority         text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    service_category text DEFAULT 'General' CHECK (service_category IN ('Brakes', 'Engine', 'Tires', 'Electrical', 'Preventative', 'General', 'Body', 'Suspension')),
    reported_by      text,
    cost             text,
    organization_id  uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at       timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ── 8. ENABLE REALTIME ─────────────────────────────────────────────────────
-- Required for Supabase Realtime subscriptions to work
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;

-- ── 9. ROW LEVEL SECURITY ──────────────────────────────────────────────────
ALTER TABLE public.organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders      ENABLE ROW LEVEL SECURITY;

-- Helper: get the org of the currently logged-in user
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ORGANIZATIONS
CREATE POLICY "org: members view own org" ON public.organizations
    FOR SELECT USING (id = public.user_organization_id());

-- PROFILES
CREATE POLICY "profiles: view own org" ON public.profiles
    FOR SELECT USING (organization_id = public.user_organization_id() OR id = auth.uid());

CREATE POLICY "profiles: update own row" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- VEHICLES
CREATE POLICY "vehicles: view own org" ON public.vehicles
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "vehicles: office insert" ON public.vehicles
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

CREATE POLICY "vehicles: office update" ON public.vehicles
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

CREATE POLICY "vehicles: office delete" ON public.vehicles
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

-- LOADS
CREATE POLICY "loads: view own org" ON public.loads
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "loads: office insert" ON public.loads
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

CREATE POLICY "loads: office update" ON public.loads
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office'))
    );

CREATE POLICY "loads: driver update assigned" ON public.loads
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = public.loads.assigned_vehicle_id
              AND vehicles.driver_id = auth.uid()
        )
    );

CREATE POLICY "loads: office delete" ON public.loads
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'office')
    );

-- MESSAGES
CREATE POLICY "messages: view own org" ON public.messages
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "messages: insert own org" ON public.messages
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND
        auth.uid() = sender_id
    );

CREATE POLICY "messages: delete own" ON public.messages
    FOR DELETE USING (
        organization_id = public.user_organization_id() AND
        sender_id = auth.uid()
    );

-- PARTS INVENTORY
CREATE POLICY "parts: view own org" ON public.parts_inventory
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "parts: mechanic/office all" ON public.parts_inventory
    FOR ALL USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );

-- WORK ORDERS
CREATE POLICY "wo: view own org" ON public.work_orders
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "wo: mechanic/office insert" ON public.work_orders
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );

CREATE POLICY "wo: mechanic/office update" ON public.work_orders
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );

-- ── 10. SEED: Demo org + assign existing profiles ─────────────────────────
-- Ensures at least one org exists so new installs can log in immediately.
INSERT INTO public.organizations (name)
SELECT 'FleetCommand Demo Org'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

UPDATE public.profiles
SET organization_id = (SELECT id FROM public.organizations LIMIT 1)
WHERE organization_id IS NULL;
