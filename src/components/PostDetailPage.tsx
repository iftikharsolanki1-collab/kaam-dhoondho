import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Phone, MessageCircle, MapPin, CheckCircle, Clock, Briefcase, User } from 'lucide-react';

interface PostDetailPageProps {
  post: {
    id: string;
    userId?: string;
    name: string;
    work: string;
    location: string;
    rate?: string;
    details: string;
    photo?: string;
    isUrgent?: boolean;
    isVerified?: boolean;
    phone?: string;
    postType?: 'giver' | 'seeker';
    createdAt?: string;
  };
  language: 'en' | 'hi';
  onBack: () => void;
  onChatClick?: (userId: string, name: string) => void;
}

export const PostDetailPage = ({ post, language, onBack, onChatClick }: PostDetailPageProps) => {
  const texts = {
    en: {
      urgent: 'Urgent',
      verified: 'Verified',
      chat: 'Chat Now',
      call: 'Call Now',
      location: 'Location',
      workDetails: 'Work Details',
      contactPerson: 'Contact Person',
      postedBy: 'Posted by',
      jobGiver: 'Job Giver',
      jobSeeker: 'Job Seeker',
      back: 'Back',
    },
    hi: {
      urgent: 'तुरंत',
      verified: 'सत्यापित',
      chat: 'अभी चैट करें',
      call: 'अभी कॉल करें',
      location: 'स्थान',
      workDetails: 'काम का विवरण',
      contactPerson: 'संपर्क व्यक्ति',
      postedBy: 'द्वारा पोस्ट किया गया',
      jobGiver: 'काम देने वाले',
      jobSeeker: 'काम करने वाले',
      back: 'वापस',
    }
  };

  const handleCall = () => {
    if (post.phone) {
      window.open(`tel:+91${post.phone}`, '_self');
    }
  };

  const handleChat = () => {
    if (post.userId && onChatClick) {
      onChatClick(post.userId, post.name);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {texts[language].back}
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.postType && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {post.postType === 'giver' ? texts[language].jobGiver : texts[language].jobSeeker}
                </Badge>
              )}
              {post.isUrgent && (
                <Badge variant="destructive" className="bg-urgent text-urgent-foreground">
                  🔴 {texts[language].urgent}
                </Badge>
              )}
              {post.isVerified && (
                <Badge variant="secondary" className="bg-verified text-verified-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {texts[language].verified}
                </Badge>
              )}
            </div>

            {/* Title */}
            <CardTitle className="text-xl text-primary">{post.work}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Person */}
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <Avatar className="w-14 h-14">
                <AvatarImage src={post.photo} alt={post.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {post.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">{texts[language].contactPerson}</p>
                <h3 className="font-semibold text-lg text-foreground">{post.name}</h3>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{texts[language].location}</p>
                <p className="font-medium text-foreground">{post.location}</p>
              </div>
            </div>

            {/* Work Details */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" />
                {texts[language].workDetails}
              </h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {post.details}
              </p>
            </div>

            {/* Photo */}
            {post.photo && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={post.photo} 
                  alt="Post" 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="default" 
                onClick={handleChat}
                className="flex-1 bg-primary hover:bg-primary-dark"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {texts[language].chat}
              </Button>
              
              {post.phone && (
                <Button 
                  variant="secondary" 
                  onClick={handleCall}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {texts[language].call}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
