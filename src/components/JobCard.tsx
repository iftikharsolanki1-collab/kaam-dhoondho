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
    // Save to localStorage for persistence
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (!isSaved) {
      savedJobs.push({ id, name, work, location, rate, details, photo, isUrgent, isVerified });
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    } else {
      const filteredJobs = savedJobs.filter((job: any) => job.id !== id);
      localStorage.setItem('savedJobs', JSON.stringify(filteredJobs));
    }
  };

  const handleCall = () => {
    // Extract phone number from details or use a mock number
    const phoneNumber = '9876543210'; // This would come from the job data in real app
    window.open(`tel:+91${phoneNumber}`, '_self');
    console.log('Calling...', id);
  };

  const handleChat = () => {
    // Open WhatsApp chat
    const phoneNumber = '9876543210'; // This would come from the job data in real app
    const message = `Hi ${name}, I'm interested in your ${work} services in ${location}.`;
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    console.log('Opening chat...', id);
  };

  const handleShare = () => {
    // Implement WhatsApp share
    const text = `${name} - ${work} in ${location}. Rate: ${rate}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-all duration-300 bg-gradient-card hover:scale-[1.02] animate-fade-in">
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
            className="flex-1 bg-primary hover:bg-primary-dark transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            {texts[language].chat}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCall}
            className="flex-1 transition-all duration-200 hover:scale-105"
          >
            <Phone className="w-4 h-4 mr-1" />
            {texts[language].call}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={`transition-all duration-200 hover:scale-105 ${isSaved ? 'bg-secondary text-secondary-foreground' : ''}`}
          >
            <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="text-green-600 border-green-200 hover:bg-green-50 transition-all duration-200 hover:scale-105"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};