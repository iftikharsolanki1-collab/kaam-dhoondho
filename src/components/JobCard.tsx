import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, CheckCircle, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JobCardProps {
  id: string;
  name: string;
  work: string;
  location: string;
  rate?: string;
  details: string;
  photo?: string;
  isUrgent?: boolean;
  isVerified?: boolean;
  language: 'en' | 'hi';
  userId?: string;
  phone?: string;
  postType?: 'giver' | 'seeker';
  onChatClick?: (userId: string, name: string) => void;
  onCardClick?: () => void;
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
  userId,
  phone,
  postType,
  onChatClick,
  onCardClick
}: JobCardProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const texts = {
    en: {
      urgent: 'Urgent',
      verified: 'Verified',
      chat: 'Chat',
      jobGiver: 'Job Giver',
      jobSeeker: 'Job Seeker',
    },
    hi: {
      urgent: 'तुरंत',
      verified: 'सत्यापित',
      chat: 'चैट',
      jobGiver: 'काम देने वाले',
      jobSeeker: 'काम करने वाले',
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
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

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <Card 
      className="shadow-card hover:shadow-lg transition-all duration-300 bg-gradient-card hover:scale-[1.02] animate-fade-in cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            {postType && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {postType === 'giver' ? texts[language].jobGiver : texts[language].jobSeeker}
              </Badge>
            )}
            {isUrgent && (
              <Badge variant="destructive" className="bg-urgent text-urgent-foreground">
                🔴 {texts[language].urgent}
              </Badge>
            )}
            {isVerified && (
              <Badge variant="secondary" className="bg-verified text-verified-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                {texts[language].verified}
              </Badge>
            )}
          </div>
        </div>

        {/* Profile section */}
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-primary font-medium text-sm">{work}</p>
            <p className="text-muted-foreground text-sm mt-1 truncate">{location}</p>
          </div>
        </div>

        {/* Details */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {details}
        </p>

        {/* Chat button only */}
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleChat} 
          className="w-full bg-primary hover:bg-primary-dark transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {texts[language].chat}
        </Button>
      </CardContent>
    </Card>
  );
};
