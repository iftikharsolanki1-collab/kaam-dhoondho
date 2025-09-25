import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Bell, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';

interface NotificationPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationPage = ({ language, onBack }: NotificationPageProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const texts = {
    en: {
      notifications: 'Notifications',
      noNotifications: 'No notifications yet',
      noNotificationsDesc: 'You\'ll see notifications here when you get them',
      markAllRead: 'Mark All Read',
      markAsRead: 'Mark as Read',
      newJob: 'New Job',
      message: 'Message',
      general: 'General',
      timeAgo: 'ago',
      justNow: 'Just now',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days'
    },
    hi: {
      notifications: 'सूचनाएं',
      noNotifications: 'अभी तक कोई सूचना नहीं',
      noNotificationsDesc: 'जब आपको सूचनाएं मिलेंगी तो आप उन्हें यहाँ देख सकेंगे',
      markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
      markAsRead: 'पढ़ा हुआ चिह्नित करें',
      newJob: 'नई नौकरी',
      message: 'संदेश',
      general: 'सामान्य',
      timeAgo: 'पहले',
      justNow: 'अभी-अभी',
      minute: 'मिनट',
      minutes: 'मिनट',
      hour: 'घंटा',
      hours: 'घंटे',
      day: 'दिन',
      days: 'दिन'
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: language === 'en' ? 'Error' : 'त्रुटि',
        description: language === 'en' ? 'Failed to load notifications' : 'सूचनाएं लोड करने में विफल',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: language === 'en' ? 'Success' : 'सफलता',
        description: language === 'en' ? 'All notifications marked as read' : 'सभी सूचनाएं पढ़ी गई के रूप में चिह्नित की गईं'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return texts[language].justNow;
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? texts[language].minute : texts[language].minutes} ${texts[language].timeAgo}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? texts[language].hour : texts[language].hours} ${texts[language].timeAgo}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? texts[language].day : texts[language].days} ${texts[language].timeAgo}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-accent" />;
      case 'job':
        return <Bell className="w-5 h-5 text-primary" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'message':
        return texts[language].message;
      case 'job':
        return texts[language].newJob;
      default:
        return texts[language].general;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{texts[language].notifications}</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{texts[language].notifications}</h1>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {texts[language].markAllRead}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{texts[language].noNotifications}</h3>
            <p className="text-muted-foreground">{texts[language].noNotificationsDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.is_read ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {getNotificationTypeText(notification.type)}
                        </Badge>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-2 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.created_at)}
                      </span>
                      
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          {texts[language].markAsRead}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};