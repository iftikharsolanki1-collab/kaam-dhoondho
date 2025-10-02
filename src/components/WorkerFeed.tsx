import { JobCard } from './JobCard';
import { calculateDistance, CITY_COORDINATES, type Coordinates } from '@/lib/location';

interface WorkerFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
  userLocation?: Coordinates | null;
  locationRadius?: number;
  onChatClick?: (userId: string, name: string) => void;
}

export const WorkerFeed = ({ language, selectedSkill, searchQuery, userLocation, locationRadius = 25, onChatClick }: WorkerFeedProps) => {
  // Mock data - in real app this would come from API
  const workers = [
    {
      id: '1',
      userId: 'mock-worker-1',
      name: 'Ramesh Mishra',
      work: 'Mason',
      location: 'Lajpat Nagar, Delhi',
      coordinates: CITY_COORDINATES['Lajpat Nagar, Delhi'],
      rate: '₹600/day',
      details: '15 years experience in construction. Expert in brick laying, concrete work and tile installation.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '2',
      userId: 'mock-worker-2',
      name: 'Geeta Kumari', 
      work: 'Cleaner',
      location: 'Andheri, Mumbai',
      coordinates: CITY_COORDINATES['Andheri, Mumbai'],
      rate: '₹400/day',
      details: 'Professional cleaning service. Available for homes and offices. Own cleaning supplies.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '3',
      userId: 'mock-worker-3',
      name: 'Vikash Singh',
      work: 'Driver',
      location: 'Whitefield, Bangalore',
      coordinates: CITY_COORDINATES['Whitefield, Bangalore'],
      rate: '₹1000/day',
      details: 'Experienced driver with clean license. Know all Bangalore routes. Available for long trips.',
      photo: '',
      isUrgent: false,
      isVerified: false,
    },
    {
      id: '4',
      userId: 'mock-worker-4',
      name: 'Ravi Carpenter',
      work: 'Carpenter',
      location: 'Karol Bagh, Delhi',
      coordinates: CITY_COORDINATES['Karol Bagh, Delhi'],
      rate: '₹500/day',
      details: 'Custom furniture making, door installation, wood polishing. Free estimates provided.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
  ];

  // Filter and sort workers based on selected skill, search query, and location
  const filteredWorkers = workers.filter(worker => {
    const matchesSkill = selectedSkill === 'All' || worker.work.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesSearch = !searchQuery || 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Location-based filtering
    let matchesLocation = true;
    if (userLocation && worker.coordinates) {
      const distance = calculateDistance(userLocation, worker.coordinates);
      matchesLocation = distance <= locationRadius;
    }
    
    return matchesSkill && matchesSearch && matchesLocation;
  })
  .map(worker => {
    // Add distance for sorting if user location is available
    let distance = null;
    if (userLocation && worker.coordinates) {
      distance = calculateDistance(userLocation, worker.coordinates);
    }
    return { ...worker, distance };
  })
  .sort((a, b) => {
    // Sort by distance if location is enabled, otherwise keep original order
    if (userLocation && a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    // Prioritize urgent jobs
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return 0;
  });

  return (
    <div className="space-y-4 pb-20">
      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en' ? 'No workers found for this skill' : 'इस कौशल के लिए कोई कारीगर नहीं मिला'}
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
            rate={worker.rate}
            details={worker.details}
            photo={worker.photo}
            isUrgent={worker.isUrgent}
            isVerified={worker.isVerified}
            language={language}
            distance={worker.distance}
            onChatClick={onChatClick}
          />
        ))
      )}
    </div>
  );
};