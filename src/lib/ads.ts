// Centralized AdSense loader + consent gate.
// Ads are NEVER loaded unless the user has explicitly granted consent.

export const ADSENSE_CLIENT = 'ca-pub-2230245159991674';
export const CONSENT_KEY = 'rm_ad_consent_v1'; // 'granted' | 'denied'
export const CONSENT_EVENT = 'rm:ad-consent-changed';

export type ConsentValue = 'granted' | 'denied' | null;

export function getAdConsent(): ConsentValue {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setAdConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}

  // Update Google Consent Mode v2 signals
  const g = (window as any).gtag;
  if (typeof g === 'function') {
    const state = value === 'granted' ? 'granted' : 'denied';
    g('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  if (value === 'granted') {
    loadAdSense();
  }

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

let adsenseLoading = false;
export function loadAdSense(): Promise<void> {
  return new Promise((resolve) => {
    if (getAdConsent() !== 'granted') {
      resolve();
      return;
    }
    const w = window as any;
    if (w.__adsenseReady) { resolve(); return; }
    const existing = document.querySelector('script[data-adsense-loader]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => { w.__adsenseReady = true; enableAutoAds(); resolve(); }, { once: true });
      return;
    }
    if (adsenseLoading) { resolve(); return; }
    adsenseLoading = true;
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.adsenseLoader = '1';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    s.onload = () => {
      w.__adsenseReady = true;
      enableAutoAds();
      resolve();
    };
    s.onerror = () => { adsenseLoading = false; resolve(); };
    document.head.appendChild(s);
  });
}

function enableAutoAds() {
  try {
    const w = window as any;
    if (w.__autoAdsEnabled) return;
    w.__autoAdsEnabled = true;
    (w.adsbygoogle = w.adsbygoogle || []).push({
      google_ad_client: ADSENSE_CLIENT,
      enable_page_level_ads: true,
    });
  } catch (e) {
    console.warn('[ads] auto ads enable failed', e);
  }
}

export function pushAdSlot() {
  if (getAdConsent() !== 'granted') return;
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch (e) {
    console.warn('[ads] push slot failed', e);
  }
}

// On app boot, if consent was already granted in a prior session, load ads.
export function bootstrapAds() {
  if (getAdConsent() === 'granted') {
    // Reflect granted state to gtag (default was denied)
    const g = (window as any).gtag;
    if (typeof g === 'function') {
      g('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
    loadAdSense();
  }
}
