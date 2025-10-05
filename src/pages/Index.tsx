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
import ChatPage from '@/components/ChatPage';
import { AuthPage } from '@/components/AuthPage';
import { NotificationPage } from '@/components/NotificationPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, type Coordinates } from '@/lib/location';
import { useNotificationBadges } from '@/hooks/useNotificationBadges';
import heroImage from '@/assets/hero-marketplace.jpg';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
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
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { counts: notificationCounts, clearBadge } = useNotificationBadges(user?.id);

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
    clearBadge('notifications');
    setCurrentPage('notifications');
  };

  const handlePageChange = (page: string) => {
    // Clear badge when user visits the page
    if (page === 'chat') {
      clearBadge('chat');
    } else if (page === 'schemes') {
      clearBadge('schemes');
    }
    setCurrentPage(page);
  };

  const handleChatClick = (userId: string, userName: string) => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक',
        description: language === 'en' ? 'Please login to chat' : 'चैट करने के लिए कृपया लॉगिन करें',
      });
      return;
    }
    setChatUserId(userId);
    setCurrentPage('chat');
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

    // Show auth page when explicitly requested
    if (currentPage === 'auth') {
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
                onBack={() => {
                  setChatUserId(null);
                  setCurrentPage('home');
                }}
                initialChatUserId={chatUserId}
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
            {/* Hero Section - Redesigned */}
            <div className="relative overflow-hidden bg-gradient-hero min-h-[280px] flex items-center">
              <div className="absolute inset-0">
                <img 
                  src={heroImage} 
                  alt="Rojgar Mela Marketplace" 
                  className="w-full h-full object-cover opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background" />
              </div>
              
              <div className="relative container mx-auto px-4 py-8 w-full">
                <div className="text-center text-primary-foreground space-y-6 animate-fade-in">
                  {/* Title Section */}
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg">
                      {texts[language].heroTitle}
                    </h1>
                    <p className="text-base opacity-95 max-w-xs mx-auto">
                      {texts[language].heroSubtitle}
                    </p>
                  </div>
                  
                  {/* Enhanced Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10 transition-colors group-focus-within:text-primary" />
                      <Input
                        placeholder={texts[language].searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-12 pr-4 h-14 bg-background/95 backdrop-blur-md border-2 border-border/50 rounded-2xl shadow-elegant transition-all duration-300 focus:scale-[1.02] focus:shadow-glow focus:border-primary/50 text-base"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            handleSearch(searchQuery);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Nearby Jobs Button - Enhanced */}
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="secondary" 
                      size="default"
                      className="rounded-full px-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      onClick={handleNearbyJobs}
                    >
                      <MapPin className={`w-4 h-4 mr-2 transition-colors ${locationEnabled ? 'text-verified animate-pulse' : ''}`} />
                      <span className="font-medium">{texts[language].nearbyJobs}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation with subtle shadow */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm shadow-sm">
              <TabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                language={language}
              />
            </div>

            {/* Skill Chips */}
            <div className="bg-muted/30">
              <SkillChips 
                language={language}
                selectedSkill={selectedSkill}
                onSkillSelect={setSelectedSkill}
              />
            </div>

            {/* Content Feed */}
            <div className="container mx-auto px-4 pb-24">
              {locationEnabled && (
                <div className="mb-4 p-4 bg-gradient-to-r from-verified/10 to-verified/5 rounded-2xl border border-verified/20 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3 text-sm text-verified">
                    <div className="w-8 h-8 rounded-full bg-verified/20 flex items-center justify-center">
                      <MapPin className="w-4 h-4 animate-pulse" />
                    </div>
                    <span className="font-medium">
                      {language === 'en' 
                        ? `Showing nearby results within ${locationRadius}km` 
                        : `${locationRadius}किमी के भीतर के परिणाम दिखा रहे हैं`}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="animate-fade-in">
                {activeTab === 'employers' ? (
                  <JobFeed 
                    language={language} 
                    selectedSkill={selectedSkill} 
                    searchQuery={searchQuery}
                    userLocation={userLocation}
                    locationRadius={locationRadius}
                    onChatClick={handleChatClick}
                  />
                ) : (
                  <WorkerFeed 
                    language={language} 
                    selectedSkill={selectedSkill} 
                    searchQuery={searchQuery}
                    userLocation={userLocation}
                    locationRadius={locationRadius}
                    onChatClick={handleChatClick}
                  />
                )}
              </div>
            </div>

            {/* Floating Action Button - Enhanced */}
            <Button
              variant="hero"
              size="lg"
              className="fixed bottom-24 right-5 rounded-full w-16 h-16 shadow-glow z-40 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
              onClick={handleFloatingActionClick}
            >
              <Plus className="w-7 h-7" />
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
        notificationCount={notificationCounts.notifications}
        isLoggedIn={!!user}
        onLoginClick={() => setCurrentPage('auth')}
      />
      {renderCurrentPage()}
      <BottomNavigation 
        activeTab={currentPage}
        onTabChange={handlePageChange}
        language={language}
        notificationCounts={notificationCounts}
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
