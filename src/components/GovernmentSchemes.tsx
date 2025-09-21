import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Users, Banknote } from 'lucide-react';

interface GovernmentSchemesProps {
  language: 'en' | 'hi';
}

export const GovernmentSchemes = ({ language }: GovernmentSchemesProps) => {
  const texts = {
    en: {
      title: 'Government Schemes',
      subtitle: 'Schemes for workers and entrepreneurs',
      viewDetails: 'View Details',
      newScheme: 'New',
      categories: {
        employment: 'Employment',
        skill: 'Skill Development',
        loan: 'Financial Aid'
      }
    },
    hi: {
      title: 'सरकारी योजनाएं',
      subtitle: 'कारीगरों और उद्यमियों के लिए योजनाएं',
      viewDetails: 'विवरण देखें',
      newScheme: 'नई',
      categories: {
        employment: 'रोजगार',
        skill: 'कौशल विकास',
        loan: 'वित्तीय सहायता'
      }
    }
  };

  const schemes = [
    {
      id: '1',
      name: {
        en: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        hi: 'प्रधानमंत्री कौशल विकास योजना (PMKVY)'
      },
      description: {
        en: 'Skill development training program with certification and monetary rewards.',
        hi: 'प्रमाणन और मौद्रिक पुरस्कारों के साथ कौशल विकास प्रशिक्षण कार्यक्रम।'
      },
      category: 'skill',
      url: 'https://www.pmkvyofficial.org/',
      isNew: false,
      icon: FileText
    },
    {
      id: '2',
      name: {
        en: 'Mudra Yojana',
        hi: 'मुद्रा योजना'
      },
      description: {
        en: 'Micro-finance scheme providing loans up to ₹10 lakhs for small businesses.',
        hi: 'छोटे व्यवसायों के लिए ₹10 लाख तक के लोन प्रदान करने वाली माइक्रो-फाइनेंस योजना।'
      },
      category: 'loan',
      url: 'https://www.mudra.org.in/',
      isNew: false,
      icon: Banknote
    },
    {
      id: '3',
      name: {
        en: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
        hi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA)'
      },
      description: {
        en: '100 days guaranteed employment for rural households.',
        hi: 'ग्रामीण परिवारों के लिए 100 दिन का गारंटीशुदा रोजगार।'
      },
      category: 'employment',
      url: 'https://nrega.nic.in/',
      isNew: false,
      icon: Users
    },
    {
      id: '4',
      name: {
        en: 'Stand Up India',
        hi: 'स्टैंड अप इंडिया'
      },
      description: {
        en: 'Bank loans for SC/ST and women entrepreneurs to start greenfield enterprises.',
        hi: 'नए उद्यम शुरू करने के लिए SC/ST और महिला उद्यमियों के लिए बैंक लोन।'
      },
      category: 'loan',
      url: 'https://www.standupmitra.in/',
      isNew: true,
      icon: Banknote
    },
    {
      id: '5',
      name: {
        en: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
        hi: 'दीन दयाल उपाध्याय ग्रामीण कौशल्या योजना (DDU-GKY)'
      },
      description: {
        en: 'Rural skill development program with placement guarantee.',
        hi: 'प्लेसमेंट गारंटी के साथ ग्रामीण कौशल विकास कार्यक्रम।'
      },
      category: 'skill',
      url: 'https://ddugky.gov.in/',
      isNew: true,
      icon: FileText
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
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

      <div className="space-y-4">
        {schemes.map((scheme) => {
          const Icon = scheme.icon;
          return (
            <Card key={scheme.id} className="shadow-card hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm">
                        {scheme.name[language]}
                      </h3>
                      {scheme.isNew && (
                        <Badge variant="secondary" className="bg-urgent text-urgent-foreground text-xs ml-2">
                          {texts[language].newScheme}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {scheme.description[language]}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(scheme.category)}`}>
                        {getCategoryIcon(scheme.category)}
                        <span className="ml-1">{texts[language].categories[scheme.category as keyof typeof texts[typeof language]['categories']]}</span>
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(scheme.url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {texts[language].viewDetails}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};