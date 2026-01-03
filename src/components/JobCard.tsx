import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Phone, MessageCircle, Bookmark, Share, CheckCircle } from 'lucide-react';
import { formatDistance } from '@/lib/location';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface JobCardProps {
  id: string;
  name: string;
  work: string;
  location: string;
  rate: string;
  details: string;
  photo?: string;
  isUrgent?: boolean;
  isVerified?: boolean;
  language: 'en' | 'hi';
  distance?: number | null;
  userId?: string;
  onChatClick?: (userId: string, name: string) => void;
}
export const JobCard = ({
  id,
  name,
  work,
  location,
  rate,
  details,
  photo,
  isUrgent,
  isVerified,
  language,
  distance,
  userId,
  onChatClick
}: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadCurrentUser();
    checkIfSaved();
  }, [id]);
  const loadCurrentUser = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };
  const checkIfSaved = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data
    } = await supabase.from('saved_posts').select('id').eq('user_id', user.id).eq('post_id', id).single();
    setIsSaved(!!data);
  };
  const texts = {
    en: {
      urgent: 'Urgent',
      verified: 'Verified',
      chat: 'Chat',
      call: 'Call',
      save: 'Save',
      share: 'Share'
    },
    hi: {
      urgent: 'तुरंत',
      verified: 'सत्यापित',
      chat: 'चैट',
      call: 'कॉल',
      save: 'सेव',
      share: 'शेयर'
    }
  };
  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक',
        description: language === 'en' ? 'Please login to save posts' : 'पोस्ट सेव करने के लिए कृपया लॉगिन करें',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (!isSaved) {
        const {
          error
        } = await supabase.from('saved_posts').insert({
          user_id: currentUser.id,
          post_id: id
        });
        if (error) throw error;
        setIsSaved(true);
        toast({
          title: language === 'en' ? 'Saved' : 'सेव किया गया',
          description: language === 'en' ? 'Post saved successfully' : 'पोस्ट सफलतापूर्वक सेव हो गई'
        });
      } else {
        const {
          error
        } = await supabase.from('saved_posts').delete().eq('user_id', currentUser.id).eq('post_id', id);
        if (error) throw error;
        setIsSaved(false);
        toast({
          title: language === 'en' ? 'Removed' : 'हटाया गया',
          description: language === 'en' ? 'Post removed from saved' : 'पोस्ट सेव से हटा दी गई'
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: language === 'en' ? 'Error' : 'त्रुटि',
        description: language === 'en' ? 'Failed to save post' : 'पोस्ट सेव करने में विफल',
        variant: 'destructive'
      });
    }
  };
  const handleCall = () => {
    // Extract phone number from details or use a mock number
    const phoneNumber = '9876543210'; // This would come from the job data in real app
    window.open(`tel:+91${phoneNumber}`, '_self');
    console.log('Calling...', id);
  };
  const handleChat = () => {
    if (!currentUser) {
      toast({
        title: language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक',
        description: language === 'en' ? 'Please login to chat' : 'चैट करने के लिए कृपया लॉगिन करें',
        variant: 'destructive'
      });
      return;
    }
    if (userId && onChatClick) {
      onChatClick(userId, name);
    } else {
      toast({
        title: language === 'en' ? 'Chat unavailable' : 'चैट उपलब्ध नहीं है',
        description: language === 'en' ? 'User information not available' : 'उपयोगकर्ता की जानकारी उपलब्ध नहीं है',
        variant: 'destructive'
      });
    }
  };
  const handleShare = () => {
    // Implement WhatsApp share
    const text = `${name} - ${work} in ${location}. Rate: ${rate}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };
  return <Card className="shadow-card hover:shadow-lg transition-all duration-300 bg-gradient-card hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            {isUrgent && <Badge variant="destructive" className="bg-urgent text-urgent-foreground">
                🔴 {texts[language].urgent}
              </Badge>}
            {isVerified && <Badge variant="secondary" className="bg-verified text-verified-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                {texts[language].verified}
              </Badge>}
          </div>
        </div>

        {/* Profile section */}
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-primary font-medium text-sm">{work}</p>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{location}</span>
              {distance && <>
                  <span className="mx-1">•</span>
                  <span className="text-primary font-medium">
                    {formatDistance(distance, language)}
                  </span>
                </>}
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-primary text-lg">{rate}</p>
          </div>
        </div>

        {/* Details */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {details}
        </p>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button variant="default" size="sm" onClick={handleChat} className="flex-1 bg-primary hover:bg-primary-dark transition-all duration-200 hover:scale-105">
            <MessageCircle className="w-4 h-4 mr-1" />
            {texts[language].chat}
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleCall} className="flex-1 transition-all duration-200 hover:scale-105">
            <Phone className="w-4 h-4 mr-1" />
            {texts[language].call}
          </Button>
          
          
          
          
        </div>
      </CardContent>
    </Card>;
};