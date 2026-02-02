import { useState, useEffect, useCallback } from 'react';
import { JobCard } from './JobCard';
import { BannerAd } from './BannerAd';
import { calculateDistance, CITY_COORDINATES, type Coordinates } from '@/lib/location';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimePosts } from '@/hooks/useRealtimePosts';

interface JobFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
  refreshKey?: number;
  userLocation?: Coordinates | null;
  locationRadius?: number;
  onChatClick?: (userId: string, name: string) => void;
  onCardClick?: (post: any) => void;
}

export const JobFeed = ({ language, selectedSkill, searchQuery, refreshKey = 0, userLocation, locationRadius = 25, onChatClick, onCardClick }: JobFeedProps) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatPost = useCallback((post: any) => ({
    id: post.id,
    userId: post.user_id,
    name: post.name,
    work: post.title || '',
    location: post.location,
    coordinates: CITY_COORDINATES[post.location as keyof typeof CITY_COORDINATES],
    rate: post.rate || '',
    details: post.description || '',
    photo: Array.isArray(post.photos) ? post.photos[0] : '',
    phone: post.phone || '',
    isUrgent: post.is_urgent || false,
    isVerified: false,
    postType: 'giver' as const,
  }), []);

  // Real-time updates
  useRealtimePosts({
    language,
    onNewPost: (post) => {
      if (post.type !== 'service') {
        setJobs(prev => [formatPost(post), ...prev]);
      }
    },
    onUpdatePost: (post) => {
      if (post.type !== 'service') {
        setJobs(prev => prev.map(j => j.id === post.id ? formatPost(post) : j));
      }
    },
    onDeletePost: (postId) => {
      setJobs(prev => prev.filter(j => j.id !== postId));
    }
  });

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts_secure' as 'posts')
          .select('*')
          .neq('type', 'service')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs((data || []).map(formatPost));
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [refreshKey, formatPost]);

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSkill = selectedSkill === 'All' || job.work.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesSearch = !searchQuery || 
      job.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.work?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesLocation = true;
    if (userLocation && job.coordinates) {
      const distance = calculateDistance(userLocation, job.coordinates);
      matchesLocation = distance <= locationRadius;
    }
    
    return matchesSkill && matchesSearch && matchesLocation;
  })
  .map(job => {
    let distance = null;
    if (userLocation && job.coordinates) {
      distance = calculateDistance(userLocation, job.coordinates);
    }
    return { ...job, distance };
  })
  .sort((a, b) => {
    if (userLocation && a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Loading jobs...' : 'काम लोड हो रहे हैं...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en' ? 'No jobs found for this skill' : 'इस कौशल के लिए कोई काम नहीं मिला'}
          </p>
        </div>
      ) : (
        <>
          {filteredJobs.map((job, index) => (
            <div key={job.id}>
              <JobCard
                id={job.id}
                userId={job.userId}
                name={job.name}
                work={job.work}
                location={job.location}
                rate={job.rate}
                details={job.details}
                photo={job.photo}
                phone={job.phone}
                isUrgent={job.isUrgent}
                isVerified={job.isVerified}
                postType={job.postType}
                language={language}
                onChatClick={onChatClick}
                onCardClick={() => onCardClick?.(job)}
              />
              {/* Show inline ad after every 5 posts */}
              {(index + 1) % 5 === 0 && <BannerAd position="feed_inline" />}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
