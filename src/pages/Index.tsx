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
import { AuthPage } from '@/components/AuthPage';
import { NotificationPage } from '@/components/NotificationPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, type Coordinates } from '@/lib/location';
import heroImage from '@/assets/hero-marketplace.jpg';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'employers' | 'workers'>('employers');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationRadius, setLocationRadius] = useState(25); // Default 25km radius
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(savedTheme);
  }, []);

  // Auth state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  };

  const handleNearbyJobs = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationEnabled(true);
      toast({
        title: language === 'en' ? 'Location Found' : 'स्थान मिल गया',
        description: language === 'en' 
          ? `Showing jobs within ${locationRadius}km` 
          : `${locationRadius}किमी के भीतर के काम दिखा रहे हैं`,
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: language === 'en' ? 'Location Error' : 'स्थान त्रुटि',
        description: language === 'en' 
          ? 'Please enable location access in your browser' 
          : 'कृपया अपने ब्राउज़र में स्थान पहुंच सक्षम करें',
      });
    }
  };

  const handleFloatingActionClick = () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक',
        description: language === 'en' ? 'Please login to post a job' : 'काम पोस्ट करने के लिए कृपया लॉगिन करें',
      });
      return;
    }
    setShowPostForm(true);
  };

  const handleLogout = () => {
    setCurrentPage('home');
  };

  const handleNotificationClick = () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक',
        description: language === 'en' ? 'Please login to view notifications' : 'सूचनाएं देखने के लिए कृपया लॉगिन करें',
      });
      return;
    }
    setCurrentPage('notifications');
  };

  const renderCurrentPage = () => {
    console.log('Current page state:', currentPage);
    
    // Show loading while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Show auth page if not authenticated and trying to access protected pages
    const protectedPages = ['profile', 'settings', 'chat', 'notifications'];
    if (!user && protectedPages.includes(currentPage)) {
      return <AuthPage language={language} onSuccess={() => setCurrentPage('home')} />;
    }

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
        console.log('Rendering chat page');
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
      
      case 'notifications':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <NotificationPage 
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
                onLogout={handleLogout}
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
              {locationEnabled && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {language === 'en' 
                        ? `Showing nearby results within ${locationRadius}km` 
                        : `${locationRadius}किमी के भीतर के परिणाम दिखा रहे हैं`}
                    </span>
                  </div>
                </div>
              )}
              {activeTab === 'employers' ? (
                <JobFeed 
                  language={language} 
                  selectedSkill={selectedSkill} 
                  searchQuery={searchQuery}
                  userLocation={userLocation}
                  locationRadius={locationRadius}
                />
              ) : (
                <WorkerFeed 
                  language={language} 
                  selectedSkill={selectedSkill} 
                  searchQuery={searchQuery}
                  userLocation={userLocation}
                  locationRadius={locationRadius}
                />
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
        onNotificationClick={handleNotificationClick}
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
