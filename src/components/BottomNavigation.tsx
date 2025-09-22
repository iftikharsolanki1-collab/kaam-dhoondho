import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, FileText, TrendingUp, User, Settings, MessageCircle } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: 'en' | 'hi';
}

export const BottomNavigation = ({ activeTab, onTabChange, language }: BottomNavigationProps) => {
  const texts = {
    en: {
      home: 'Home',
      schemes: 'Schemes',
      chat: 'Chat',
      trending: 'Trending', 
      profile: 'Profile',
      settings: 'Settings'
    },
    hi: {
      home: 'होम',
      schemes: 'योजनाएं',
      chat: 'चैट',
      trending: 'ट्रेंडिंग',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स'
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: texts[language].home, hasNotification: false },
    { id: 'schemes', icon: FileText, label: texts[language].schemes, hasNotification: true },
    { id: 'chat', icon: MessageCircle, label: texts[language].chat, hasNotification: true },
    { id: 'trending', icon: TrendingUp, label: texts[language].trending, hasNotification: false },
    { id: 'profile', icon: User, label: texts[language].profile, hasNotification: false },
    { id: 'settings', icon: Settings, label: texts[language].settings, hasNotification: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 animate-slide-up">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 h-auto min-w-0 relative transition-all duration-300 hover:scale-110 ${
                isActive 
                  ? 'text-primary bg-primary/5 transform scale-110' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 transition-all duration-200 ${isActive ? 'text-primary animate-bounce-gentle' : ''}`} />
                {item.hasNotification && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 w-4 h-4 p-0 text-xs bg-urgent text-urgent-foreground animate-pulse"
                  >
                    •
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium truncate transition-all duration-200 ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};