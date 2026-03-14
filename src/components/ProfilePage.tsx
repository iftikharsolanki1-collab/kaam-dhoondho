import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, MapPin, Edit, Bookmark, Calendar, Camera, Bell, Palette, HelpCircle, LogOut, MessageSquare, Moon, Sun, Shield, Video, Play, Trash2, Upload, Grid3x3, Loader2 } from 'lucide-react';
import ProfileVideoPlayer from './ProfileVideoPlayer';

interface ProfilePageProps {
  language: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
  onLogout?: () => void;
  onProfileUpdate?: () => void;
  onAdminPost?: () => void;
  onAdminAds?: () => void;
  onModeration?: () => void;
  onSafetyCenter?: () => void;
  isAdminOverride?: boolean;
}

export const ProfilePage = ({ language, onLanguageChange, onLogout, onProfileUpdate, onAdminPost, onAdminAds, onModeration, onSafetyCenter, isAdminOverride = false }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedJobsList, setSavedJobsList] = useState<any[]>([]);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; caption: string; id?: string } | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailRefs = useRef<Map<string, string>>(new Map());
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    location: '',
    joinDate: '',
    profilePhoto: ''
  });
  const [notifications, setNotifications] = useState({
    newJobs: true,
    messages: true,
    schemes: false
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load profile data from database
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profileData) {
          setProfile({
            name: profileData.name || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            joinDate: profileData.created_at || '',
            profilePhoto: profileData.avatar_url || ''
          });
        } else {
          // Fallback to user metadata if profile not found
          setProfile({
            name: user.user_metadata?.name || '',
            phone: user.user_metadata?.phone || '',
            location: '',
            joinDate: user.created_at || '',
            profilePhoto: ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    const checkAdmin = async () => {
      if (isAdminOverride) {
        setIsAdmin(true);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      setIsAdmin(!!data);
    };

    loadProfile();
    checkAdmin();
  }, []);

  // Load followers/following counts
  useEffect(() => {
    if (!currentUserId) return;

    const loadFollowCounts = async () => {
      // Followers - people who follow me
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', currentUserId);

      // Following - people I follow
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUserId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    };

    loadFollowCounts();

    // Realtime subscription for follows changes
    const channel = supabase
      .channel('profile_follows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
        },
        () => {
          loadFollowCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Load saved jobs from Supabase instead of localStorage for security
  useEffect(() => {
    const loadSavedPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_posts')
          .select(`
            id,
            created_at,
            posts (
              id,
              title,
              description,
              location,
              rate,
              type,
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedJobsList(data || []);
      } catch (error) {
        console.error('Error loading saved posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved jobs',
          variant: 'destructive'
        });
      }
    };

    loadSavedPosts();
  }, [toast]);

  // Load user's uploaded videos
  useEffect(() => {
    const loadMyVideos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyVideos(data || []);
      } catch (error) {
        console.error('Error loading videos:', error);
      }
    };

    loadMyVideos();
  }, []);

  const texts = {
    en: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      savedJobs: 'Saved Jobs',
      name: 'Name',
      phone: 'Phone',
      location: 'Location',
      joinDate: 'Member Since',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      noSavedJobs: 'No saved jobs yet',
      viewAll: 'View All',
      uploadPhoto: 'Upload Photo',
      notifications: 'Notifications',
      newJobs: 'New Job Notifications',
      messages: 'Message Notifications',
      schemes: 'Government Scheme Updates',
      appearance: 'Appearance',
      theme: 'Theme',
      themeLabel: 'Theme',
      language: 'Language',
      support: 'Support & Help',
      liveChat: 'Live Chat Support',
      logout: 'Delete Account',
      logoutDesc: 'Permanently delete your account and all data',
      light: 'Light',
      dark: 'Dark'
    },
    hi: {
      title: 'मेरी प्रोफ़ाइल',
      personalInfo: 'व्यक्तिगत जानकारी',
      savedJobs: 'सेव किए गए काम',
      name: 'नाम',
      phone: 'फोन',
      location: 'स्थान',
      joinDate: 'सदस्य बनने की तारीख',
      edit: 'प्रोफ़ाइल संपादित करें',
      save: 'बदलाव सेव करें',
      cancel: 'रद्द करें',
      noSavedJobs: 'अभी तक कोई काम सेव नहीं किया',
      viewAll: 'सभी देखें',
      uploadPhoto: 'फोटो अपलोड करें',
      notifications: 'सूचनाएं',
      newJobs: 'नए काम की सूचनाएं',
      messages: 'संदेश सूचनाएं',
      schemes: 'सरकारी योजना अपडेट',
      appearance: 'दिखावट',
      theme: 'थीम',
      themeLabel: 'थीम',
      language: 'भाषा',
      support: 'समर्थन और सहायता',
      liveChat: 'लाइव चैट समर्थन',
      logout: 'खाता हटाएं',
      logoutDesc: 'अपना खाता और सभी डेटा स्थायी रूप से हटाएं',
      light: 'लाइट',
      dark: 'डार्क'
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: language === 'en' ? 'Invalid file type' : 'अमान्य फ़ाइल प्रकार',
        description: language === 'en' ? 'Only JPG, PNG, and WEBP images are allowed' : 'केवल JPG, PNG, और WEBP छवियाँ अनुमत हैं',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: language === 'en' ? 'File too large' : 'फ़ाइल बहुत बड़ी है',
        description: language === 'en' ? 'Maximum file size is 5MB' : 'अधिकतम फ़ाइल आकार 5MB है',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use safe extension from MIME type
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
      };
      const fileExt = extMap[file.type] || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({
        ...prev,
        profilePhoto: publicUrl
      }));

      // Notify parent to refresh header
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      toast({
        title: language === 'en' ? 'Success!' : 'सफलता!',
        description: language === 'en' ? 'Profile photo updated successfully' : 'प्रोफाइल फोटो सफलतापूर्वक अपडेट की गई',
      });

    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'त्रुटि',
        description: language === 'en' ? 'Failed to upload photo' : 'फोटो अपलोड करने में विफल',
        variant: 'destructive'
      });
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'en' 
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : date.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' });
  };

  const handleLogout = async () => {
    try {
      // Get current user before signing out
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Delete user's data from all tables
        await supabase.from('posts').delete().eq('user_id', user.id);
        await supabase.from('saved_posts').delete().eq('user_id', user.id);
        await supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        await supabase.from('notifications').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('user_id', user.id);
        await supabase.from('user_preferences').delete().eq('user_id', user.id);
        await supabase.from('user_favorites').delete().eq('user_id', user.id);
        await supabase.from('post_contacts').delete().eq('user_id', user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: language === 'en' ? 'Account Deleted' : 'खाता हटाया गया',
        description: language === 'en' ? 'Your account has been permanently deleted' : 'आपका खाता स्थायी रूप से हटा दिया गया है',
      });

      if (onLogout) {
        onLogout();
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'त्रुटि',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: language === 'en' ? 'Theme Updated' : 'थीम अपडेट की गई',
      description: language === 'en' ? `Switched to ${newTheme} mode` : `${newTheme === 'dark' ? 'डार्क' : 'लाइट'} मोड में स्विच किया गया`,
    });
  };

  const handleLiveChat = () => {
    toast({
      title: language === 'en' ? 'Support Chat' : 'सहायता चैट',
      description: language === 'en' ? 'Live chat support will connect you with an agent' : 'लाइव चैट सहायता आपको एक एजेंट से जोड़ेगी',
    });
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: language === 'en' ? 'Invalid file type' : 'अमान्य फ़ाइल प्रकार',
        description: language === 'en' ? 'Only MP4, WEBM videos are allowed' : 'केवल MP4, WEBM वीडियो अनुमत हैं',
        variant: 'destructive'
      });
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: language === 'en' ? 'File too large' : 'फ़ाइल बहुत बड़ी है',
        description: language === 'en' ? 'Maximum video size is 50MB' : 'अधिकतम वीडियो आकार 50MB है',
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-videos')
        .getPublicUrl(fileName);

      const { data: videoData, error: insertError } = await supabase
        .from('user_videos')
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          caption: ''
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setMyVideos(prev => [videoData, ...prev]);

      toast({
        title: language === 'en' ? 'Video Uploaded!' : 'वीडियो अपलोड हो गया!',
        description: language === 'en' ? 'Your video is now live on Trending' : 'आपका वीडियो अब ट्रेंडिंग पर लाइव है',
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({
        title: language === 'en' ? 'Upload Failed' : 'अपलोड विफल',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('user_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      setMyVideos(prev => prev.filter(v => v.id !== videoId));
      toast({
        title: language === 'en' ? 'Deleted' : 'हटा दिया गया',
        description: language === 'en' ? 'Video removed' : 'वीडियो हटा दिया गया',
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
    <ProfileVideoPlayer
      videoUrl={selectedVideo?.url || ''}
      caption={selectedVideo?.caption || ''}
      isOpen={!!selectedVideo}
      onClose={() => setSelectedVideo(null)}
      language={language}
      videoId={selectedVideo?.id}
    />
    <div className="space-y-6">
      {/* Profile Header - Instagram Style */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                <AvatarImage src={profile.profilePhoto} alt={profile.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              
              {/* Followers/Following Stats - Instagram Style */}
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{myVideos.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'वीडियो' : 'Videos'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{followersCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'फॉलोअर्स' : 'Followers'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'फॉलोइंग' : 'Following'}
                  </p>
                </div>
              </div>

              {profile.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Button */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            className="w-full"
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            {isEditing ? texts[language].cancel : texts[language].edit}
          </Button>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            {texts[language].personalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{texts[language].name}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{texts[language].phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">{texts[language].location}</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                {texts[language].save}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.name || '-'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone || '-'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile.location || '-'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Jobs */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-primary" />
              {texts[language].savedJobs}
            </CardTitle>
            {savedJobsList.length > 0 && (
              <Button variant="outline" size="sm">
                {texts[language].viewAll}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {savedJobsList.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {texts[language].noSavedJobs}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobsList.map((job, index) => (
                <div key={job.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">{job.name}</h4>
                        {job.isUrgent && (
                          <Badge variant="destructive" className="bg-urgent text-urgent-foreground text-xs">
                            🔴
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary">{job.work}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.location} • {job.rate}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  {index < savedJobsList.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Videos - Instagram Style Grid */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2 text-primary" />
              {language === 'hi' ? 'मेरे वीडियो' : 'My Videos'}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploadingVideo}
            >
              {isUploadingVideo ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}
              {isUploadingVideo
                ? (language === 'hi' ? 'अपलोड हो रहा...' : 'Uploading...')
                : (language === 'hi' ? 'वीडियो अपलोड' : 'Upload Video')}
            </Button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent>
          {myVideos.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'hi' ? 'अभी तक कोई वीडियो नहीं' : 'No videos yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'hi' ? 'वीडियो अपलोड करें, ट्रेंडिंग पर दिखेगा!' : 'Upload a video and it will show on Trending!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {myVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="relative aspect-[9/16] group bg-muted cursor-pointer"
                  onClick={() => setSelectedVideo({ url: video.video_url, caption: video.caption || '', id: video.id })}
                >
                  <VideoThumbnail videoUrl={video.video_url} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                    <Play className="w-3 h-3 text-white drop-shadow-md" fill="white" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primary" />
            {texts[language].notifications}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newJobs" className="text-sm font-medium">
              {texts[language].newJobs}
            </Label>
            <Switch
              id="newJobs"
              checked={notifications.newJobs}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, newJobs: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="messages" className="text-sm font-medium">
              {texts[language].messages}
            </Label>
            <Switch
              id="messages"
              checked={notifications.messages}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, messages: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="schemes" className="text-sm font-medium">
              {texts[language].schemes}
            </Label>
            <Switch
              id="schemes"
              checked={notifications.schemes}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, schemes: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2 text-primary" />
            {texts[language].appearance}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {texts[language].theme}
            </Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <label className="text-sm font-medium">
                    {texts[language].themeLabel}
                  </label>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {texts[language].light}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {texts[language].dark}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {onLanguageChange && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {texts[language].language}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onLanguageChange('en')}
                  className="text-sm"
                >
                  English
                </Button>
                <Button
                  variant={language === 'hi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onLanguageChange('hi')}
                  className="text-sm"
                >
                  हिंदी
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Center - visible to all */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onSafetyCenter}
          >
            <Shield className="w-4 h-4 mr-2" />
            {language === 'hi' ? 'सुरक्षा केंद्र' : 'Safety Center'}
          </Button>
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {isAdmin && onAdminPost && (
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onAdminPost}
            >
              <Shield className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'एडमिन: कंटेंट भेजें' : 'Admin: Send Content'}
            </Button>
            {onAdminAds && (
              <Button 
                variant="outline" 
                className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                onClick={onAdminAds}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'hi' ? '📢 विज्ञापन प्रबंधक (Ad Manager)' : '📢 Ad Manager'}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
              onClick={onModeration}
            >
              <Shield className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'मॉडरेशन कतार' : 'Moderation Queue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full transition-all duration-200 hover:scale-[1.02]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {texts[language].logout}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === 'en' ? 'Delete Account?' : 'खाता हटाएं?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'en' 
                    ? 'This will permanently delete your account and all your data. This action cannot be undone.' 
                    : 'यह आपके खाते और सभी डेटा को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  {language === 'en' ? 'Delete Account' : 'खाता हटाएं'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {texts[language].logoutDesc}
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

// Thumbnail component that generates a frame from the video
const VideoThumbnail = ({ videoUrl }: { videoUrl: string }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'metadata';
    video.src = videoUrl;

    video.onloadeddata = () => {
      video.currentTime = 1; // seek to 1 second for thumbnail
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 568;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL('image/jpeg', 0.7));
        }
      } catch {
        setError(true);
      }
    };

    video.onerror = () => setError(true);

    return () => {
      video.src = '';
    };
  }, [videoUrl]);

  if (thumbnail) {
    return <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />;
  }

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      {error ? (
        <Video className="w-8 h-8 text-muted-foreground" />
      ) : (
        <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
};