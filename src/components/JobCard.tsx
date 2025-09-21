import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Phone, MessageCircle, Bookmark, Share, CheckCircle } from 'lucide-react';

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
  language 
}: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCall = () => {
    // Implement call functionality
    console.log('Calling...', id);
  };

  const handleChat = () => {
    // Implement chat functionality
    console.log('Opening chat...', id);
  };

  const handleShare = () => {
    // Implement WhatsApp share
    const text = `${name} - ${work} in ${location}. Rate: ${rate}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-card hover:shadow-md transition-all duration-200 bg-gradient-card">
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
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
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-primary font-medium text-sm">{work}</p>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{location}</span>
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
          <Button
            variant="default"
            size="sm"
            onClick={handleChat}
            className="flex-1 bg-primary hover:bg-primary-dark"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            {texts[language].chat}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCall}
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-1" />
            {texts[language].call}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={`${isSaved ? 'bg-secondary text-secondary-foreground' : ''}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};