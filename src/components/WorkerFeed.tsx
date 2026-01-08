import { JobCard } from './JobCard';
import { calculateDistance, CITY_COORDINATES, type Coordinates } from '@/lib/location';

interface WorkerFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
  userLocation?: Coordinates | null;
  locationRadius?: number;
  onChatClick?: (userId: string, name: string) => void;
  onCardClick?: (post: any) => void;
}

export const WorkerFeed = ({ language, selectedSkill, searchQuery, userLocation, locationRadius = 25, onChatClick, onCardClick }: WorkerFeedProps) => {
  // Mock data - in real app this would come from API
  const workers = [
    {
      id: '1',
      userId: 'mock-worker-1',
      name: 'Ramesh Mishra',
      work: 'Mason - Foundation, Wall, RCC, Plaster',
      location: 'Lajpat Nagar, Delhi',
      coordinates: CITY_COORDINATES['Lajpat Nagar, Delhi'],
      details: '15 years experience in construction. Expert in brick laying, concrete work and tile installation.',
      photo: '',
      phone: '9876543210',
      isUrgent: false,
      isVerified: true,
      postType: 'seeker' as const,
    },
    {
      id: '2',
      userId: 'mock-worker-2',
      name: 'Geeta Kumari', 
      work: 'House Cleaning - Sweeping, Mopping, Laundry',
      location: 'Andheri, Mumbai',
      coordinates: CITY_COORDINATES['Andheri, Mumbai'],
      details: 'Professional cleaning service. Available for homes and offices. Own cleaning supplies.',
      photo: '',
      phone: '9876543211',
      isUrgent: false,
      isVerified: true,
      postType: 'seeker' as const,
    },
    {
      id: '3',
      userId: 'mock-worker-3',
      name: 'Vikash Singh',
      work: 'Shop Staff - Salesman, Cleaning, Delivery',
      location: 'Whitefield, Bangalore',
      coordinates: CITY_COORDINATES['Whitefield, Bangalore'],
      details: 'Experienced in retail sales. Know all Bangalore routes. Available for long shifts.',
      photo: '',
      phone: '9876543212',
      isUrgent: false,
      isVerified: false,
      postType: 'seeker' as const,
    },
    {
      id: '4',
      userId: 'mock-worker-4',
      name: 'Ravi Carpenter',
      work: 'Carpenter - Doors, Kitchen, Furniture',
      location: 'Karol Bagh, Delhi',
      coordinates: CITY_COORDINATES['Karol Bagh, Delhi'],
      details: 'Custom furniture making, door installation, wood polishing. Free estimates provided.',
      photo: '',
      phone: '9876543213',
      isUrgent: true,
      isVerified: true,
      postType: 'seeker' as const,
    },
  ];

  // Filter and sort workers
  const filteredWorkers = workers.filter(worker => {
    const matchesSkill = selectedSkill === 'All' || worker.work.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesSearch = !searchQuery || 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesLocation = true;
    if (userLocation && worker.coordinates) {
      const distance = calculateDistance(userLocation, worker.coordinates);
      matchesLocation = distance <= locationRadius;
    }
    
    return matchesSkill && matchesSearch && matchesLocation;
  })
  .map(worker => {
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
