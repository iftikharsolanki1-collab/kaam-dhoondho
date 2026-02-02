import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Users, Banknote, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GovernmentSchemesProps {
  language: 'en' | 'hi';
}

interface Scheme {
  id: string;
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  eligibility: string | null;
  eligibility_hi: string | null;
  benefits: string | null;
  benefits_hi: string | null;
  link: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string;
}

export const GovernmentSchemes = ({ language }: GovernmentSchemesProps) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const texts = {
    en: {
      title: 'Government Schemes',
      subtitle: 'Schemes for workers and entrepreneurs',
      viewDetails: 'View Details',
      newScheme: 'New',
      noSchemes: 'No schemes available',
      noSchemesDesc: 'Check back later for new government schemes',
      categories: {
        employment: 'Employment',
        skill: 'Skill Development',
        loan: 'Financial Aid',
        default: 'General'
      }
    },
    hi: {
      title: 'सरकारी योजनाएं',
      subtitle: 'कारीगरों और उद्यमियों के लिए योजनाएं',
      viewDetails: 'विवरण देखें',
      newScheme: 'नई',
      noSchemes: 'कोई योजना उपलब्ध नहीं',
      noSchemesDesc: 'नई सरकारी योजनाओं के लिए बाद में जांचें',
      categories: {
        employment: 'रोजगार',
        skill: 'कौशल विकास',
        loan: 'वित्तीय सहायता',
        default: 'सामान्य'
      }
    }
  };

  useEffect(() => {
    loadSchemes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('govt-schemes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'govt_schemes'
        },
        () => {
          loadSchemes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('govt_schemes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error loading schemes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'employment':
        return <Users className="w-4 h-4" />;
      case 'skill':
        return <FileText className="w-4 h-4" />;
      case 'loan':
        return <Banknote className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'employment':
        return 'bg-primary/10 text-primary';
      case 'skill':
        return 'bg-secondary/10 text-secondary';
      case 'loan':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryText = (category: string | null) => {
    const cat = category?.toLowerCase() as keyof typeof texts.en.categories;
    return texts[language].categories[cat] || texts[language].categories.default;
  };

  const isNewScheme = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Consider schemes less than 7 days old as "new"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {texts[language].title}
        </h2>
        <p className="text-muted-foreground">
          {texts[language].subtitle}
        </p>
      </div>

      {schemes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{texts[language].noSchemes}</h3>
            <p className="text-muted-foreground">{texts[language].noSchemesDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="shadow-card hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getCategoryIcon(scheme.category)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm">
                        {language === 'hi' && scheme.title_hi ? scheme.title_hi : scheme.title}
                      </h3>
                      {isNewScheme(scheme.created_at) && (
                        <Badge variant="secondary" className="bg-urgent text-urgent-foreground text-xs ml-2">
                          {texts[language].newScheme}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {language === 'hi' && scheme.description_hi ? scheme.description_hi : scheme.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(scheme.category)}`}>
                        {getCategoryIcon(scheme.category)}
                        <span className="ml-1">{getCategoryText(scheme.category)}</span>
                      </Badge>
                      
                      {scheme.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(scheme.link!, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {texts[language].viewDetails}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
