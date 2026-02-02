-- Add policy to allow notifications to be inserted via the send_notification function
-- The function is SECURITY DEFINER so it bypasses RLS, but we need a fallback for direct inserts

-- Enable realtime for govt_schemes table so changes appear instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.govt_schemes;

-- Enable realtime for app_ads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_ads;

-- Enable realtime for notifications table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;