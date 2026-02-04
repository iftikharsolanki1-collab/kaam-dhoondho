import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Bell, 
  Palette, 
  LogOut, 
  Moon,
  Sun
} from 'lucide-react';

interface SettingsPageProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onLogout?: () => void;
}

export const SettingsPage = ({ language, onLanguageChange, onLogout }: SettingsPageProps) => {
  const [notifications, setNotifications] = useState({
    newJobs: true,
    messages: true,
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

  const texts = {
    en: {
      title: 'Settings',
      account: 'Account Settings',
      profile: 'Edit Profile',
      notifications: 'Notifications',
      newJobs: 'New Job Notifications',
      messages: 'Message Notifications', 
      appearance: 'Appearance',
      theme: 'Theme',
      themeLabel: 'Theme',
      language: 'Language',
      logout: 'Delete Account',
      logoutDesc: 'Permanently delete your account and all data',
      light: 'Light',
      dark: 'Dark'
    },
    hi: {
      title: 'सेटिंग्स',
      account: 'खाता सेटिंग्स',
      profile: 'प्रोफ़ाइल संपादित करें',
      notifications: 'सूचनाएं',
      newJobs: 'नए काम की सूचनाएं',
      messages: 'संदेश सूचनाएं',
      appearance: 'दिखावट',
      theme: 'थीम',
      themeLabel: 'थीम',
      language: 'भाषा',
      logout: 'खाता हटाएं',
      logoutDesc: 'अपना खाता और सभी डेटा स्थायी रूप से हटाएं',
      light: 'लाइट',
      dark: 'डार्क'
    }
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

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    toast({
      title: language === 'en' ? 'Feature Coming Soon' : 'सुविधा जल्द आ रही है',
      description: language === 'en' ? 'Profile editing will be available soon' : 'प्रोफाइल संपादन जल्द उपलब्ध होगा',
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: language === 'en' ? 'Theme Updated' : 'थीम अपडेट की गई',
      description: language === 'en' ? `Switched to ${newTheme} mode` : `${newTheme === 'dark' ? 'डार्क' : 'लाइट'} मोड में स्विच किया गया`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-foreground">
          {texts[language].title}
        </h2>
      </div>

      {/* Account Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            {texts[language].account}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start transition-all duration-200 hover:scale-[1.02]"
            onClick={handleEditProfile}
          >
            <User className="w-4 h-4 mr-3" />
            {texts[language].profile}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
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
        </CardContent>
      </Card>

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
  );
};
