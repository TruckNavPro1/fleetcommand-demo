-- Fix for the Signup page RLS Error: "new row violates row-level security policy for table 'organizations'"
-- Run this in your Supabase SQL Editor

CREATE POLICY "org: allow insert" ON public.organizations
    FOR INSERT WITH CHECK (true);
