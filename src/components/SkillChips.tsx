import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const skills = [
  { en: 'All', hi: 'सभी', icon: '🔧' },
  { en: 'Plumber', hi: 'प्लंबर', icon: '🔧' },
  { en: 'Electrician', hi: 'इलेक्ट्रीशियन', icon: '⚡' },
  { en: 'Mason', hi: 'राजमिस्त्री', icon: '🧱' },
  { en: 'Carpenter', hi: 'बढ़ई', icon: '🔨' },
  { en: 'Painter', hi: 'पेंटर', icon: '🎨' },
  { en: 'Cleaner', hi: 'सफाई कर्मी', icon: '🧹' },
  { en: 'Driver', hi: 'ड्राइवर', icon: '🚗' },
  { en: 'Cook', hi: 'रसोइया', icon: '👨‍🍳' },
  { en: 'Guard', hi: 'गार्ड', icon: '🛡️' },
  { en: 'Gardener', hi: 'माली', icon: '🌱' },
];

interface SkillChipsProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  onSkillSelect: (skill: string) => void;
}

export const SkillChips = ({ language, selectedSkill, onSkillSelect }: SkillChipsProps) => {
  return (
    <div className="py-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 px-4">
          {skills.map((skill) => (
            <Badge
              key={skill.en}
              variant={selectedSkill === skill.en ? "default" : "secondary"}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedSkill === skill.en
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => onSkillSelect(skill.en)}
            >
              <span className="mr-2">{skill.icon}</span>
              {skill[language]}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};