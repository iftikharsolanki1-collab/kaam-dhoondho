import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Bell, User } from 'lucide-react';

export const Header = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
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
            <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center shadow-sm">
              <span className="text-primary font-bold text-lg">र</span>
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
              onClick={toggleLanguage}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'हिंदी' : 'Eng'}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10 relative"
            >
              <Bell className="w-5 h-5" />
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-urgent text-urgent-foreground"
              >
                3
              </Badge>
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};