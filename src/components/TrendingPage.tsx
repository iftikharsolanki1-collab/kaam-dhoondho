import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './trending/VideoPlayer';
import VideoOverlay from './trending/VideoOverlay';
import CommentSheet from './trending/CommentSheet';
import VideoProfilePage from './trending/VideoProfilePage';
import { mockVideos, mockUsers, type MockVideo } from './trending/mockData';

interface TrendingPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

const TrendingPage = ({ language, onBack }: TrendingPageProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [heartBursts, setHeartBursts] = useState<Set<string>>(new Set());
  const [commentOpen, setCommentOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Intersection observer for active video detection
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.8 }
    );

    const container = containerRef.current;
    if (container) {
      container.querySelectorAll('[data-index]').forEach((el) => {
        observerRef.current?.observe(el);
      });
    }
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver, selectedUserId]);

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const triggerHeartBurst = (videoId: string) => {
    if (!likedVideos.has(videoId)) toggleLike(videoId);
    setHeartBursts((prev) => new Set(prev).add(videoId));
    setTimeout(() => {
      setHeartBursts((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }, 800);
  };

  const handleShare = () => {
    toast({
      title: language === 'hi' ? 'शेयर' : 'Share',
      description: language === 'hi' ? 'शेयर लिंक कॉपी हो गया!' : 'Share link copied!',
    });
  };

  const scrollToVideo = (videoId: string) => {
    const idx = mockVideos.findIndex((v) => v.id === videoId);
    if (idx >= 0) {
      setSelectedUserId(null);
      setTimeout(() => {
        const container = containerRef.current;
        if (container) {
          const target = container.querySelector(`[data-index="${idx}"]`);
          target?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  // Profile page view
  if (selectedUserId) {
    const user = mockUsers.find((u) => u.id === selectedUserId)!;
    const userVideos = mockVideos.filter((v) => v.userId === selectedUserId);
    return (
      <VideoProfilePage
        user={user}
        videos={userVideos}
        isFollowed={followedUsers.has(selectedUserId)}
        onBack={() => setSelectedUserId(null)}
        onFollow={() => toggleFollow(selectedUserId)}
        onVideoClick={scrollToVideo}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950">
      {/* Back button */}
      <div className="absolute top-3 left-3 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-neutral-800/60 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Title */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
        <h1 className="text-white font-bold text-lg drop-shadow-lg">
          {language === 'hi' ? 'ट्रेंडिंग' : 'Trending'}
        </h1>
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mockVideos.map((video, index) => {
          const user = mockUsers.find((u) => u.id === video.userId)!;
          return (
            <div
              key={video.id}
              data-index={index}
              className="h-screen w-screen snap-start snap-always relative"
            >
              <VideoPlayer
                src={video.videoUrl}
                isActive={activeIndex === index}
                onDoubleTap={() => triggerHeartBurst(video.id)}
              />
              <VideoOverlay
                video={video}
                user={user}
                isLiked={likedVideos.has(video.id)}
                isFollowed={followedUsers.has(user.id)}
                onLike={() => toggleLike(video.id)}
                onFollow={() => toggleFollow(user.id)}
                onComment={() => setCommentOpen(true)}
                onShare={handleShare}
                onProfileClick={() => setSelectedUserId(user.id)}
                showHeartBurst={heartBursts.has(video.id)}
              />
            </div>
          );
        })}
      </div>

      <CommentSheet
        open={commentOpen}
        onOpenChange={setCommentOpen}
        commentCount={mockVideos[activeIndex]?.comments ?? 0}
      />
    </div>
  );
};

export default TrendingPage;
