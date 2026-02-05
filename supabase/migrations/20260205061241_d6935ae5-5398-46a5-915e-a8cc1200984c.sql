-- Create VIP order status enum
CREATE TYPE public.vip_order_status AS ENUM ('pending', 'paid', 'cancelled', 'expired');

-- Create VIP orders table to track membership purchases
CREATE TABLE public.vip_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    amount DECIMAL(10,2) NOT NULL,
    status vip_order_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.vip_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own VIP orders"
ON public.vip_orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own VIP orders"
ON public.vip_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all VIP orders"
ON public.vip_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to activate VIP membership when order is paid
CREATE OR REPLACE FUNCTION public.activate_vip_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    duration_interval INTERVAL;
    current_expiry TIMESTAMP WITH TIME ZONE;
    new_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Only process when status changes to 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        -- Determine duration based on plan type
        IF NEW.plan_type = 'monthly' THEN
            duration_interval := INTERVAL '1 month';
        ELSE
            duration_interval := INTERVAL '1 year';
        END IF;
        
        -- Get current VIP expiry
        SELECT vip_expires_at INTO current_expiry
        FROM profiles
        WHERE user_id = NEW.user_id;
        
        -- Calculate new expiry (extend from current if still valid, otherwise from now)
        IF current_expiry IS NOT NULL AND current_expiry > now() THEN
            new_expiry := current_expiry + duration_interval;
        ELSE
            new_expiry := now() + duration_interval;
        END IF;
        
        -- Update order expires_at
        NEW.expires_at := new_expiry;
        NEW.paid_at := now();
        
        -- Update user profile
        UPDATE profiles
        SET is_vip = true,
            vip_expires_at = new_expiry,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for VIP activation
CREATE TRIGGER trigger_activate_vip_membership
BEFORE UPDATE ON public.vip_orders
FOR EACH ROW
EXECUTE FUNCTION public.activate_vip_membership();