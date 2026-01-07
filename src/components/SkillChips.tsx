import { useEffect, useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const jobCategories = [
  { id: '0', hi: 'सभी', en: 'All' },
  { id: '1', hi: 'मजदूर / लेबर - खुदाई, मटीरियल हैंडलिंग', en: 'Laborer - Excavation, Material Handling' },
  { id: '2', hi: 'मिस्त्री - नींव, दीवार, RCC, प्लास्टर', en: 'Mason - Foundation, Wall, RCC, Plaster' },
  { id: '3', hi: 'फ्लोरिंग मिस्त्री - टाइल्स, मार्बल, ग्रेनाइट', en: 'Flooring Mason - Tiles, Marble, Granite' },
  { id: '4', hi: 'सरिया बाँधने वाला (फैब्रिकेटर)', en: 'Steel Fixer / Bar Bender - Column, Slab' },
  { id: '5', hi: 'प्लंबर - पानी, ड्रेनेज, सैनिटरी', en: 'Plumber - Water, Drainage, Sanitary' },
  { id: '6', hi: 'पेंटर / पुट्टी मैन - पेंट, टेक्सचर', en: 'Painter / Putty Man - Paint, Texture' },
  { id: '7', hi: 'कारपेंटर (बढ़ई) - दरवाजे, किचन, फर्नीचर', en: 'Carpenter - Doors, Kitchen, Furniture' },
  { id: '8', hi: 'एल्युमिनियम / UPVC फैब्रिकेटर', en: 'Aluminum / UPVC Fabricator - Windows, Grill' },
  { id: '9', hi: 'ग्लास / स्टील फिटर - रेलिंग, पार्टिशन', en: 'Glass / Steel Fitter - Railing, Partition' },
  { id: '10', hi: 'माली - बगीचा', en: 'Gardener - Garden Maintenance' },
  { id: '11', hi: 'घरेलू काम-काज - खाना बनाना, बर्तन', en: 'Domestic Help - Cooking, Dishwashing' },
  { id: '12', hi: 'घरेलू सफाई - झाड़ू-पोंछा, कपड़े धोना', en: 'House Cleaning - Sweeping, Mopping, Laundry' },
  { id: '13', hi: 'बेबी सिटर / आया - शिशु देखभाल', en: 'Babysitter / Nanny - Infant Care' },
  { id: '14', hi: 'केयर टेकर - बुजुर्ग / बीमार की देखभाल', en: 'Caretaker - Elderly / Patient Care' },
  { id: '15', hi: 'शिक्षक / टीचर्स - होम ट्यूशन', en: 'Tutor / Teacher - Home Tuition' },
  { id: '16', hi: 'दुकान / शॉप - सेल्स, सफाई, डिलीवरी', en: 'Shop Staff - Sales, Cleaning, Delivery' },
  { id: '17', hi: 'गोडाउन - मजदूर', en: 'Godown / Warehouse Worker' },
  { id: '18', hi: 'टेलीकॉलर - लड़के / लड़कियाँ', en: 'Telecaller - Boys / Girls' },
  { id: '19', hi: 'फैक्ट्री - पैकेजिंग, मशीन ऑपरेटर', en: 'Factory Worker - Packaging, Machine Operator' },
  { id: '20', hi: 'सिलाई - लेडीज सूट, पैंट, शर्ट', en: 'Tailor - Stitching (Ladies/Gents)' },
];

// Export categories for use in other components
export const getJobCategories = () => jobCategories;

interface SkillChipsProps {
  language: 'en' | 'hi';
  selectedSkill: string;
  onSkillSelect: (skill: string) => void;
}

export const SkillChips = ({ language, selectedSkill, onSkillSelect }: SkillChipsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (scrollPosition >= maxScroll) {
          // Reset to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
          setScrollPosition(0);
        } else {
          // Scroll to next item (approximately one item width)
          const newPosition = Math.min(scrollPosition + 150, maxScroll);
          container.scrollTo({ left: newPosition, behavior: 'smooth' });
          setScrollPosition(newPosition);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scrollPosition, isPaused]);

  // Pause auto-scroll on user interaction
  const handleInteraction = () => {
    setIsPaused(true);
    // Resume after 5 seconds of no interaction
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div className="py-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div 
          ref={scrollContainerRef}
          className="flex w-max gap-2.5 px-3"
          onTouchStart={handleInteraction}
          onMouseDown={handleInteraction}
          onScroll={handleInteraction}
        >
          {jobCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                handleInteraction();
                onSkillSelect(category.en);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedSkill === category.en
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {language === 'hi' ? category.hi : category.en}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
