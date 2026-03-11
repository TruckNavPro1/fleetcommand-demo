-- RUN THIS SCRIPT IN THE SUPABASE SQL EDITOR TO UPGRADE REPAIR TRACKING

-- 1. Drop the foreign key constraint on vehicle_id so we can log repairs for trailers that might not be in the vehicles table
ALTER TABLE public.work_orders DROP CONSTRAINT IF EXISTS work_orders_vehicle_id_fkey;

-- 2. Rename vehicle_id to asset_id for clarity (only if it exists)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='work_orders' and column_name='vehicle_id') THEN
      ALTER TABLE public.work_orders RENAME COLUMN vehicle_id TO asset_id;
  END IF;
END $$;

-- 3. Add new tracking columns
ALTER TABLE public.work_orders 
    ADD COLUMN IF NOT EXISTS asset_type text DEFAULT 'Truck' CHECK (asset_type IN ('Truck', 'Trailer', 'Other')),
    ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    ADD COLUMN IF NOT EXISTS service_category text DEFAULT 'General' CHECK (service_category IN ('Brakes', 'Engine', 'Tires', 'Electrical', 'Preventative', 'General', 'Body', 'Suspension')),
    ADD COLUMN IF NOT EXISTS reported_by text;

-- 4. Enable cross-tenant testing (Ensures an organization exists for testing live data)
INSERT INTO public.organizations (name)
SELECT 'FleetCommand Demo Org'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations);

-- 5. Assign your user profile (and any others) to an organization so you actually have permissions
UPDATE public.profiles 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1)
WHERE organization_id IS NULL;

-- (Optional) If you want to update existing rows to act as Trucks
UPDATE public.work_orders SET asset_type = 'Truck', priority = 'Medium', service_category = 'General' WHERE asset_type IS NULL;
