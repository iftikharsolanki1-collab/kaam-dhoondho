import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const skills = [
  { en: 'All', hi: 'सभी', icon: '🔧' },
  { en: 'Plumber', hi: 'प्लंबर', icon: '🔧' },
  { en: 'Mason', hi: 'मिस्त्री', icon: '🧱' },
  { en: 'Painter', hi: 'रंगाई-पुताई', icon: '🎨' },
  { en: 'Carpenter', hi: 'बढ़ई / कारपेंटर', icon: '🔨' },
  { en: 'Helper', hi: 'सहायक', icon: '👤' },
  { en: 'Tile Worker', hi: 'टाइल्स लगाना / फिनिशिंग', icon: '🔲' },
  { en: 'Welder', hi: 'वेल्डर', icon: '🔥' },
  { en: 'Rental Provider', hi: 'तिरपाल, झूला, सीढ़ी आदि किराए से देने वाला', icon: '🏪' },
  { en: 'Cook', hi: 'हलवाई', icon: '👨‍🍳' },
  { en: 'Cook Helper', hi: 'हलवाई सहायक', icon: '🥄' },
  { en: 'Dishwasher', hi: 'बर्तन धोने वाला', icon: '🍽️' },
  { en: 'Housemaid', hi: 'घरेलू सहायिका', icon: '🏠' },
  { en: 'Child Care', hi: 'बच्चों की देखभाल करने वाला', icon: '👶' },
  { en: 'Elderly Care', hi: 'बुज़ुर्गों की देखभाल करने वाला', icon: '👴' },
  { en: 'Physiotherapist', hi: 'फिजियोथेरेपिस्ट', icon: '🏥' },
  { en: 'Driver', hi: 'लोडिंग वाहन (Mini Truck, Rickshaw)', icon: '🚚' },
  { en: 'Car Driver', hi: 'कार ड्राइवर', icon: '🚗' },
  { en: 'Delivery Boy', hi: 'डिलीवरी बॉय', icon: '📦' },
  { en: 'Worker', hi: 'कामगार / सहायक', icon: '👷' },
  { en: 'Packing', hi: 'पैकिंग कार्य', icon: '📦' },
  { en: 'Security Guard', hi: 'सुरक्षा गार्ड', icon: '🛡️' },
  { en: 'Tailor', hi: 'दर्ज़ी', icon: '✂️' },
  { en: 'Papad Making', hi: 'पापड़ बनाना', icon: '🍘' },
  { en: 'Mehndi Artist', hi: 'मेहंदी लगाना', icon: '✋' },
  { en: 'Bangle Making', hi: 'चूड़ी बनाना', icon: '💍' },
  { en: 'Electrician', hi: 'इलेक्ट्रीशियन', icon: '⚡' },
  { en: 'AC Technician', hi: 'एसी तकनीशियन', icon: '❄️' },
  { en: 'Fridge Mechanic', hi: 'फ्रिज मैकेनिक', icon: '🧊' },
  { en: 'CCTV Installation', hi: 'सीसीटीवी इंस्टालेशन', icon: '📹' },
  { en: 'Computer Repair', hi: 'कंप्यूटर मरम्मत', icon: '💻' },
  { en: 'Hostel', hi: 'छात्रावास', icon: '🏨' },
  { en: 'Tiffin Center', hi: 'टिफिन केंद्र', icon: '🍱' },
  { en: 'Salesman', hi: 'विक्रेता', icon: '🤝' },
  { en: 'Peon', hi: 'चपरासी', icon: '📋' },
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
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                selectedSkill === skill.en
                  ? 'bg-primary text-primary-foreground shadow-lg transform scale-105 animate-fade-in'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-md'
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