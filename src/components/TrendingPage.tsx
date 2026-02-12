import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Download, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrendingPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface TrendingItem {
  id: string;
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  image_url: string;
  prompt: string;
  category: string | null;
  is_new: boolean | null;
}

const TrendingPage = ({ language, onBack }: TrendingPageProps) => {
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      noItems: 'No trending items yet.',
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
      noItems: 'अभी कोई ट्रेंडिंग आइटम नहीं है।',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('trending_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

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

      <div className="px-3 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t.noItems}</p>
        ) : (
          items.map((item) => {
            const isExpanded = expandedPrompts.has(item.id);
            return (
              <Card key={item.id} className="overflow-hidden border-border/60">
                <div className="relative">
                  <img
                    src={item.image_url}
                    alt={language === 'hi' ? (item.title_hi || item.title) : item.title}
                    className="w-full h-52 object-cover"
                    loading="lazy"
                  />
                  {item.is_new && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t.newBadge}
                    </span>
                  )}
                  {item.category && (
                    <span className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                <CardContent className="p-3.5">
                  <h3 className="font-semibold text-foreground text-base">
                    {language === 'hi' ? (item.title_hi || item.title) : item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {language === 'hi' ? (item.description_hi || item.description) : item.description}
                  </p>

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

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-9" onClick={() => copyPrompt(item.prompt)}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {t.copyPrompt}
                    </Button>
                    <Button variant="default" size="sm" className="flex-1 text-xs h-9" onClick={() => downloadImage(item.image_url, language === 'hi' ? (item.title_hi || item.title) : item.title)}>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {t.download}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
