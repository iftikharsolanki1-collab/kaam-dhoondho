import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const skills = [
  { en: 'All', hi: 'सभी', icon: '🔧' },
  { en: 'Plumber', hi: 'प्लंबर', icon: '🔧' },
  { en: 'Mason', hi: 'मिस्त्री', icon: '🧱' },
  { en: 'Painter', hi: 'रंगाई', icon: '🎨' },
  { en: 'Electrician', hi: 'इलेक्ट्रीशियन', icon: '⚡' },
  { en: 'Driver', hi: 'ड्राइवर', icon: '🚗' },
  { en: 'Helper', hi: 'हेल्पर', icon: '👤' },
  { en: 'Carpenter', hi: 'बढ़ई', icon: '🔨' },
  { en: 'Welder', hi: 'वेल्डर', icon: '🔥' },
  { en: 'Cook', hi: 'हलवाई', icon: '👨‍🍳' },
];

interface SkillChipsProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  onSkillSelect: (skill: string) => void;
}

export const SkillChips = ({ language, selectedSkill, onSkillSelect }: SkillChipsProps) => {
  return (
    <div className="py-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max gap-2.5 px-3">
          {skills.map((skill) => (
            <button
              key={skill.en}
              onClick={() => onSkillSelect(skill.en)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSkill === skill.en
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {skill[language]}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};