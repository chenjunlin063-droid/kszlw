
-- Create invitation_codes table
CREATE TABLE public.invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'monthly',
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage invitation codes"
ON public.invitation_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active codes for validation"
ON public.invitation_codes
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()) AND used_count < max_uses);

-- Create invitation_code_uses table to track usage
CREATE TABLE public.invitation_code_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.invitation_codes(id),
  user_id UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_code_uses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all code uses"
ON public.invitation_code_uses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own usage"
ON public.invitation_code_uses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default settings for payment QR codes and customer service
INSERT INTO public.site_settings (key, value, description) VALUES
('wechat_qr_code', '""', '微信支付二维码URL'),
('alipay_qr_code', '""', '支付宝支付二维码URL'),
('customer_service_wechat', '""', '客服微信号'),
('customer_service_phone', '"400-888-8888"', '客服电话'),
('customer_service_qr_code', '""', '客服微信二维码URL')
ON CONFLICT (key) DO NOTHING;
