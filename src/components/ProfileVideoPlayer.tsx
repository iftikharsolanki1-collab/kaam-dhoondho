import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VideoCommentSheet from './VideoCommentSheet';
import { supabase } from '@/integrations/supabase/client';

interface ProfileVideoPlayerProps {
  videoUrl: string;
  caption: string;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  videoId?: string;
}

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const ProfileVideoPlayer = ({ videoUrl, caption, isOpen, onClose, language, videoId }: ProfileVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const lastTapRef = useRef(0);
  const { toast } = useToast();

  // Load current user, existing like status, and like count
  useEffect(() => {
    if (!isOpen || !videoId || !isValidUUID(videoId)) return;

    const loadLikeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', videoId)
          .eq('user_id', user.id)
          .maybeSingle();
        setLiked(!!data);
      }

      const { count } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);
      setLikeCount(count || 0);
    };
    loadLikeData();
  }, [isOpen, videoId]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setPaused(false);
    }
  }, [isOpen]);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap - like
      if (!liked) {
        persistLike(true);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    setTimeout(() => {
      if (lastTapRef.current === 0) return;
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    }, 310);
  };

  const persistLike = async (newLikedState: boolean) => {
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    if (videoId && isValidUUID(videoId) && currentUserId) {
      try {
        if (newLikedState) {
          await supabase.from('video_likes').insert({ video_id: videoId, user_id: currentUserId });
        } else {
          await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', currentUserId);
        }
      } catch {
        // Revert
        setLiked(!newLikedState);
        setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      }
    }
  };

  const handleLike = () => {
    persistLike(!liked);
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: caption || 'Video', url: videoUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(videoUrl);
      toast({
        title: language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!',
        description: language === 'hi' ? 'वीडियो लिंक कॉपी हो गया' : 'Video link copied to clipboard',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-neutral-950"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-neutral-900/60 backdrop-blur-md flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Mute toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-neutral-900/60 backdrop-blur-md flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        {/* Video */}
        <div className="w-full h-full" onClick={handleTap}>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain bg-neutral-950"
            loop
            muted={muted}
            playsInline
            autoPlay
          />
        </div>

        {/* Play/Pause feedback */}
        <AnimatePresence>
          {showPlayIcon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {paused ? (
                <Pause className="w-20 h-20 text-white drop-shadow-2xl" fill="white" />
              ) : (
                <Play className="w-20 h-20 text-white drop-shadow-2xl" fill="white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heart burst on double tap */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-28 h-28 text-red-500 drop-shadow-2xl" fill="#ef4444" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Right side action buttons */}
        <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 z-20">
          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            <motion.div whileTap={{ scale: 1.4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Heart
                className={`w-8 h-8 ${liked ? 'text-red-500' : 'text-white'}`}
                fill={liked ? '#ef4444' : 'transparent'}
                strokeWidth={2}
              />
            </motion.div>
            <span className="text-white text-[11px] font-semibold">{likeCount}</span>
          </button>

          {/* Comment */}
          <button onClick={handleComment} className="flex flex-col items-center gap-1">
            <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
            <span className="text-white text-[11px] font-semibold">
              {language === 'hi' ? 'टिप्पणी' : 'Comment'}
            </span>
          </button>

          {/* Share */}
          <button onClick={handleShare} className="flex flex-col items-center gap-1">
            <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
            <span className="text-white text-[11px] font-semibold">
              {language === 'hi' ? 'शेयर' : 'Share'}
            </span>
          </button>
        </div>

        {/* Bottom caption */}
        {caption && (
          <div className="absolute bottom-16 left-4 right-20 z-20">
            <p className="text-white/90 text-sm leading-snug line-clamp-2">{caption}</p>
          </div>
        )}

        {/* Comment Sheet */}
        <VideoCommentSheet
          open={showComments}
          onOpenChange={setShowComments}
          videoId={videoId || null}
          language={language}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileVideoPlayer;
