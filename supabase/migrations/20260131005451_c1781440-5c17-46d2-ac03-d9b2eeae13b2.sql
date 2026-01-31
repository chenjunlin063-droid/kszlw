-- Fix the overly permissive download_history INSERT policy
-- Replace with a more restrictive policy

DROP POLICY IF EXISTS "Anyone can insert download history" ON public.download_history;

-- Create a more restrictive policy that still allows anonymous downloads
-- but validates the resource_id exists
CREATE POLICY "Valid resource downloads can be recorded"
ON public.download_history FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.resources 
        WHERE id = resource_id AND is_active = true
    )
);