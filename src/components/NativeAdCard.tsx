import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface NativeAd {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  priority: number;
}

const NativeAdSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="p-3 flex items-center gap-2">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="w-full aspect-video" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  </Card>
);

interface NativeAdCardProps {
  position?: string;
}

export const NativeAdCard = ({ position = 'feed_inline' }: NativeAdCardProps) => {
  const [ad, setAd] = useState<NativeAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const impressionTracked = useRef(false);

  useEffect(() => {
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

        if (error || !data) {
          setFailed(true);
        } else {
          setAd(data as unknown as NativeAd);
        }
      } catch {
        setFailed(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadAd();
  }, []);

  // Track impression when visible
  useEffect(() => {
    if (ad && !impressionTracked.current) {
      impressionTracked.current = true;
      console.log('[ad_impression]', { ad_id: ad.id, timestamp: Date.now() });
    }
  }, [ad]);

  const handleClick = () => {
    if (ad?.link_url) {
      console.log('[ad_click]', { ad_id: ad.id, timestamp: Date.now() });
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  // Collapse on failure — no empty gap
  if (failed || (!isLoading && !ad)) return null;
  if (!isVisible) return null;
  if (isLoading) return <NativeAdSkeleton />;

  return (
    <Card className="overflow-hidden relative group">
      {/* Header: Sponsored badge + close */}
      <div className="flex items-center justify-between p-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Advertiser icon */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[180px]">
              {ad!.title}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Sponsored
            </span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Close ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Media */}
      <div className="mt-1 cursor-pointer" onClick={handleClick}>
        <AspectRatio ratio={16 / 9}>
          <img
            src={ad!.image_url}
            alt={ad!.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
      </div>

      {/* CTA */}
      <div className="p-3 pt-2">
        <Button
          onClick={handleClick}
          className="w-full"
          size="sm"
        >
          {ad!.link_url ? 'Learn More' : 'View Details'}
        </Button>
      </div>
    </Card>
  );
};

export default NativeAdCard;
