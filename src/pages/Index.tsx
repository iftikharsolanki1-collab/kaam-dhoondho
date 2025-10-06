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

  // Initialize dark theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
    localStorage.setItem('theme', savedTheme);
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
              <ProfilePage 
                language={language}
                onLanguageChange={setLanguage}
                onLogout={handleLogout}
              />
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
            {/* Hero Section - Modern Mobile Design */}
            <div className="bg-gradient-hero pt-4 pb-6 px-4">
              <div className="max-w-screen-xl mx-auto">
                {/* Hero Text */}
                <div className="text-center mb-5 animate-fade-in">
                  <h1 className="text-white text-2xl font-bold mb-1.5">
                    जुड़ें। काम करें। बढ़ें।
                  </h1>
                  <p className="text-white/80 text-sm">
                    कुशल सेवाओं के लिए आपका स्थानीय बाज़ार
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="काम, कौशल या नाम खोजें..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-11 h-12 bg-card rounded-xl border-0 shadow-md text-base"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          handleSearch(searchQuery);
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Nearby Jobs Button */}
                <Button 
                  variant="secondary" 
                  className="w-full rounded-xl h-11 shadow-md font-medium"
                  onClick={handleNearbyJobs}
                >
                  <MapPin className={`w-4 h-4 mr-2 ${locationEnabled ? 'animate-pulse' : ''}`} />
                  📍 आस-पास के काम खोजें
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[52px] z-30 bg-background shadow-sm">
              <TabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                language={language}
              />
            </div>

            {/* Category Chips - Scrollable */}
            <div className="bg-card border-b border-border">
              <SkillChips 
                language={language}
                selectedSkill={selectedSkill}
                onSkillSelect={setSelectedSkill}
              />
            </div>

            {/* Content Feed */}
            <div className="px-3 pb-20 pt-3">
              {locationEnabled && (
                <div className="mb-3 p-3 bg-secondary/10 rounded-xl border border-secondary/20 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {locationRadius}किमी के भीतर के परिणाम दिखा रहे हैं
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

            {/* FAB - Gradient Orange to Blue */}
            <button
              onClick={handleFloatingActionClick}
              className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-fab rounded-full shadow-glow flex items-center justify-center text-white z-40 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
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
