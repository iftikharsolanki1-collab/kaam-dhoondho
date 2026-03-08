import { useEffect, useRef } from 'react';
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
  const onNewPostRef = useRef(onNewPost);
  const onUpdatePostRef = useRef(onUpdatePost);
  const onDeletePostRef = useRef(onDeletePost);
  const languageRef = useRef(language);

  useEffect(() => {
    onNewPostRef.current = onNewPost;
    onUpdatePostRef.current = onUpdatePost;
    onDeletePostRef.current = onDeletePost;
    languageRef.current = language;
  }, [onNewPost, onUpdatePost, onDeletePost, language]);

  useEffect(() => {
    const channel = supabase
      .channel(`posts-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          console.log('Realtime post change:', payload);

          if (payload.eventType === 'INSERT') {
            onNewPostRef.current?.(payload.new);
            toast({
              title: languageRef.current === 'en' ? '🆕 New Post!' : '🆕 नई पोस्ट!',
              description: languageRef.current === 'en'
                ? `New ${payload.new.type === 'service' ? 'service' : 'job'} posted: ${payload.new.title}`
                : `नई ${payload.new.type === 'service' ? 'सेवा' : 'नौकरी'} पोस्ट हुई: ${payload.new.title}`,
              duration: 4000,
            });
          } else if (payload.eventType === 'UPDATE') {
            onUpdatePostRef.current?.(payload.new);
          } else if (payload.eventType === 'DELETE') {
            onDeletePostRef.current?.(payload.old.id);
          }
        }
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
  }, [toast]);

  return {
    channel: channelRef.current
  };
};

export default useRealtimePosts;

