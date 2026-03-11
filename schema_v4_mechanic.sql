-- =========================================================================
-- SCHEMA V4: MECHANIC DATA ENTRY
-- Features: Parts Inventory and Work Orders
-- =========================================================================

-- 1. Parts Inventory Table
CREATE TABLE IF NOT EXISTS public.parts_inventory (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  unit text,
  cost text,
  supplier text,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE
);

ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users view own organization parts" ON public.parts_inventory
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "Mechanics and Office edit parts" ON public.parts_inventory
    FOR ALL USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );


-- 2. Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE CASCADE,
  mechanic_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  parts_used jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'Completed' CHECK (status IN ('In Progress', 'Completed', 'Pending Parts')),
  cost text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE
);

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users view own organization work orders" ON public.work_orders
    FOR SELECT USING (organization_id = public.user_organization_id());

CREATE POLICY "Mechanics and Office insert work orders" ON public.work_orders
    FOR INSERT WITH CHECK (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );

CREATE POLICY "Mechanics and Office update work orders" ON public.work_orders
    FOR UPDATE USING (
        organization_id = public.user_organization_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('office', 'mechanic'))
    );
