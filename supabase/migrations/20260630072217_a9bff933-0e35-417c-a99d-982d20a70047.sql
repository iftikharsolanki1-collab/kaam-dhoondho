DO $$ BEGIN BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts; EXCEPTION WHEN duplicate_object THEN NULL; END; END $$;
ALTER TABLE public.saved_posts REPLICA IDENTITY FULL;