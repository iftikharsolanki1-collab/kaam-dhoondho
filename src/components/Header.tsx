import { Button } from '@/components/ui/button';
import { Globe, Bell, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoImage from '@/assets/rojgar-mela-logo-new.png';

interface HeaderProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onProfileClick: () => void;
  onNotificationClick: () => void;
  notificationCount?: number;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export const Header = ({ language, onLanguageChange, onProfileClick, onNotificationClick, notificationCount = 0, isLoggedIn = false, onLoginClick }: HeaderProps) => {
  const { toast } = useToast();

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    onLanguageChange(newLang);
    toast({
      title: language === 'en' ? 'Language Changed' : 'भाषा बदली गई',
      description: language === 'en' ? 'Switched to Hindi' : 'अंग्रेजी में बदला गया',
    });
  };

  const handleNotificationClick = () => {
    onNotificationClick();
  };

  const handleProfileClick = () => {
    onProfileClick();
    toast({
      title: language === 'en' ? 'Profile' : 'प्रोफ़ाइल',
      description: language === 'en' ? 'Opening your profile' : 'आपकी प्रोफ़ाइल खोली जा रही है',
    });
  };

  const texts = {
    en: {
      title: 'Rojgar Mela',
      subtitle: 'Digital Marketplace for Local Services',
      notifications: 'Notifications',
      profile: 'Profile',
      login: 'Login'
    },
    hi: {
      title: 'रोजगार मेला',
      subtitle: 'स्थानीय सेवाओं के लिए डिजिटल बाज़ार',
      notifications: 'सूचनाएं',
      profile: 'प्रोफ़ाइल',
      login: 'लॉगिन'
    }
  };

  return (
    <header className="bg-gradient-hero shadow-lg sticky top-0 z-50 border-b border-primary-dark/20">
      <div className="max-w-screen-xl mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-md overflow-hidden">
              <img 
                src={logoImage} 
                alt="रोज़गार मेला" 
                className="w-9 h-9 object-contain"
              />
            </div>
            <h1 className="text-secondary font-bold text-lg tracking-tight">
              रोज़गार मेला
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Language Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageToggle}
              className="text-secondary hover:bg-secondary/10 transition-all w-9 h-9"
            >
              <Globe className="w-5 h-5" />
            </Button>

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationClick}
                  className="text-secondary hover:bg-secondary/10 relative transition-all w-9 h-9"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-urgent text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? '9' : notificationCount}
                    </span>
                  )}
                </Button>

                {/* Profile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleProfileClick}
                  className="text-secondary hover:bg-secondary/10 transition-all w-9 h-9"
                >
                  <User className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLoginClick}
                className="text-secondary hover:bg-secondary/10 transition-all w-9 h-9"
              >
                <User className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};