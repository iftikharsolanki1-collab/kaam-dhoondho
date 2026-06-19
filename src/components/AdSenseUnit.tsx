import { useEffect, useState } from 'react';
import { ADSENSE_CLIENT, CONSENT_EVENT, getAdConsent, loadAdSense, pushAdSlot } from '@/lib/ads';

interface AdSenseUnitProps {
  slot: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Fixed-size AdSense ad unit (consent-gated).
 * Renders the <ins class="adsbygoogle"> tag and pushes after the SDK is ready.
 */
const AdSenseUnit = ({ slot, width = 360, height = 800, className = '' }: AdSenseUnitProps) => {
  const [consent, setConsent] = useState(getAdConsent());

  useEffect(() => {
    if (getAdConsent() === 'granted') {
      loadAdSense().then(() => setTimeout(pushAdSlot, 300));
    }
    const onConsent = (e: any) => {
      setConsent(e.detail);
      if (e.detail === 'granted') {
        loadAdSense().then(() => setTimeout(pushAdSlot, 300));
      }
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (consent !== 'granted') return null;

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  );
};

export default AdSenseUnit;
