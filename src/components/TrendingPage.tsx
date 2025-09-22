import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Edit, Play, Crown } from 'lucide-react';

interface TrendingPageProps {
  language: 'en' | 'hi';
}

export const TrendingPage = ({ language }: TrendingPageProps) => {
  const [downloads, setDownloads] = useState(2); // Free downloads left

  const texts = {
    en: {
      title: 'Trending Cards',
      subtitle: 'Customize and download professional cards',
      tabs: {
        status: 'Status Cards',
        business: 'Business Cards',
        gift: 'Gift Cards',
        wedding: 'Wedding Cards'
      },
      customize: 'Customize',
      download: 'Download',
      premium: 'Premium',
      freeLeft: 'free downloads left',
      watchAd: 'Watch Ad to Download',
      upgradePremium: 'Upgrade to Premium',
      weeklyPrice: '₹10/week'
    },
    hi: {
      title: 'ट्रेंडिंग कार्ड',
      subtitle: 'पेशेवर कार्ड कस्टमाइज़ और डाउनलोड करें',
      tabs: {
        status: 'स्टेटस कार्ड',
        business: 'बिज़नेस कार्ड',
        gift: 'गिफ्ट कार्ड',
        wedding: 'शादी के कार्ड'
      },
      customize: 'कस्टमाइज़ करें',
      download: 'डाउनलोड',
      premium: 'प्रीमियम',
      freeLeft: 'फ्री डाउनलोड बचे हैं',
      watchAd: 'डाउनलोड के लिए विज्ञापन देखें',
      upgradePremium: 'प्रीमियम में अपग्रेड करें',
      weeklyPrice: '₹10/सप्ताह'
    }
  };

  const cardTemplates = {
    status: [
      {
        id: 'status-1',
        title: 'Motivational Quote',
        preview: '✨ "Success is not final, failure is not fatal..." ✨',
        isPremium: false
      },
      {
        id: 'status-2', 
        title: 'Festival Wishes',
        preview: '🎉 Happy Diwali! May your life be filled with light... 🪔',
        isPremium: true
      },
      {
        id: 'status-3',
        title: 'Good Morning',
        preview: '🌅 Good Morning! Have a wonderful day ahead... ☀️',
        isPremium: false
      }
    ],
    business: [
      {
        id: 'business-1',
        title: 'Professional Card',
        preview: '📱 Rajesh Kumar | Plumber | +91 98765... 🔧',
        isPremium: false
      },
      {
        id: 'business-2',
        title: 'Service Provider',
        preview: '🏠 Expert Home Services | Call Now... 🛠️',
        isPremium: true
      },
      {
        id: 'business-3',
        title: 'Contact Card',
        preview: '📞 24/7 Available | Quality Work Guaranteed... ✅',
        isPremium: true
      }
    ],
    gift: [
      {
        id: 'gift-1',
        title: 'Birthday Wishes',
        preview: '🎂 Happy Birthday! Wishing you joy and happiness... 🎈',
        isPremium: false
      },
      {
        id: 'gift-2',
        title: 'Anniversary Card',
        preview: '💐 Happy Anniversary! Celebrating your love... 💕',
        isPremium: true
      }
    ],
    wedding: [
      {
        id: 'wedding-1',
        title: 'Wedding Invitation',
        preview: '💒 You are cordially invited to our wedding... 👫',
        isPremium: true
      },
      {
        id: 'wedding-2',
        title: 'Save the Date',
        preview: '📅 Save the Date | Raj & Priya | 15th March... 💑',
        isPremium: true
      }
    ]
  };

  const handleCustomize = (cardId: string) => {
    console.log('Customizing:', cardId);
    // Here you would open a customization modal/page
  };

  const handleDownload = (cardId: string, isPremium: boolean) => {
    if (isPremium) {
      // Show premium upgrade modal
      console.log('Premium required for:', cardId);
      return;
    }

    if (downloads > 0) {
      setDownloads(prev => prev - 1);
      console.log('Downloaded:', cardId);
      // Simulate download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Sample Card Content';
      link.download = `card-${cardId}.txt`;
      link.click();
    } else {
      // Show watch ad modal
      console.log('Watch ad to download:', cardId);
    }
  };

  const renderCardTemplate = (card: any) => (
    <Card key={card.id} className="shadow-card hover:shadow-lg transition-all duration-300 bg-gradient-card animate-fade-in hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="relative">
          {card.isPremium && (
            <Badge 
              variant="secondary" 
              className="absolute top-0 right-0 bg-warning text-warning-foreground"
            >
              <Crown className="w-3 h-3 mr-1" />
              {texts[language].premium}
            </Badge>
          )}
          
          <div className="bg-gradient-card rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              {card.preview}
            </p>
          </div>
          
          <h3 className="font-semibold text-foreground mb-3">
            {card.title}
          </h3>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 transition-all duration-200 hover:scale-105"
              onClick={() => handleCustomize(card.id)}
            >
              <Edit className="w-4 h-4 mr-1" />
              {texts[language].customize}
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 transition-all duration-200 hover:scale-105"
              onClick={() => handleDownload(card.id, card.isPremium)}
            >
              <Download className="w-4 h-4 mr-1" />
              {texts[language].download}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {texts[language].title}
        </h2>
        <p className="text-muted-foreground mb-4">
          {texts[language].subtitle}
        </p>
        
        {/* Download Counter */}
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="bg-secondary/10 text-secondary">
            {downloads} {texts[language].freeLeft}
          </Badge>
          
          <Button variant="outline" size="sm">
            <Crown className="w-4 h-4 mr-1" />
            {texts[language].upgradePremium} - {texts[language].weeklyPrice}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="text-xs">
            {texts[language].tabs.status}
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs">
            {texts[language].tabs.business}
          </TabsTrigger>
          <TabsTrigger value="gift" className="text-xs">
            {texts[language].tabs.gift}
          </TabsTrigger>
          <TabsTrigger value="wedding" className="text-xs">
            {texts[language].tabs.wedding}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {cardTemplates.status.map(renderCardTemplate)}
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {cardTemplates.business.map(renderCardTemplate)}
          </div>
        </TabsContent>

        <TabsContent value="gift" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {cardTemplates.gift.map(renderCardTemplate)}
          </div>
        </TabsContent>

        <TabsContent value="wedding" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {cardTemplates.wedding.map(renderCardTemplate)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Watch Ad Modal Placeholder */}
      {downloads === 0 && (
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-6 text-center">
            <Play className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {texts[language].watchAd}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === 'en' 
                ? 'Watch a short ad to get free downloads' 
                : 'फ्री डाउनलोड के लिए एक छोटा विज्ञापन देखें'}
            </p>
            <Button variant="default" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Watch Ad' : 'विज्ञापन देखें'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};