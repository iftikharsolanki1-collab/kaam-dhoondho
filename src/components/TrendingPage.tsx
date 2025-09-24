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
  const texts = {
    en: {
      title: 'Trending Cards',
      comingSoon: 'Coming Soon',
      description: 'This feature is under development and will be available soon.'
    },
    hi: {
      title: 'ट्रेंडिंग कार्ड',
      comingSoon: 'जल्द आ रहा है',
      description: 'यह सुविधा विकसित की जा रही है और जल्द ही उपलब्ध होगी।'
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          {texts[language].title}
        </h2>
        
        <div className="text-6xl animate-bounce">
          🚀
        </div>
        
        <h3 className="text-xl font-semibold text-primary">
          {texts[language].comingSoon}
        </h3>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {texts[language].description}
        </p>
      </div>
    </div>
  );
};