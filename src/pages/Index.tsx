import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { SkillChips } from '@/components/SkillChips';
import { JobFeed } from '@/components/JobFeed';
import { WorkerFeed } from '@/components/WorkerFeed';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PostJobForm } from '@/components/PostJobForm';
import { PostServiceForm } from '@/components/PostServiceForm';
import { GovernmentSchemes } from '@/components/GovernmentSchemes';
import { ProfilePage } from '@/components/ProfilePage';
import { SettingsPage } from '@/components/SettingsPage';
import { TrendingPage } from '@/components/TrendingPage';
import { ChatPage } from '@/components/ChatPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-marketplace.jpg';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'employers' | 'workers'>('employers');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const { toast } = useToast();

  // Load saved jobs from localStorage
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    console.log('Saved jobs loaded:', savedJobs);
  }, []);

  const texts = {
    en: {
      searchPlaceholder: 'Search jobs, skills, or names...',
      nearbyJobs: 'Find nearby jobs',
      heroTitle: 'Connect. Work. Grow.',
      heroSubtitle: 'Your local marketplace for skilled services',
      postJob: 'Post a Job',
      offerService: 'Offer Service',
      trending: 'Trending Cards',
      comingSoon: 'Coming soon...'
    },
    hi: {
      searchPlaceholder: 'काम, कौशल या नाम खोजें...',
      nearbyJobs: 'आस-पास के काम खोजें',
      heroTitle: 'जुड़ें। काम करें। बढ़ें।',
      heroSubtitle: 'कुशल सेवाओं के लिए आपका स्थानीय बाज़ार',
      postJob: 'काम पोस्ट करें',
      offerService: 'सेवा दें',
      trending: 'ट्रेंडिंग कार्ड',
      comingSoon: 'जल्द आ रहा है...'
    }
  };

  const handlePostSubmit = (data: any) => {
    const newPost = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
    console.log('Posted:', newPost);
    setShowPostForm(false);
    toast({
      title: language === 'en' ? 'Success!' : 'सफलता!',
      description: language === 'en' 
        ? 'Your post has been published successfully.' 
        : 'आपकी पोस्ट सफलतापूर्वक प्रकाशित हो गई है।',
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      toast({
        title: language === 'en' ? 'Searching...' : 'खोज रहे हैं...',
        description: language === 'en' ? `Looking for: ${query}` : `खोज रहे हैं: ${query}`,
      });
    }
  };

  const handleNearbyJobs = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true);
          toast({
            title: language === 'en' ? 'Location Found' : 'स्थान मिल गया',
            description: language === 'en' ? 'Showing nearby jobs' : 'आस-पास के काम दिखा रहे हैं',
          });
        },
        (error) => {
          toast({
            title: language === 'en' ? 'Location Error' : 'स्थान त्रुटि',
            description: language === 'en' ? 'Please enable location access' : 'कृपया स्थान पहुंच सक्षम करें',
          });
        }
      );
    } else {
      toast({
        title: language === 'en' ? 'Not Supported' : 'समर्थित नहीं',
        description: language === 'en' ? 'Location not supported' : 'स्थान समर्थित नहीं है',
      });
    }
  };

  const handleFloatingActionClick = () => {
    setShowPostForm(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'schemes':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <GovernmentSchemes language={language} />
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <ChatPage 
                language={language}
                onBack={() => setCurrentPage('home')}
              />
            </div>
          </div>
        );
      
      case 'trending':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <TrendingPage language={language} />
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <ProfilePage language={language} />
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <SettingsPage 
                language={language} 
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-hero">
              <div className="absolute inset-0">
                <img 
                  src={heroImage} 
                  alt="Rojgar Mela Marketplace" 
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              <div className="relative container mx-auto px-4 py-8">
                <div className="text-center text-primary-foreground">
                  <h1 className="text-3xl font-bold mb-2">{texts[language].heroTitle}</h1>
                  <p className="text-lg opacity-90 mb-6">{texts[language].heroSubtitle}</p>
                  
                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={texts[language].searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 bg-background/90 backdrop-blur-sm border-primary-foreground/20 transition-all duration-200 focus:scale-105"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          handleSearch(searchQuery);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Nearby Jobs Button */}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mb-4 transition-all duration-200 hover:scale-105"
                    onClick={handleNearbyJobs}
                  >
                    <MapPin className={`w-4 h-4 mr-2 ${locationEnabled ? 'text-green-500' : ''}`} />
                    {texts[language].nearbyJobs}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              language={language}
            />

            {/* Skill Chips */}
            <SkillChips 
              language={language}
              selectedSkill={selectedSkill}
              onSkillSelect={setSelectedSkill}
            />

            {/* Content Feed */}
            <div className="container mx-auto px-4">
              {activeTab === 'employers' ? (
                <JobFeed language={language} selectedSkill={selectedSkill} />
              ) : (
                <WorkerFeed language={language} selectedSkill={selectedSkill} />
              )}
            </div>

            {/* Floating Action Button */}
            <Button
              variant="hero"
              size="lg"
              className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg z-40 transition-all duration-300 hover:scale-110 animate-bounce-gentle"
              onClick={handleFloatingActionClick}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        language={language}
        onLanguageChange={setLanguage}
        onProfileClick={() => setCurrentPage('profile')}
        onNotificationClick={() => toast({
          title: language === 'en' ? 'Notifications' : 'सूचनाएं',
          description: language === 'en' ? 'No new notifications' : 'कोई नई सूचना नहीं',
        })}
      />
      {renderCurrentPage()}
      <BottomNavigation 
        activeTab={currentPage}
        onTabChange={setCurrentPage}
        language={language}
      />
      
      {/* Post Forms */}
      {showPostForm && (
        <>
          {activeTab === 'employers' ? (
            <PostJobForm
              language={language}
              onClose={() => setShowPostForm(false)}
              onSubmit={handlePostSubmit}
            />
          ) : (
            <PostServiceForm
              language={language}
              onClose={() => setShowPostForm(false)}
              onSubmit={handlePostSubmit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
