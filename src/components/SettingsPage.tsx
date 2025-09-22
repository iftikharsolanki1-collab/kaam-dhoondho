import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Settings, 
  User, 
  Palette, 
  MessageSquare, 
  LogOut, 
  Bell,
  Globe,
  Shield,
  HelpCircle 
} from 'lucide-react';

interface SettingsPageProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

export const SettingsPage = ({ language, onLanguageChange }: SettingsPageProps) => {
  const [notifications, setNotifications] = useState({
    newJobs: true,
    messages: true,
    schemes: false
  });
  const [theme, setTheme] = useState('light');

  const texts = {
    en: {
      title: 'Settings',
      account: 'Account Settings',
      profile: 'Edit Profile',
      notifications: 'Notifications',
      newJobs: 'New Job Notifications',
      messages: 'Message Notifications', 
      schemes: 'Government Scheme Updates',
      appearance: 'Appearance',
      theme: 'Theme',
      language: 'Language',
      support: 'Support & Help',
      liveChat: 'Live Chat Support',
      help: 'Help Center',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      logout: 'Log Out',
      logoutDesc: 'Sign out of your account',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System'
      }
    },
    hi: {
      title: 'सेटिंग्स',
      account: 'खाता सेटिंग्स',
      profile: 'प्रोफ़ाइल संपादित करें',
      notifications: 'सूचनाएं',
      newJobs: 'नए काम की सूचनाएं',
      messages: 'संदेश सूचनाएं',
      schemes: 'सरकारी योजना अपडेट',
      appearance: 'दिखावट',
      theme: 'थीम',
      language: 'भाषा',
      support: 'समर्थन और सहायता',
      liveChat: 'लाइव चैट समर्थन',
      help: 'सहायता केंद्र',
      privacy: 'प्राइवेसी पॉलिसी',
      terms: 'सेवा की शर्तें',
      logout: 'लॉग आउट',
      logoutDesc: 'अपने खाते से साइन आउट करें',
      themes: {
        light: 'हल्का',
        dark: 'गहरा',
        system: 'सिस्टम'
      }
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out...');
  };

  const handleEditProfile = () => {
    // Navigate to profile editing
    console.log('Opening profile editor...');
  };

  const handleLiveChat = () => {
    // Implement live chat functionality
    const whatsappUrl = `https://wa.me/919876543210?text=Hello, I need help with the Rojgar Mela app.`;
    window.open(whatsappUrl, '_blank');
    console.log('Opening live chat...');
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
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <Button
                  key={themeOption}
                  variant={theme === themeOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(themeOption)}
                  className="text-xs"
                >
                  {texts[language].themes[themeOption]}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
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
                <Globe className="w-4 h-4 mr-2" />
                English
              </Button>
              <Button
                variant={language === 'hi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onLanguageChange('hi')}
                className="text-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                हिंदी
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Help */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-primary" />
            {texts[language].support}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start transition-all duration-200 hover:scale-[1.02]" 
            onClick={handleLiveChat}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            {texts[language].liveChat}
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-4">
          <Button 
            variant="destructive" 
            className="w-full transition-all duration-200 hover:scale-[1.02]"
            onClick={() => {
              if (confirm(language === 'en' ? 'Are you sure you want to log out?' : 'क्या आप वाकई लॉग आउट करना चाहते हैं?')) {
                handleLogout();
                // Clear localStorage
                localStorage.clear();
                // Redirect or show success message
                console.log('User logged out');
              }
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {texts[language].logout}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {texts[language].logoutDesc}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};