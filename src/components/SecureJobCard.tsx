import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Phone, MessageSquare } from 'lucide-react';
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
      call: 'Call',
      posted: 'Posted'
    },
    hi: {
      contact: 'संपर्क करें',
      message: 'संदेश',
      call: 'कॉल करें',
      posted: 'पोस्ट किया गया'
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.phone) {
      window.open(`tel:+91${post.phone}`, '_self');
    }
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
          
        </div>
        
        {!isOwnPost && (
          <div className="flex gap-2">
            <Button 
              onClick={handleContactClick}
              className="flex-1"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {texts[language].message}
            </Button>
            {post.phone && (
              <Button 
                onClick={handleCall}
                variant="secondary"
                size="sm"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};