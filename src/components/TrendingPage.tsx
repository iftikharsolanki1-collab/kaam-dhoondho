import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './trending/VideoPlayer';
import VideoOverlay from './trending/VideoOverlay';
import VideoCommentSheet from './VideoCommentSheet';
import VideoProfilePage from './trending/VideoProfilePage';
import { mockVideos, mockUsers, type MockVideo, type MockUser, formatCount } from './trending/mockData';
import { supabase } from '@/integrations/supabase/client';

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
  const [dbVideos, setDbVideos] = useState<MockVideo[]>([]);
  const [dbUsers, setDbUsers] = useState<MockUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const { toast } = useToast();

  // Get current user and load their follows
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Load existing follows
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (follows) {
          const followedSet = new Set(follows.map(f => `db-${f.following_id}`));
          setFollowedUsers(followedSet);
        }
      }
    };
    loadCurrentUser();
  }, []);

  // Fetch user-uploaded videos from database
  const fetchUserVideos = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    
    const { data, error } = await supabase
      .from('user_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setIsRefreshing(false);
      return;
    }

    // Get unique user_ids
    const userIds = [...new Set(data.map(v => v.user_id))];
    
    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, avatar_url, location')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const usersFromDb: MockUser[] = userIds.map(uid => {
      const p = profileMap.get(uid);
      return {
        id: `db-${uid}`,
        username: (p?.name || 'User').toLowerCase().replace(/\s+/g, '_'),
        name: p?.name || 'User',
        avatar: p?.avatar_url || `https://i.pravatar.cc/150?u=${uid}`,
        bio: p?.location || '',
        followers: 0,
        following: 0,
        likes: 0,
        isFollowed: false,
      };
    });

    const videosFromDb: MockVideo[] = data.map((v) => ({
      id: `db-${v.id}`,
      userId: `db-${v.user_id}`,
      videoUrl: v.video_url,
      thumbnail: '',
      caption: v.caption || '',
      trackName: 'Original',
      artist: profileMap.get(v.user_id)?.name || 'User',
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      isLiked: false,
    }));

    setDbUsers(usersFromDb);
    setDbVideos(videosFromDb);
    setIsRefreshing(false);

    if (showToast) {
      toast({
        title: language === 'hi' ? '🔄 रिफ्रेश हो गया!' : '🔄 Refreshed!',
        description: language === 'hi' ? 'नए वीडियो लोड हो गए' : 'New videos loaded',
        duration: 2000,
      });
    }
  }, [language, toast]);

  // Fetch on mount and setup realtime subscription
  useEffect(() => {
    fetchUserVideos();

    // Realtime subscription for new videos
    const channel = supabase
      .channel('user_videos_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_videos',
        },
        () => {
          fetchUserVideos();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_videos',
        },
        () => {
          fetchUserVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUserVideos]);

  // Handle double-tap on title to refresh
  const handleTitleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected - refresh
      fetchUserVideos(true);
    }
    lastTapRef.current = now;
  }, [fetchUserVideos]);

  // Combine mock + real videos
  const allVideos = [...dbVideos, ...mockVideos];
  const allUsers = [...dbUsers, ...mockUsers];

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
  }, [setupObserver, selectedUserId, allVideos.length]);

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const toggleFollow = async (userId: string) => {
    // For mock users, just toggle local state
    if (!userId.startsWith('db-')) {
      setFollowedUsers((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
      return;
    }

    // For real users, save to database
    if (!currentUserId) {
      toast({
        title: language === 'hi' ? 'लॉगिन करें' : 'Login Required',
        description: language === 'hi' ? 'फॉलो करने के लिए लॉगिन करें' : 'Please login to follow users',
        variant: 'destructive'
      });
      return;
    }

    const realUserId = userId.replace('db-', '');
    
    // Don't allow following yourself
    if (realUserId === currentUserId) {
      toast({
        title: language === 'hi' ? 'अमान्य' : 'Invalid',
        description: language === 'hi' ? 'आप खुद को फॉलो नहीं कर सकते' : "You can't follow yourself",
      });
      return;
    }

    const isCurrentlyFollowing = followedUsers.has(userId);

    if (isCurrentlyFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', realUserId);

      if (!error) {
        setFollowedUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        toast({
          title: language === 'hi' ? 'अनफॉलो किया' : 'Unfollowed',
          description: language === 'hi' ? 'यूज़र को अनफॉलो कर दिया' : 'User unfollowed',
        });
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: realUserId
        });

      if (!error) {
        setFollowedUsers((prev) => new Set(prev).add(userId));
        toast({
          title: language === 'hi' ? 'फॉलो किया!' : 'Followed!',
          description: language === 'hi' ? 'यूज़र को फॉलो कर दिया' : 'User followed successfully',
        });
      } else if (error.code === '23505') {
        // Already following (unique constraint)
        setFollowedUsers((prev) => new Set(prev).add(userId));
      }
    }
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
    const idx = allVideos.findIndex((v) => v.id === videoId);
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
    const user = allUsers.find((u) => u.id === selectedUserId)!;
    const userVideos = allVideos.filter((v) => v.userId === selectedUserId);
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

      {/* Title - double tap to refresh */}
      <div 
        className="absolute top-3 left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none"
        onClick={handleTitleTap}
      >
        <h1 className="text-white font-bold text-lg drop-shadow-lg flex items-center gap-2">
          {language === 'hi' ? 'ट्रेंडिंग' : 'Trending'}
          {isRefreshing && (
            <span className="animate-spin">🔄</span>
          )}
        </h1>
        <p className="text-white/60 text-[10px] text-center">
          {language === 'hi' ? 'रिफ्रेश के लिए डबल टैप करें' : 'Double tap to refresh'}
        </p>
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allVideos.map((video, index) => {
          const user = allUsers.find((u) => u.id === video.userId)!;
          if (!user) return null;
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

      <VideoCommentSheet
        open={commentOpen}
        onOpenChange={setCommentOpen}
        videoId={allVideos[activeIndex]?.id || null}
        language={language}
      />
    </div>
  );
};

export default TrendingPage;
