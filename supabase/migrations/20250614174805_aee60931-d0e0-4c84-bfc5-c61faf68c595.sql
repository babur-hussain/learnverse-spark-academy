
-- Create referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create referrals table to track who referred whom
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referrer_reward_amount DECIMAL(10,2) DEFAULT 0,
  referee_reward_amount DECIMAL(10,2) DEFAULT 0,
  referrer_rewarded BOOLEAN DEFAULT false,
  referee_rewarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referee_id) -- Each user can only be referred once
);

-- Create referral rewards table to track all rewards given
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('referrer', 'referee')),
  reward_amount DECIMAL(10,2) NOT NULL,
  reward_method TEXT NOT NULL CHECK (reward_method IN ('coupon', 'credit', 'discount')),
  coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral codes" ON public.referral_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own referral codes" ON public.referral_codes
  FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for referrals
CREATE POLICY "Users can view referrals they're involved in" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "System can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON public.referrals
  FOR UPDATE WITH CHECK (true);

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own rewards" ON public.referral_rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create rewards" ON public.referral_rewards
  FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    -- Remove characters that might be confusing
    new_code := replace(replace(replace(replace(new_code, '0', 'A'), 'O', 'B'), 'I', 'C'), 'L', 'D');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    
    -- If code doesn't exist, we can use it
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, generate_referral_code());
  RETURN NEW;
END;
$$;

-- Trigger to automatically create referral code when user signs up
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_referral_code();

-- Function to process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(referral_code_input TEXT, new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_user_id UUID;
  referral_record_id UUID;
BEGIN
  -- Find the referrer
  SELECT user_id INTO referrer_user_id 
  FROM public.referral_codes 
  WHERE code = referral_code_input AND is_active = true;
  
  -- If no valid referral code found, return false
  IF referrer_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Make sure user isn't referring themselves
  IF referrer_user_id = new_user_id THEN
    RETURN false;
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (
    referrer_id, 
    referee_id, 
    referral_code,
    referrer_reward_amount,
    referee_reward_amount
  ) 
  VALUES (
    referrer_user_id, 
    new_user_id, 
    referral_code_input,
    100.00, -- ₹100 for referrer
    50.00   -- ₹50 for referee
  )
  RETURNING id INTO referral_record_id;
  
  -- Create reward coupons for both users
  -- Referrer coupon
  INSERT INTO public.coupons (
    code,
    discount_type,
    discount_value,
    minimum_amount,
    usage_limit,
    valid_from,
    valid_until,
    is_active,
    applicable_to,
    created_by
  ) VALUES (
    'REF' || generate_referral_code(),
    'fixed',
    100.00,
    0,
    1,
    now(),
    now() + interval '6 months',
    true,
    'all',
    referrer_user_id
  );
  
  -- Referee coupon
  INSERT INTO public.coupons (
    code,
    discount_type,
    discount_value,
    minimum_amount,
    usage_limit,
    valid_from,
    valid_until,
    is_active,
    applicable_to,
    created_by
  ) VALUES (
    'NEW' || generate_referral_code(),
    'fixed',
    50.00,
    0,
    1,
    now(),
    now() + interval '3 months',
    true,
    'all',
    new_user_id
  );
  
  RETURN true;
END;
$$;
