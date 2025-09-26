-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.mask_phone_number(phone_number text)
RETURNS text AS $$
BEGIN
  IF phone_number IS NULL OR length(phone_number) < 6 THEN
    RETURN phone_number;
  END IF;
  
  RETURN substr(phone_number, 1, 3) || '****' || substr(phone_number, -2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;