import { JobCard } from './JobCard';

interface WorkerFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
}

export const WorkerFeed = ({ language, selectedSkill }: WorkerFeedProps) => {
  // Mock data - in real app this would come from API
  const workers = [
    {
      id: '1',
      name: 'Ramesh Mishra',
      work: 'Mason',
      location: 'Lajpat Nagar, Delhi',
      rate: '₹600/day',
      details: '15 years experience in construction. Expert in brick laying, concrete work and tile installation.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '2',
      name: 'Geeta Kumari', 
      work: 'Cleaner',
      location: 'Andheri, Mumbai',
      rate: '₹400/day',
      details: 'Professional cleaning service. Available for homes and offices. Own cleaning supplies.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '3',
      name: 'Vikash Singh',
      work: 'Driver',
      location: 'Whitefield, Bangalore',
      rate: '₹1000/day',
      details: 'Experienced driver with clean license. Know all Bangalore routes. Available for long trips.',
      photo: '',
      isUrgent: false,
      isVerified: false,
    },
    {
      id: '4',
      name: 'Ravi Carpenter',
      work: 'Carpenter',
      location: 'Karol Bagh, Delhi',
      rate: '₹500/day',
      details: 'Custom furniture making, door installation, wood polishing. Free estimates provided.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
  ];

  // Filter workers based on selected skill
  const filteredWorkers = selectedSkill === 'All' 
    ? workers 
    : workers.filter(worker => worker.work.toLowerCase().includes(selectedSkill.toLowerCase()));

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
            name={worker.name}
            work={worker.work}
            location={worker.location}
            rate={worker.rate}
            details={worker.details}
            photo={worker.photo}
            isUrgent={worker.isUrgent}
            isVerified={worker.isVerified}
            language={language}
          />
        ))
      )}
    </div>
  );
};