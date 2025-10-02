import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, FileText, TrendingUp, User, Settings, MessageCircle } from 'lucide-react';

interface NotificationCounts {
  chat: number;
  schemes: number;
  notifications: number;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: 'en' | 'hi';
  notificationCounts?: NotificationCounts;
}

export const BottomNavigation = ({ activeTab, onTabChange, language, notificationCounts }: BottomNavigationProps) => {
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

  const getNotificationCount = (id: string): number => {
    if (!notificationCounts) return 0;
    if (id === 'chat') return notificationCounts.chat;
    if (id === 'schemes') return notificationCounts.schemes;
    return 0;
  };

  const navItems = [
    { id: 'home', icon: Home, label: texts[language].home },
    { id: 'schemes', icon: FileText, label: texts[language].schemes },
    { id: 'chat', icon: MessageCircle, label: texts[language].chat },
    { id: 'trending', icon: TrendingUp, label: texts[language].trending },
    { id: 'profile', icon: User, label: texts[language].profile },
    { id: 'settings', icon: Settings, label: texts[language].settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 animate-slide-up">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const notificationCount = getNotificationCount(item.id);
          const hasNotification = notificationCount > 0;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Bottom nav clicked:', item.id);
                onTabChange(item.id);
              }}
              className={`flex flex-col items-center py-2 px-3 h-auto min-w-0 relative transition-all duration-300 hover:scale-110 ${
                isActive 
                  ? 'text-primary bg-primary/5 transform scale-110' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 transition-all duration-200 ${isActive ? 'text-primary animate-bounce-gentle' : ''}`} />
                {hasNotification && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] p-0 flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
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