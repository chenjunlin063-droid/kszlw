-- Add VIP content field to resources table
ALTER TABLE public.resources 
ADD COLUMN vip_content text;

-- Add VIP status fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_vip boolean DEFAULT false,
ADD COLUMN vip_expires_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.resources.vip_content IS 'VIP-only content that is hidden for non-VIP users';
COMMENT ON COLUMN public.profiles.is_vip IS 'Whether the user has active VIP membership';
COMMENT ON COLUMN public.profiles.vip_expires_at IS 'When the VIP membership expires';