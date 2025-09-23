import { JobCard } from './JobCard';

interface JobFeedProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  searchQuery: string;
}

export const JobFeed = ({ language, selectedSkill, searchQuery }: JobFeedProps) => {
  // Mock data - in real app this would come from API
  const jobs = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      work: 'Plumber',
      location: 'Connaught Place, Delhi',
      rate: '₹500/day',
      details: 'Need experienced plumber for bathroom renovation. Tile work and pipe fitting required.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
    {
      id: '2', 
      name: 'Priya Sharma',
      work: 'House Cleaning',
      location: 'Bandra, Mumbai',
      rate: '₹300/day',
      details: 'Looking for reliable domestic help for daily cleaning. Must be punctual and honest.',
      photo: '',
      isUrgent: false,
      isVerified: true,
    },
    {
      id: '3',
      name: 'Amit Electricals',
      work: 'Electrician',
      location: 'Koramangala, Bangalore',
      rate: '₹400/day',
      details: 'Electrical wiring work for new flat. AC installation and switch board setup needed.',
      photo: '',
      isUrgent: false,
      isVerified: false,
    },
    {
      id: '4',
      name: 'Sunita Devi',
      work: 'Cook',
      location: 'Sector 18, Noida',
      rate: '₹8000/month',
      details: 'Need experienced cook for North Indian cuisine. Must know both veg and non-veg cooking.',
      photo: '',
      isUrgent: true,
      isVerified: true,
    },
  ];

  // Filter jobs based on selected skill and search query
  const filteredJobs = jobs.filter(job => {
    const matchesSkill = selectedSkill === 'All' || job.work.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesSearch = !searchQuery || 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSkill && matchesSearch;
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
            name={job.name}
            work={job.work}
            location={job.location}
            rate={job.rate}
            details={job.details}
            photo={job.photo}
            isUrgent={job.isUrgent}
            isVerified={job.isVerified}
            language={language}
          />
        ))
      )}
    </div>
  );
};