import { Home, User, MessageCircle, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const texts = {
    en: {
      home: 'Home',
      chat: 'Chat',
      profile: 'Profile',
      admin: 'Admin',
    },
    hi: {
      home: 'होम',
      chat: 'चैट',
      profile: 'प्रोफ़ाइल',
      admin: 'एडमिन',
    }
  };

  const getNotificationCount = (id: string): number => {
    if (!notificationCounts) return 0;
    if (id === 'chat') return notificationCounts.chat;
    return 0;
  };

  const navItems = [
    { id: 'home', icon: Home, label: texts[language].home },
    { id: 'chat', icon: MessageCircle, label: texts[language].chat },
    { id: 'profile', icon: User, label: texts[language].profile },
    ...(isAdmin ? [{ id: 'admin', icon: Shield, label: texts[language].admin }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const notificationCount = getNotificationCount(item.id);
          const hasNotification = notificationCount > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log('Bottom nav clicked:', item.id);
                onTabChange(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : ''}`} />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-urgent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9' : notificationCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
