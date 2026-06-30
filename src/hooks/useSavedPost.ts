import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedPost = (postId: string, language: 'en' | 'hi' = 'hi') => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      setUserId(user?.id ?? null);
      if (!user) return;
      const { data } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();
      if (!cancelled) setSaved(!!data);
    })();
    return () => { cancelled = true; };
  }, [postId]);

  const toggle = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!userId) {
      toast({
        title: language === 'hi' ? 'लॉगिन आवश्यक' : 'Login required',
        description: language === 'hi' ? 'सेव करने के लिए लॉगिन करें' : 'Please login to save',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await supabase.from('saved_posts').delete().eq('user_id', userId).eq('post_id', postId);
        setSaved(false);
        window.dispatchEvent(new CustomEvent('saved-posts-changed', { detail: { postId, saved: false } }));
        toast({ title: language === 'hi' ? 'हटा दिया गया' : 'Removed from saved' });
      } else {
        await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
        setSaved(true);
        window.dispatchEvent(new CustomEvent('saved-posts-changed', { detail: { postId, saved: true } }));
        toast({ title: language === 'hi' ? 'सेव हो गया' : 'Saved' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [saved, userId, postId, language, toast]);

  return { saved, toggle, loading };
};
