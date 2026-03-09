import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface VideoComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { name: string; avatar_url: string | null };
}

interface VideoCommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string | null;
  language: 'en' | 'hi';
}

const VideoCommentSheet = ({ open, onOpenChange, videoId, language }: VideoCommentSheetProps) => {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (open && videoId) {
      fetchComments();
    }
  }, [open, videoId]);

  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const isCommentSupported = !!videoId && isValidUUID(videoId);

  const fetchComments = async () => {
    if (!isCommentSupported) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(c => c.user_id))];
      const profileMap = new Map<string, { name: string; avatar_url: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('user_id, name, avatar_url')
          .in('user_id', userIds);

        (profiles || []).forEach(p => {
          if (p.user_id) profileMap.set(p.user_id, { name: p.name || 'User', avatar_url: p.avatar_url });
        });
      }

      setComments((data || []).map(c => ({
        ...c,
        profile: profileMap.get(c.user_id) || { name: 'User', avatar_url: null }
      })));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;

    if (!currentUserId) {
      toast({
        title: language === 'hi' ? 'लॉगिन करें' : 'Please login',
        description: language === 'hi' ? 'कमेंट करने के लिए लॉगिन ज़रूरी है' : 'Login required to comment',
        variant: 'destructive'
      });
      return;
    }

    if (!isCommentSupported) {
      toast({
        title: language === 'hi' ? 'डेमो वीडियो' : 'Demo video',
        description: language === 'hi' ? 'इस वीडियो पर कमेंट सेव नहीं होंगे। अपलोड किए हुए वीडियो पर कमेंट करें।' : 'Comments are not saved on this demo video. Please comment on uploaded videos.',
        variant: 'destructive'
      });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('video_comments').insert({
        video_id: videoId,
        user_id: currentUserId,
        content: newComment.trim()
      });
      if (error) throw error;
      setNewComment('');
      await fetchComments();
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Error posting comment:', err);
      toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await supabase.from('video_comments').delete().eq('id', commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl bg-neutral-900 border-neutral-800 p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-neutral-800">
          <SheetTitle className="text-white text-center text-sm font-semibold">
            {comments.length} {language === 'hi' ? 'टिप्पणियाँ' : 'Comments'}
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ maxHeight: 'calc(60vh - 120px)' }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-white/40 text-sm py-8">
              {!isCommentSupported
                ? (language === 'hi' ? 'यह डेमो वीडियो है। कमेंट सेव करने के लिए अपलोड किए हुए वीडियो पर जाएँ।' : 'This is a demo video. Open an uploaded video to save comments.')
                : (language === 'hi' ? 'पहला कमेंट करें!' : 'Be the first to comment!')}
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 group">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={c.profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-neutral-700 text-white text-xs">
                    {(c.profile?.name || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white/60 text-xs font-semibold">
                    {c.profile?.name || 'User'}
                    <span className="text-white/30 font-normal ml-1">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </p>
                  <p className="text-white text-sm mt-0.5">{c.content}</p>
                </div>
                {c.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-neutral-800 bg-neutral-900 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={language === 'hi' ? 'कमेंट लिखें...' : 'Add a comment...'}
            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/40 text-sm rounded-full"
            maxLength={500}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={sending || !newComment.trim()}
            className="shrink-0 text-primary hover:text-primary"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoCommentSheet;
