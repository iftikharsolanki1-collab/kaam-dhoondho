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
  { en: 'Cook', hi: 'रसोइया', icon: '👨‍🍳' },
  { en: 'Mechanic', hi: 'मैकेनिक', icon: '🔧' },
  { en: 'Tailor', hi: 'दर्जी', icon: '✂️' },
  { en: 'Gardener', hi: 'माली', icon: '🌱' },
  { en: 'Cleaner', hi: 'सफाईकर्मी', icon: '🧹' },
  { en: 'Security Guard', hi: 'सुरक्षा गार्ड', icon: '🛡️' },
  { en: 'Delivery', hi: 'डिलीवरी', icon: '📦' },
  { en: 'AC Technician', hi: 'एसी तकनीशियन', icon: '❄️' },
  { en: 'Beautician', hi: 'ब्यूटीशियन', icon: '💄' },
  { en: 'Barber', hi: 'नाई', icon: '💇' },
  { en: 'Laundry', hi: 'धोबी', icon: '🧺' },
  { en: 'Tutor', hi: 'ट्यूटर', icon: '📚' },
  { en: 'Nurse', hi: 'नर्स', icon: '⚕️' },
  { en: 'Caretaker', hi: 'देखभालकर्ता', icon: '👴' },
  { en: 'Construction', hi: 'निर्माण', icon: '🏗️' },
  { en: 'Tiles Work', hi: 'टाइल्स', icon: '🧩' },
  { en: 'Furniture', hi: 'फर्नीचर', icon: '🪑' },
  { en: 'Pest Control', hi: 'कीट नियंत्रण', icon: '🐛' },
  { en: 'Packers & Movers', hi: 'पैकर्स मूवर्स', icon: '📦' },
  { en: 'Event Staff', hi: 'इवेंट स्टाफ', icon: '🎉' },
  { en: 'Photography', hi: 'फोटोग्राफी', icon: '📸' },
  { en: 'Computer Repair', hi: 'कंप्यूटर रिपेयर', icon: '💻' },
  { en: 'Mobile Repair', hi: 'मोबाइल रिपेयर', icon: '📱' },
  { en: 'Sales', hi: 'सेल्स', icon: '💼' },
  { en: 'Office Work', hi: 'ऑफिस वर्क', icon: '🏢' },
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