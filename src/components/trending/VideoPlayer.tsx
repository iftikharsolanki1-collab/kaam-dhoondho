import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  onDoubleTap: () => void;
}

const VideoPlayer = ({ src, isActive, onDoubleTap }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
    }
  }, [isActive]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleTap();
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
  }, [onDoubleTap]);

  return (
    <div className="relative w-full h-full bg-neutral-950" onClick={handleTap}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
      />

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

      {/* Mute toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-neutral-900/60 backdrop-blur-md flex items-center justify-center"
      >
        {muted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
};

export default VideoPlayer;
