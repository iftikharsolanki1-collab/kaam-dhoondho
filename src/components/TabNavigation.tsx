import { Button } from '@/components/ui/button';
import { Users, Briefcase } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'employers' | 'workers';
  onTabChange: (tab: 'employers' | 'workers') => void;
  language: 'en' | 'hi';
}

export const TabNavigation = ({ activeTab, onTabChange, language }: TabNavigationProps) => {
  const texts = {
    en: {
      employers: 'Job Givers',
      employersDesc: 'काम देने वाले',
      workers: 'Job Seekers', 
      workersDesc: 'काम करने वाले'
    },
    hi: {
      employers: 'काम देने वाले',
      employersDesc: 'Job Givers',
      workers: 'काम करने वाले',
      workersDesc: 'Job Seekers'
    }
  };

  return (
    <div className="bg-background border-b border-border sticky top-20 z-40">
      <div className="container mx-auto px-4 py-2">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'employers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('employers')}
            className={`flex-1 flex flex-col items-center py-3 h-auto ${
              activeTab === 'employers' 
                ? 'shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-1" />
            <span className="font-medium text-sm">{texts[language].employers}</span>
            <span className="text-xs opacity-70">{texts[language].employersDesc}</span>
          </Button>
          
          <Button
            variant={activeTab === 'workers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('workers')}
            className={`flex-1 flex flex-col items-center py-3 h-auto ${
              activeTab === 'workers' 
                ? 'shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="font-medium text-sm">{texts[language].workers}</span>
            <span className="text-xs opacity-70">{texts[language].workersDesc}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};