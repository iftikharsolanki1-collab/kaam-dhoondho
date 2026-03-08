import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimePostsOptions {
  onNewPost?: (post: any) => void;
  onUpdatePost?: (post: any) => void;
  onDeletePost?: (postId: string) => void;
  language?: 'en' | 'hi';
}

export const useRealtimePosts = ({
  onNewPost,
  onUpdatePost,
  onDeletePost,
  language = 'en'
}: UseRealtimePostsOptions) => {
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Store callbacks in refs to avoid re-subscriptions
  const onNewPostRef = useRef(onNewPost);
  const onUpdatePostRef = useRef(onUpdatePost);
  const onDeletePostRef = useRef(onDeletePost);
  
  useEffect(() => { onNewPostRef.current = onNewPost; }, [onNewPost]);
  useEffect(() => { onUpdatePostRef.current = onUpdatePost; }, [onUpdatePost]);
  useEffect(() => { onDeletePostRef.current = onDeletePost; }, [onDeletePost]);

  const handlePostChange = useCallback((payload: any) => {
    console.log('Realtime post change:', payload);

    if (payload.eventType === 'INSERT') {
      onNewPostRef.current?.(payload.new);
      toast({
        title: language === 'en' ? '🆕 New Post!' : '🆕 नई पोस्ट!',
        description: language === 'en' 
          ? `New ${payload.new.type === 'service' ? 'service' : 'job'} posted: ${payload.new.title}`
          : `नई ${payload.new.type === 'service' ? 'सेवा' : 'नौकरी'} पोस्ट हुई: ${payload.new.title}`,
        duration: 4000,
      });
    } else if (payload.eventType === 'UPDATE') {
      onUpdatePostRef.current?.(payload.new);
    } else if (payload.eventType === 'DELETE') {
      onDeletePostRef.current?.(payload.old.id);
    }
  }, [language, toast]);

  useEffect(() => {
    // Subscribe to posts table changes
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        handlePostChange
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [handlePostChange]);

  return {
    channel: channelRef.current
  };
};

export default useRealtimePosts;
