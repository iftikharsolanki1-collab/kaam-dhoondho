import { JobCard } from './JobCard';
import { calculateDistance, CITY_COORDINATES, type Coordinates } from '@/lib/location';

interface JobFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
  userLocation?: Coordinates | null;
  locationRadius?: number;
  onChatClick?: (userId: string, name: string) => void;
}

export const JobFeed = ({ language, selectedSkill, searchQuery, userLocation, locationRadius = 25, onChatClick }: JobFeedProps) => {
  // Mock data - in real app this would come from API
  const jobs = [
    {
      id: '1',
      userId: 'mock-user-1',
      name: 'Rajesh Kumar',
      work: 'Plumber',
      location: 'Connaught Place, Delhi',
      coordinates: CITY_COORDINATES['Connaught Place, Delhi'],
      rate: '₹500/day',
      details: 'Need experienced plumber for bathroom renovation. Tile work and pipe fitting required.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
    {
      id: '2',
      userId: 'mock-user-2',
      name: 'Priya Sharma',
      work: 'House Cleaning',
      location: 'Bandra, Mumbai',
      coordinates: CITY_COORDINATES['Bandra, Mumbai'],
      rate: '₹300/day',
      details: 'Looking for reliable domestic help for daily cleaning. Must be punctual and honest.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '3',
      userId: 'mock-user-3',
      name: 'Amit Electricals',
      work: 'Electrician',
      location: 'Koramangala, Bangalore',
      coordinates: CITY_COORDINATES['Koramangala, Bangalore'],
      rate: '₹400/day',
      details: 'Electrical wiring work for new flat. AC installation and switch board setup needed.',
      photo: '',
      isUrgent: false,
      isVerified: false,
    },
    {
      id: '4',
      userId: 'mock-user-4',
      name: 'Sunita Devi',
      work: 'Cook',
      location: 'Sector 18, Noida',
      coordinates: CITY_COORDINATES['Sector 18, Noida'],
      rate: '₹8000/month',
      details: 'Need experienced cook for North Indian cuisine. Must know both veg and non-veg cooking.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
  ];

  // Filter and sort jobs based on selected skill, search query, and location
  const filteredJobs = jobs.filter(job => {
    const matchesSkill = selectedSkill === 'All' || job.work.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesSearch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Location-based filtering
    let matchesLocation = true;
    if (userLocation && job.coordinates) {
      const distance = calculateDistance(userLocation, job.coordinates);
      matchesLocation = distance <= locationRadius;
    }
    
    return matchesSkill && matchesSearch && matchesLocation;
  })
  .map(job => {
    // Add distance for sorting if user location is available
    let distance = null;
    if (userLocation && job.coordinates) {
      distance = calculateDistance(userLocation, job.coordinates);
    }
    return { ...job, distance };
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
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en' ? 'No jobs found for this skill' : 'इस कौशल के लिए कोई काम नहीं मिला'}
          </p>
        </div>
      ) : (
        filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            id={job.id}
            userId={job.userId}
            name={job.name}
            work={job.work}
            location={job.location}
            rate={job.rate}
            details={job.details}
            photo={job.photo}
            isUrgent={job.isUrgent}
            isVerified={job.isVerified}
            language={language}
            distance={job.distance}
            onChatClick={onChatClick}
          />
        ))
      )}
    </div>
  );
};