import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportPostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  language: 'en' | 'hi';
}

const REASONS = [
  { value: 'fake', labelEn: 'Fake / Fraud', labelHi: 'फर्जी / धोखाधड़ी' },
  { value: 'inappropriate', labelEn: 'Inappropriate', labelHi: 'अनुचित सामग्री' },
  { value: 'spam', labelEn: 'Spam', labelHi: 'स्पैम' },
  { value: 'harassment', labelEn: 'Harassment', labelHi: 'उत्पीड़न' },
  { value: 'misleading', labelEn: 'Misleading Info', labelHi: 'भ्रामक जानकारी' },
];

export const ReportPostSheet = ({ open, onOpenChange, postId, language }: ReportPostSheetProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      title: 'Report this Post',
      description: 'Help us keep the community safe. Select a reason and add details.',
      reasonLabel: 'Select Reason',
      messageLabel: 'Add Details (optional)',
      messagePlaceholder: 'Tell us more about why you are reporting this post...',
      submit: 'Submit Report',
      success: 'Thank you! Our team will review this report.',
      error: 'Failed to submit report',
      alreadyReported: 'You have already reported this post',
      selectReason: 'Please select a reason',
    },
    hi: {
      title: 'इस पोस्ट की रिपोर्ट करें',
      description: 'समुदाय को सुरक्षित रखने में मदद करें। कारण चुनें और विवरण जोड़ें।',
      reasonLabel: 'कारण चुनें',
      messageLabel: 'विवरण जोड़ें (वैकल्पिक)',
      messagePlaceholder: 'हमें बताएं कि आप इस पोस्ट की रिपोर्ट क्यों कर रहे हैं...',
      submit: 'रिपोर्ट भेजें',
      success: 'धन्यवाद! हमारी टीम इस रिपोर्ट की समीक्षा करेगी।',
      error: 'रिपोर्ट भेजने में विफल',
      alreadyReported: 'आपने पहले ही इस पोस्ट की रिपोर्ट की है',
      selectReason: 'कृपया एक कारण चुनें',
    },
  };

  const t = texts[language];

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({ title: t.selectReason, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reports' as any).insert({
        post_id: postId,
        reporter_id: user.id,
        reason: selectedReason,
        message: message.trim() || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: t.alreadyReported, variant: 'destructive' });
        } else {
          throw error;
        }
        return;
      }

      toast({ title: '✅', description: t.success });
      setSelectedReason(null);
      setMessage('');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Report submit error:', err);
      toast({ title: t.error, description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t.title}
          </SheetTitle>
          <SheetDescription>{t.description}</SheetDescription>
        </SheetHeader>

        {/* Reason Chips */}
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-3">{t.reasonLabel}</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((reason) => (
              <Badge
                key={reason.value}
                variant={selectedReason === reason.value ? 'default' : 'outline'}
                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                  selectedReason === reason.value
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedReason(reason.value)}
              >
                {language === 'hi' ? reason.labelHi : reason.labelEn}
              </Badge>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-2">{t.messageLabel}</p>
          <Textarea
            placeholder={t.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/500</p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedReason}
          className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {t.submit}
        </Button>
      </SheetContent>
    </Sheet>
  );
};
