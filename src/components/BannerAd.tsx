import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  priority: number;
}

interface BannerAdProps {
  position?: 'feed_bottom' | 'feed_inline';
}

export const BannerAd = ({ position = 'feed_bottom' }: BannerAdProps) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, [position]);

  const loadAd = async () => {
    try {
      const { data, error } = await supabase
        .from('app_ads' as any)
        .select('id, title, image_url, link_url, priority')
        .eq('position', position)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading ad:', error);
      } else if (data) {
        setAd(data as unknown as Ad);
      }
    } catch (err) {
      console.error('Failed to load ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (isLoading || !ad || !isVisible) {
    return null;
  }

  return (
    <div 
      className="relative bg-card rounded-lg overflow-hidden shadow-md border border-border cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
      onClick={handleClick}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        aria-label="Close ad"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Ad label */}
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
        Ad
      </div>

      {/* Ad image */}
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full h-24 sm:h-32 object-cover"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />

      {/* Optional title overlay */}
      {ad.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-sm font-medium truncate">{ad.title}</p>
        </div>
      )}
    </div>
  );
};

// Sticky bottom banner for feed
export const StickyBannerAd = () => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    try {
      const { data } = await supabase
        .from('app_ads' as any)
        .select('id, title, image_url, link_url, priority')
        .eq('position', 'feed_bottom')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) setAd(data as unknown as Ad);
    } catch (err) {
      console.error('Failed to load sticky ad:', err);
    }
  };

  const handleClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!ad || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-2 pb-2">
      <div 
        className="relative bg-card rounded-lg overflow-hidden shadow-lg border border-border cursor-pointer mx-auto max-w-lg"
        onClick={handleClick}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-1 right-1 z-10 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
          aria-label="Close ad"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Ad label */}
        <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-black/50 rounded text-white text-[10px]">
          Ad
        </div>

        {/* Compact ad layout */}
        <div className="flex items-center gap-2 p-2">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-16 h-12 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ad.title}</p>
            <p className="text-xs text-primary">Learn More →</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
