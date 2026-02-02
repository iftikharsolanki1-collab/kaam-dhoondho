import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationParams {
  recipientId: string;
  title: string;
  message: string;
  type?: 'job' | 'message' | 'general';
  relatedId?: string;
}

export const useNotifications = () => {
  const { toast } = useToast();

  const sendNotification = async ({
    recipientId,
    title,
    message,
    type = 'general',
    relatedId
  }: SendNotificationParams) => {
    try {
      const { error } = await supabase.rpc('send_notification', {
        recipient_id: recipientId,
        notif_title: title,
        notif_message: message,
        notif_type: type,
        notif_related_id: relatedId
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  };

  return { sendNotification };
};

export default useNotifications;
