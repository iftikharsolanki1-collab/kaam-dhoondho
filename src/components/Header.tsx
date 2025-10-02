import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Bell, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoImage from '@/assets/rojgar-mela-logo.png';

interface HeaderProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onProfileClick: () => void;
  onNotificationClick: () => void;
}

export const Header = ({ language, onLanguageChange, onProfileClick, onNotificationClick }: HeaderProps) => {
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
    toast({
      title: language === 'en' ? 'Notifications' : 'सूचनाएं',
      description: language === 'en' ? 'You have 3 new notifications' : 'आपके पास 3 नई सूचनाएं हैं',
    });
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
      profile: 'Profile'
    },
    hi: {
      title: 'रोजगार मेला',
      subtitle: 'स्थानीय सेवाओं के लिए डिजिटल बाज़ार',
      notifications: 'सूचनाएं',
      profile: 'प्रोफ़ाइल'
    }
  };

  return (
    <header className="bg-gradient-hero shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center shadow-sm overflow-hidden">
              <img 
                src={logoImage} 
                alt="Rojgar Mela Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-primary-foreground font-bold text-xl">
                {texts[language].title}
              </h1>
              <p className="text-primary-foreground/80 text-xs">
                {texts[language].subtitle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLanguageToggle}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-200 hover:scale-110 font-semibold shadow-sm bg-primary-foreground/10"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="text-sm">{language === 'en' ? 'हिंदी' : 'English'}</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="text-primary-foreground hover:bg-primary-foreground/10 relative transition-all duration-200 hover:scale-105"
            >
              <Bell className="w-5 h-5" />
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-urgent text-urgent-foreground animate-pulse"
              >
                3
              </Badge>
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200 hover:scale-105"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};