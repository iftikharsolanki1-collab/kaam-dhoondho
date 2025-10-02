import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationCounts {
  chat: number;
  schemes: number;
  notifications: number;
}

export const useNotificationBadges = (userId: string | undefined) => {
  const [counts, setCounts] = useState<NotificationCounts>({
    chat: 0,
    schemes: 0,
    notifications: 0,
  });

  useEffect(() => {
    if (!userId) {
      setCounts({ chat: 0, schemes: 0, notifications: 0 });
      return;
    }

    // Load initial counts
    loadCounts();

    // Set up realtime subscriptions
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          loadUnreadMessages();
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUnreadNotifications();
        }
      )
      .subscribe();

    const schemesChannel = supabase
      .channel('schemes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'govt_schemes',
        },
        () => {
          loadNewSchemes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(schemesChannel);
    };
  }, [userId]);

  const loadCounts = async () => {
    await Promise.all([
      loadUnreadMessages(),
      loadUnreadNotifications(),
      loadNewSchemes(),
    ]);
  };

  const loadUnreadMessages = async () => {
    if (!userId) return;
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    setCounts((prev) => ({ ...prev, chat: count || 0 }));
  };

  const loadUnreadNotifications = async () => {
    if (!userId) return;
    
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setCounts((prev) => ({ ...prev, notifications: count || 0 }));
  };

  const loadNewSchemes = async () => {
    if (!userId) return;
    
    const { count } = await supabase
      .from('govt_schemes')
      .select('*', { count: 'exact', head: true })
      .eq('is_new', true);

    setCounts((prev) => ({ ...prev, schemes: count || 0 }));
  };

  const clearBadge = (type: keyof NotificationCounts) => {
    setCounts((prev) => ({ ...prev, [type]: 0 }));
  };

  return { counts, clearBadge, loadCounts };
};
