import { useState } from 'react';
import { ArrowLeft, Copy, Download, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TrendingPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface TrendingItem {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  imageUrl: string;
  prompt: string;
  category: string;
  isNew?: boolean;
}

const TRENDING_DATA: TrendingItem[] = [
  {
    id: '1',
    title: 'Corporate Interview Setup',
    titleHi: 'कॉर्पोरेट इंटरव्यू सेटअप',
    description: 'A professional interview room with modern office aesthetics.',
    descriptionHi: 'आधुनिक ऑफिस डिज़ाइन के साथ एक प्रोफेशनल इंटरव्यू रूम।',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
    prompt: 'A photorealistic corporate interview room with two chairs facing each other across a sleek glass desk, warm overhead lighting, potted plants in the background, modern minimalist office decor, professional atmosphere, 4K quality',
    category: 'Corporate',
    isNew: true,
  },
  {
    id: '2',
    title: 'Resume Design Inspiration',
    titleHi: 'रिज्यूम डिज़ाइन प्रेरणा',
    description: 'Creative resume layout ideas for job seekers.',
    descriptionHi: 'नौकरी चाहने वालों के लिए क्रिएटिव रिज्यूम लेआउट।',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
    prompt: 'A clean and modern resume design laid out on a wooden desk, with a pen, coffee cup, and laptop nearby, top-down flat lay view, professional typography, warm natural lighting, high resolution',
    category: 'Resume',
  },
  {
    id: '3',
    title: 'Team Collaboration Scene',
    titleHi: 'टीम सहयोग दृश्य',
    description: 'Colleagues brainstorming in a modern workspace.',
    descriptionHi: 'आधुनिक वर्कस्पेस में सहकर्मी विचार-मंथन कर रहे हैं।',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    prompt: 'A diverse team of professionals collaborating around a whiteboard in a bright modern office, sticky notes on the board, laptops open, engaged discussion, natural light from large windows, photorealistic',
    category: 'Corporate',
    isNew: true,
  },
  {
    id: '4',
    title: 'Skill Development Workshop',
    titleHi: 'कौशल विकास वर्कशॉप',
    description: 'Hands-on training session in a technical environment.',
    descriptionHi: 'तकनीकी वातावरण में प्रैक्टिकल ट्रेनिंग सत्र।',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
    prompt: 'A hands-on skill development workshop in a well-lit training center, instructor demonstrating on a large screen, students taking notes on laptops, technical equipment visible, professional learning environment',
    category: 'Skill Development',
  },
  {
    id: '5',
    title: 'Professional Headshot Setup',
    titleHi: 'प्रोफेशनल हेडशॉट सेटअप',
    description: 'Studio setup for LinkedIn-worthy profile photos.',
    descriptionHi: 'LinkedIn योग्य प्रोफ़ाइल फ़ोटो के लिए स्टूडियो सेटअप।',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    prompt: 'A professional photography studio setup for corporate headshots, soft box lighting, neutral gray backdrop, camera on tripod, clean minimalist studio, warm professional lighting, ultra realistic',
    category: 'Resume',
  },
  {
    id: '6',
    title: 'Government Office Environment',
    titleHi: 'सरकारी कार्यालय वातावरण',
    description: 'A clean and organized government office space.',
    descriptionHi: 'एक साफ-सुथरा और व्यवस्थित सरकारी कार्यालय।',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    prompt: 'A modern government office workspace, organized desks with computers, filing cabinets, bright fluorescent lighting, professional atmosphere, clean and orderly environment, realistic office photography',
    category: 'Government',
  },
];

const TrendingPage = ({ language, onBack }: TrendingPageProps) => {
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const texts = {
    en: {
      title: 'Trending',
      subtitle: 'AI-generated career visuals for educational and inspiration purposes.',
      copyPrompt: 'Copy Prompt',
      download: 'Download',
      copied: 'Copied!',
      copiedDesc: 'Prompt copied to clipboard.',
      downloading: 'Downloading...',
      downloadDesc: 'Image saved successfully.',
      showPrompt: 'Show Prompt',
      hidePrompt: 'Hide Prompt',
      newBadge: 'New',
    },
    hi: {
      title: 'ट्रेंडिंग',
      subtitle: 'शैक्षिक और प्रेरणा उद्देश्यों के लिए AI-जनित करियर विज़ुअल्स।',
      copyPrompt: 'प्रॉम्प्ट कॉपी करें',
      download: 'डाउनलोड',
      copied: 'कॉपी हो गया!',
      copiedDesc: 'प्रॉम्प्ट क्लिपबोर्ड पर कॉपी हो गया।',
      downloading: 'डाउनलोड हो रहा...',
      downloadDesc: 'इमेज सफलतापूर्वक सेव हो गई।',
      showPrompt: 'प्रॉम्प्ट देखें',
      hidePrompt: 'प्रॉम्प्ट छुपाएं',
      newBadge: 'नया',
    },
  };

  const t = texts[language];

  const togglePrompt = (id: string) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({ title: t.copied, description: t.copiedDesc });
    } catch {
      toast({ title: 'Error', description: 'Could not copy prompt.', variant: 'destructive' });
    }
  };

  const downloadImage = async (url: string, title: string) => {
    try {
      toast({ title: t.downloading });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast({ title: t.downloadDesc });
    } catch {
      toast({ title: 'Error', description: 'Download failed.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      {/* Header */}
      <div className="sticky top-[52px] z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="px-3 py-4 space-y-4">
        {TRENDING_DATA.map((item) => {
          const isExpanded = expandedPrompts.has(item.id);
          return (
            <Card key={item.id} className="overflow-hidden border-border/60">
              {/* Image */}
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={language === 'hi' ? item.titleHi : item.title}
                  className="w-full h-52 object-cover"
                  loading="lazy"
                />
                {item.isNew && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {t.newBadge}
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {item.category}
                </span>
              </div>

              <CardContent className="p-3.5">
                {/* Title & Description */}
                <h3 className="font-semibold text-foreground text-base">
                  {language === 'hi' ? item.titleHi : item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {language === 'hi' ? item.descriptionHi : item.description}
                </p>

                {/* Expandable Prompt */}
                <button
                  onClick={() => togglePrompt(item.id)}
                  className="flex items-center gap-1 mt-3 text-xs font-medium text-primary"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? t.hidePrompt : t.showPrompt}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-2.5 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed animate-fade-in">
                    {item.prompt}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => copyPrompt(item.prompt)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {t.copyPrompt}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => downloadImage(item.imageUrl, language === 'hi' ? item.titleHi : item.title)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {t.download}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingPage;
