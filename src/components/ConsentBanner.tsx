import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAdConsent, setAdConsent } from '@/lib/ads';
import { Shield } from 'lucide-react';

interface Props {
  language: 'en' | 'hi';
}

const texts = {
  hi: {
    title: 'आपकी निजता आपकी पसंद',
    body: 'हम Rojgar Mela को मुफ्त रखने के लिए Google AdSense से विज्ञापन दिखाते हैं। आपकी सहमति के बाद ही cookies और personalized ads लोड होंगे। आप कभी भी Settings से बदल सकते हैं।',
    accept: 'सहमति दें',
    reject: 'अस्वीकार करें',
    learn: 'और जानें',
  },
  en: {
    title: 'Your privacy, your choice',
    body: 'We show Google AdSense ads to keep Rojgar Mela free. Cookies and personalized ads will load only after your consent. You can change this anytime from Settings.',
    accept: 'Accept',
    reject: 'Reject',
    learn: 'Learn more',
  },
};

export const ConsentBanner = ({ language }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getAdConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;
  const t = texts[language];

  const handle = (v: 'granted' | 'denied') => {
    setAdConsent(v);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold mb-1">{t.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.body}{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                {t.learn}
              </a>
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => handle('denied')}>
                {t.reject}
              </Button>
              <Button size="sm" className="flex-1" onClick={() => handle('granted')}>
                {t.accept}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
