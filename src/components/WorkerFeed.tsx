import { useEffect, useState } from 'react';
import { JobCard } from './JobCard';
import { calculateDistance, CITY_COORDINATES, type Coordinates } from '@/lib/location';
import { supabase } from '@/integrations/supabase/client';

interface WorkerFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
  refreshKey?: number;
  userLocation?: Coordinates | null;
  locationRadius?: number;
  onChatClick?: (userId: string, name: string) => void;
  onCardClick?: (post: any) => void;
}

export const WorkerFeed = ({
  language,
  selectedSkill,
  searchQuery,
  refreshKey = 0,
  userLocation,
  locationRadius = 25,
  onChatClick,
  onCardClick,
}: WorkerFeedProps) => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'service')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((post) => ({
          id: post.id,
          userId: post.user_id,
          name: post.name,
          work: post.title || '',
          location: post.location,
          coordinates: CITY_COORDINATES[post.location as keyof typeof CITY_COORDINATES],
          details: post.description || '',
          photo: Array.isArray(post.photos) ? post.photos[0] : '',
          phone: post.phone || '',
          isUrgent: post.is_urgent || false,
          isVerified: false,
          postType: 'seeker' as const,
        }));

        setWorkers(formatted);
      } catch (err) {
        console.error('Error loading service posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Loading services...' : 'सेवाएं लोड हो रही हैं...'}
        </p>
      </div>
    );
  }

  const filteredWorkers = workers
    .filter((worker) => {
      const matchesSkill =
        selectedSkill === 'All' ||
        worker.work.toLowerCase().includes(selectedSkill.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.work?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.details?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesLocation = true;
      if (userLocation && worker.coordinates) {
        const distance = calculateDistance(userLocation, worker.coordinates);
        matchesLocation = distance <= locationRadius;
      }

      return matchesSkill && matchesSearch && matchesLocation;
    })
    .map((worker) => {
      let distance = null;
      if (userLocation && worker.coordinates) {
        distance = calculateDistance(userLocation, worker.coordinates);
      }
      return { ...worker, distance };
    })
    .sort((a, b) => {
      if (userLocation && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });

  return (
    <div className="space-y-4 pb-20">
      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'No workers found for this skill'
              : 'इस कौशल के लिए कोई कारीगर नहीं मिला'}
          </p>
        </div>
      ) : (
        filteredWorkers.map((worker) => (
          <JobCard
            key={worker.id}
            id={worker.id}
            userId={worker.userId}
            name={worker.name}
            work={worker.work}
            location={worker.location}
            details={worker.details}
            photo={worker.photo}
            phone={worker.phone}
            isUrgent={worker.isUrgent}
            isVerified={worker.isVerified}
            postType={worker.postType}
            language={language}
            onChatClick={onChatClick}
            onCardClick={() => onCardClick?.(worker)}
          />
        ))
      )}
    </div>
  );
};

