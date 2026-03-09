import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, Plus, Check } from 'lucide-react';
import { MockVideo, MockUser, formatCount } from './mockData';

interface VideoOverlayProps {
  video: MockVideo;
  user: MockUser;
  isLiked: boolean;
  isFollowed: boolean;
  onLike: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfileClick: () => void;
  showHeartBurst: boolean;
  realCommentCount?: number;
  realLikeCount?: number;
}

const VideoOverlay = ({
  video, user, isLiked, isFollowed,
  onLike, onFollow, onComment, onShare, onProfileClick,
  showHeartBurst,
}: VideoOverlayProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Double-tap heart burst */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart className="w-28 h-28 text-red-500 drop-shadow-2xl" fill="#ef4444" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Right side action stack */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 pointer-events-auto">
        {/* Profile avatar */}
        <div className="relative" onClick={onProfileClick}>
          <img
            src={user.avatar}
            alt={user.username}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onFollow(); }}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white ${
              isFollowed ? 'bg-neutral-600' : 'bg-red-500'
            }`}
          >
            {isFollowed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Like */}
        <button onClick={onLike} className="flex flex-col items-center gap-1">
          <motion.div whileTap={{ scale: 1.4 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Heart
              className={`w-8 h-8 ${isLiked ? 'text-red-500' : 'text-white'}`}
              fill={isLiked ? '#ef4444' : 'transparent'}
              strokeWidth={2}
            />
          </motion.div>
          <span className="text-white text-[11px] font-semibold">{formatCount(video.likes + (isLiked ? 1 : 0))}</span>
        </button>

        {/* Comment */}
        <button onClick={onComment} className="flex flex-col items-center gap-1">
          <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
          <span className="text-white text-[11px] font-semibold">{formatCount(video.comments)}</span>
        </button>

        {/* Share */}
        <button onClick={onShare} className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
          <span className="text-white text-[11px] font-semibold">{formatCount(video.shares)}</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-16 left-3 right-20 pointer-events-auto">
        <p className="text-white font-bold text-[15px] mb-1" onClick={onProfileClick}>
          @{user.username}
        </p>
        <p className="text-white/90 text-[13px] leading-snug mb-3 line-clamp-2">
          {video.caption}
        </p>
        <div className="flex items-center gap-2 overflow-hidden">
          <Music className="w-4 h-4 text-white shrink-0" />
          <div className="overflow-hidden whitespace-nowrap">
            <motion.p
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="text-white/80 text-xs inline-block"
            >
              {video.trackName} — {video.artist} &nbsp;&nbsp;&nbsp; {video.trackName} — {video.artist}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;
