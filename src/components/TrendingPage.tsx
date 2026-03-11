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
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dbVideos, setDbVideos] = useState<MockVideo[]>([]);
  const [dbUsers, setDbUsers] = useState<MockUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const { toast } = useToast();

  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Get current user and load their follows + likes
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

        // Load existing video likes
        const { data: likes } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', user.id);
        
        if (likes) {
          const likedSet = new Set(likes.map(l => l.video_id));
          setLikedVideos(likedSet);
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

    // Fetch real comment & like counts for DB videos
    const videoIds = data.map(v => v.id);
    if (videoIds.length > 0) {
      const [commentsRes, likesRes] = await Promise.all([
        supabase.from('video_comments').select('video_id').in('video_id', videoIds),
        supabase.from('video_likes').select('video_id').in('video_id', videoIds),
      ]);

      const cMap = new Map<string, number>();
      const lMap = new Map<string, number>();
      (commentsRes.data || []).forEach(r => cMap.set(r.video_id, (cMap.get(r.video_id) || 0) + 1));
      (likesRes.data || []).forEach(r => lMap.set(r.video_id, (lMap.get(r.video_id) || 0) + 1));
      setCommentCounts(cMap);
      setLikeCounts(lMap);
    }

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

  // Handle tap on title to refresh
  const handleTitleTap = useCallback(() => {
    if (!isRefreshing) {
      fetchUserVideos(true);
    }
  }, [fetchUserVideos, isRefreshing]);

  // DB videos first (newest), then mock videos
  const allVideos = [...dbVideos, ...mockVideos];
  const allUsers = [...dbUsers, ...mockUsers];

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 100));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && !isRefreshing) {
      fetchUserVideos(true);
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, isRefreshing, fetchUserVideos]);

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

  const toggleLike = async (videoId: string) => {
    const rawId = videoId.replace('db-', '');
    const isCurrentlyLiked = likedVideos.has(rawId);

    // Optimistic update
    setLikedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(rawId)) next.delete(rawId);
      else next.add(rawId);
      return next;
    });

    // Update like count optimistically for DB videos
    if (isValidUUID(rawId)) {
      setLikeCounts(prev => {
        const next = new Map(prev);
        next.set(rawId, (prev.get(rawId) || 0) + (isCurrentlyLiked ? -1 : 1));
        return next;
      });
    }

    // Persist to DB for real videos
    if (isValidUUID(rawId) && currentUserId) {
      try {
        if (isCurrentlyLiked) {
          await supabase.from('video_likes').delete()
            .eq('video_id', rawId)
            .eq('user_id', currentUserId);
        } else {
          await supabase.from('video_likes').insert({
            video_id: rawId,
            user_id: currentUserId,
          });
        }
      } catch (err) {
        // Revert on error
        setLikedVideos((prev) => {
          const next = new Set(prev);
          if (isCurrentlyLiked) next.add(rawId);
          else next.delete(rawId);
          return next;
        });
        setLikeCounts(prev => {
          const next = new Map(prev);
          next.set(rawId, (prev.get(rawId) || 0) + (isCurrentlyLiked ? 1 : -1));
          return next;
        });
      }
    }
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
    const rawId = videoId.replace('db-', '');
    if (!likedVideos.has(rawId)) toggleLike(videoId);
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

      {/* Title - tap to refresh */}
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
          {language === 'hi' ? 'रिफ्रेश के लिए टैप करें' : 'Tap to refresh'}
        </p>
      </div>

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div className={`text-white text-2xl ${pullDistance > 60 ? 'animate-spin' : ''}`}>
            🔄
          </div>
          <p className="text-white/70 text-xs ml-2">
            {pullDistance > 60 
              ? (language === 'hi' ? 'छोड़ें' : 'Release') 
              : (language === 'hi' ? 'खींचें' : 'Pull')}
          </p>
        </div>
      )}

      {/* Video feed */}
      <div
        ref={containerRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allVideos.map((video, index) => {
          const user = allUsers.find((u) => u.id === video.userId)!;
          if (!user) return null;
          return (
            <div key={video.id}>
              <div
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
                  isLiked={likedVideos.has(video.id.replace('db-', ''))}
                  isFollowed={followedUsers.has(user.id)}
                  onLike={() => toggleLike(video.id)}
                  onFollow={() => toggleFollow(user.id)}
                  onComment={() => setCommentOpen(true)}
                  onShare={handleShare}
                  onProfileClick={() => setSelectedUserId(user.id)}
                  showHeartBurst={heartBursts.has(video.id)}
                  realCommentCount={video.id.startsWith('db-') ? commentCounts.get(video.id.replace('db-', '')) : undefined}
                  realLikeCount={video.id.startsWith('db-') ? likeCounts.get(video.id.replace('db-', '')) : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      <VideoCommentSheet
        open={commentOpen}
        onOpenChange={(open) => {
          setCommentOpen(open);
          if (!open) {
            // Refresh counts when comment sheet closes
            const vid = allVideos[activeIndex]?.id?.replace('db-', '');
            if (vid && isValidUUID(vid)) {
              supabase.from('video_comments').select('video_id').eq('video_id', vid).then(({ data }) => {
                setCommentCounts(prev => {
                  const next = new Map(prev);
                  next.set(vid, data?.length || 0);
                  return next;
                });
              });
            }
          }
        }}
        videoId={allVideos[activeIndex]?.id?.replace('db-', '') || null}
        language={language}
      />
    </div>
  );
};

export default TrendingPage;
