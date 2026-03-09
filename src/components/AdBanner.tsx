import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  adSlot: string;        // AdSense slot for web
  adUnitId: string;      // AdMob unit ID for native
  className?: string;
}

/**
 * Cross-platform ad banner:
 * - Web → Google AdSense
 * - Native (Capacitor) → Google AdMob via plugin
 */
const AdBanner = ({
  adSlot,
  adUnitId,
  className = '',
}: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Detect Capacitor native environment
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      setIsNative(true);
      showAdMob(adUnitId);
    } else {
      loadAdSense();
    }
  }, [adUnitId]);

  const loadAdSense = () => {
    // Ensure AdSense script is loaded once
    if (!document.querySelector('script[src*="pagead2.googlesyndication"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2230245159991674';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Push ad after small delay to ensure script is ready
    setTimeout(() => {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.log('[AdBanner] AdSense push error:', e);
      }
    }, 500);
  };

  const showAdMob = async (unitId: string) => {
    try {
      // Dynamic import — only works when @capacitor-community/admob is installed in native build
      const admobModule: any = await (Function('return import("@capacitor-community/admob")')());
      const { AdMob, BannerAdSize, BannerAdPosition } = admobModule;
      await AdMob.initialize({ initializeForTesting: false });
      await AdMob.showBanner({
        adId: unitId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.TOP_CENTER,
        isTesting: false,
      });
    } catch (e) {
      console.log('[AdBanner] AdMob not available:', e);
    }
  };

  if (dismissed) return null;

  // For native, AdMob renders natively above the webview — we just need a spacer
  if (isNative) {
    return <div className={`h-14 w-full bg-neutral-900 ${className}`} />;
  }

  // Web: AdSense banner
  return (
    <div className={`relative w-full bg-neutral-900/80 backdrop-blur-sm ${className}`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1 right-1 z-10 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white/70 hover:text-white"
        aria-label="Close ad"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-black/50 rounded text-white/60 text-[9px]">
        Ad
      </div>
      <div ref={adRef} className="w-full min-h-[50px] flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: 'auto' }}
          data-ad-client="ca-pub-2230245159991674"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdBanner;
