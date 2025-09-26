import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecureJobCardProps {
  post: {
    id: string;
    title?: string;
    name: string;
    skill_id?: number;
    description: string;
    location: string;
    rate?: string;
    phone: string;
    type: string;
    created_at: string;
    user_id: string;
  };
  currentUserId?: string;
  language: 'en' | 'hi';
  onContactClick?: (postId: string, postUserId: string) => void;
}

export const SecureJobCard = ({ post, currentUserId, language, onContactClick }: SecureJobCardProps) => {
  const { toast } = useToast();
  const isOwnPost = currentUserId === post.user_id;

  const texts = {
    en: {
      contact: 'Contact',
      message: 'Message',
      phoneHidden: 'Phone number hidden - contact through app',
      posted: 'Posted'
    },
    hi: {
      contact: 'संपर्क करें',
      message: 'संदेश',
      phoneHidden: 'फोन नंबर छुपा है - ऐप के माध्यम से संपर्क करें',
      posted: 'पोस्ट किया गया'
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.substring(0, 3) + '****' + phone.slice(-2);
  };

  const handleContactClick = async () => {
    if (!currentUserId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to contact this person',
        variant: 'destructive'
      });
      return;
    }

    if (onContactClick) {
      onContactClick(post.id, post.user_id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{post.title || post.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {post.type}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-3 line-clamp-2">
          {post.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{post.location}</span>
          </div>
          
          {post.rate && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>₹{post.rate}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{texts[language].posted}: {formatDate(post.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>
              {isOwnPost || currentUserId ? post.phone : maskPhoneNumber(post.phone)}
            </span>
            {!isOwnPost && !currentUserId && (
              <span className="text-xs text-orange-600">
                {texts[language].phoneHidden}
              </span>
            )}
          </div>
        </div>
        
        {!isOwnPost && (
          <Button 
            onClick={handleContactClick}
            className="w-full"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {texts[language].message}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};