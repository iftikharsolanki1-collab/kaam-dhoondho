import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { SkillChips } from '@/components/SkillChips';
import { JobFeed } from '@/components/JobFeed';
import { WorkerFeed } from '@/components/WorkerFeed';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PostJobForm } from '@/components/PostJobForm';
import { PostServiceForm } from '@/components/PostServiceForm';
import { PostDetailPage } from '@/components/PostDetailPage';
import { ProfilePage } from '@/components/ProfilePage';
import { SettingsPage } from '@/components/SettingsPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import AdminAdManager from '@/components/AdminAdManager';
import ChatPage from '@/components/ChatPage';
import TrendingPage from '@/components/TrendingPage';
import AdminPostForm from '@/components/AdminPostForm';
import ModerationQueue from '@/components/ModerationQueue';
import SafetyCenter from '@/components/SafetyCenter';
import { NotificationPage } from '@/components/NotificationPage';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationBadges } from '@/hooks/useNotificationBadges';
import { Button } from '@/components/ui/button';

import { AuthPage } from '@/components/AuthPage';

const ALLOWED_PAGES = new Set(['home', 'postDetail', 'chat', 'trending', 'notifications', 'profile', 'settings', 'auth', 'adminPost', 'adminAds', 'moderation', 'safety']);

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const [activeTab, setActiveTab] = useState<'employers' | 'workers'>('employers');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const postSubmitLockRef = useRef(false);
  const { toast } = useToast();
  const { counts: notificationCounts, clearBadge } = useNotificationBadges(user?.id);

  // Initialize light theme as default
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
    localStorage.setItem('theme', savedTheme);
  }, []);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const texts = {
    en: {
      searchPlaceholder: 'Search jobs, skills, or names...',
      heroTitle: 'Connect. Work. Grow.',
      heroSubtitle: 'Your local marketplace for skilled services',
    },
    hi: {
      searchPlaceholder: 'काम, कौशल या नाम खोजें...',
      heroTitle: 'जुड़ें। काम करें। बढ़ें।',
      heroSubtitle: 'कुशल सेवाओं के लिए आपका स्थानीय बाज़ार',
    }
  };


  // Hardware/browser back button: go to Home instead of closing the app
  useEffect(() => {
    // Always ensure there is a "home" entry in history
    window.history.replaceState({ page: 'home' }, '');
    window.history.pushState({ page: 'home' }, '');

    const onPopState = (e: PopStateEvent) => {
      const rawPage = (e.state as any)?.page ?? 'home';
      const page = ALLOWED_PAGES.has(rawPage) ? rawPage : 'home';

      if (page === 'home') {
        setCurrentPage('home');
        // Re-push home so next back doesn't close the app
        window.history.pushState({ page: 'home' }, '');
        return;
      }

      setCurrentPage(page);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync internal navigation into browser history
  useEffect(() => {
    if (currentPage === 'home') {
      window.history.replaceState({ page: 'home' }, '');
      return;
    }
    window.history.pushState({ page: currentPage }, '');
  }, [currentPage]);

  const handlePostSubmit = async (data: any) => {
    if (!user || postSubmitLockRef.current || isSubmittingPost) return;

    postSubmitLockRef.current = true;
    setIsSubmittingPost(true);

    try {
      const postType = activeTab === 'workers' ? 'service' : 'job';
      const phoneNumber = data.mobile || data.phone || '';

      // Upload photos to storage if provided
      let photoUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        for (const file of data.photos) {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file, { upsert: false });

          if (uploadError) {
            console.error('Photo upload failed:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          
          if (urlData?.publicUrl) {
            photoUrls.push(urlData.publicUrl);
          }
        }
      }

      const payload = {
        user_id: user.id,
        title: data.work || '',
        description: data.details || '',
        location: data.location || '',
        name: data.name || '',
        is_urgent: !!data.isUrgent,
        type: postType,
        photos: photoUrls.length > 0 ? photoUrls : null,
      };

      // Insert post first
      const { data: newPost, error } = await supabase.from('posts').insert(payload).select('id').single();
      if (error) throw error;

      // Insert phone into separate secure table
      if (phoneNumber && newPost?.id) {
        const { error: phoneError } = await supabase.from('post_phone_numbers').insert({
          post_id: newPost.id,
          phone: phoneNumber
        });
        if (phoneError) {
          console.error('Failed to save phone number:', phoneError);
        }
      }

      setPostsRefreshKey((k) => k + 1);
      setShowPostForm(false);

      toast({
        title: language === 'en' ? 'Success!' : 'सफलता!',
        description:
          language === 'en'
            ? 'Your post has been published successfully.'
            : 'आपकी पोस्ट सफलतापूर्वक प्रकाशित हो गई है।',
      });
    } catch (err: any) {
      console.error('Post submit failed:', err);
      toast({
        title: language === 'en' ? 'Post failed' : 'पोस्ट नहीं हुई',
        description: err?.message || (language === 'en' ? 'Please try again.' : 'कृपया फिर से कोशिश करें।'),
        variant: 'destructive',
      });
    } finally {
      postSubmitLockRef.current = false;
      setIsSubmittingPost(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    if (page === 'chat') {
      clearBadge('chat');
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

  const handleCardClick = (post: any) => {
    setSelectedPost(post);
    setCurrentPage('postDetail');
  };

  const renderCurrentPage = () => {
    console.log('Current page state:', currentPage);
    
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

    // Show auth page first for unauthenticated users
    if (!user) {
      return <AuthPage language={language} onSuccess={() => setCurrentPage('home')} />;
    }

    if (currentPage === 'auth') {
      return <AuthPage language={language} onSuccess={() => setCurrentPage('home')} />;
    }

    switch (currentPage) {
      case 'postDetail':
        return (
          <PostDetailPage
            post={selectedPost}
            language={language}
            onBack={() => setCurrentPage('home')}
            onChatClick={handleChatClick}
          />
        );
      
      case 'chat':
        console.log('Rendering chat page');
        return (
          <div className="fixed inset-0 z-50 bg-[#111b21]">
            <ChatPage 
              language={language}
              onBack={() => {
                setChatUserId(null);
                setCurrentPage('home');
              }}
              initialChatUserId={chatUserId}
            />
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
          <TrendingPage 
            language={language}
            onBack={() => setCurrentPage('home')}
          />
        );
      
      case 'adminPost':
        return (
          <AdminPostForm
            language={language}
            onBack={() => setCurrentPage('home')}
          />
        );

      case 'adminAds':
        return (
          <AdminAdManager
            language={language}
            onBack={() => setCurrentPage('profile')}
          />
        );

      case 'moderation':
        return (
          <ModerationQueue
            language={language}
            onBack={() => setCurrentPage('profile')}
          />
        );

      case 'safety':
        return (
          <SafetyCenter
            language={language}
            onBack={() => setCurrentPage('home')}
          />
        );
      
      case 'profile':
        return (
          <div className="min-h-screen bg-background pt-20 pb-20">
            <div className="container mx-auto px-4 py-4">
              <ProfilePage 
                language={language}
                onLanguageChange={setLanguage}
                onLogout={handleLogout}
                onProfileUpdate={() => setProfileRefreshKey(k => k + 1)}
                onAdminPost={() => setCurrentPage('adminPost')}
                onAdminAds={() => setCurrentPage('adminAds')}
                onModeration={() => setCurrentPage('moderation')}
                onSafetyCenter={() => setCurrentPage('safety')}
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
            {/* Hero Section */}
            <div className="bg-gradient-hero pt-4 pb-6 px-4">
              <div className="max-w-screen-xl mx-auto">
                <div className="text-center mb-5 animate-fade-in">
                  <h1 className="text-white text-2xl font-bold mb-1.5">
                    {texts[language].heroTitle}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {texts[language].heroSubtitle}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder={texts[language].searchPlaceholder}
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

            {/* Category Chips - Auto Scrolling */}
            <div className="bg-card border-b border-border">
              <SkillChips 
                language={language}
                selectedSkill={selectedSkill}
                onSkillSelect={setSelectedSkill}
              />
            </div>

            {/* Content Feed */}
            <div className="px-3 pb-20 pt-3">
              <div className="animate-fade-in">
                {activeTab === 'employers' ? (
                  <JobFeed 
                    language={language} 
                    selectedSkill={selectedSkill} 
                    searchQuery={searchQuery}
                    refreshKey={postsRefreshKey}
                    onChatClick={handleChatClick}
                    onCardClick={handleCardClick}
                  />
                ) : (
                  <WorkerFeed 
                    language={language} 
                    selectedSkill={selectedSkill} 
                    searchQuery={searchQuery}
                    refreshKey={postsRefreshKey}
                    onChatClick={handleChatClick}
                    onCardClick={handleCardClick}
                  />
                )}
              </div>
            </div>

            {/* FAB */}
            <button
              onClick={handleFloatingActionClick}
              className="fixed bottom-36 right-4 w-14 h-14 bg-gradient-fab rounded-full shadow-glow flex items-center justify-center text-white z-40 transition-all duration-300 hover:scale-110 active:scale-95"
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
        refreshKey={profileRefreshKey}
      />
      {renderCurrentPage()}

      {/* Hide bottom navigation when chat is open (chat is full-screen) */}
      {currentPage !== 'chat' && (
        <BottomNavigation 
          activeTab={currentPage}
          onTabChange={handlePageChange}
          language={language}
          notificationCounts={notificationCounts}
        />
      )}
      
      {/* Post Forms */}
      {showPostForm && (
        <>
          {activeTab === 'employers' ? (
            <PostJobForm
              language={language}
              onClose={() => setShowPostForm(false)}
              onSubmit={handlePostSubmit}
              isSubmitting={isSubmittingPost}
            />
          ) : (
            <PostServiceForm
              language={language}
              onClose={() => setShowPostForm(false)}
              onSubmit={handlePostSubmit}
              isSubmitting={isSubmittingPost}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
