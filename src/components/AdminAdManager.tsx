import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminAdManagerProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

type AdPosition = 'feed_job' | 'feed_worker' | 'feed_trending';

const POSITION_OPTIONS: { value: AdPosition; labelEn: string; labelHi: string; icon: string }[] = [
  { value: 'feed_job', labelEn: 'काम देने वाले (Job Feed)', labelHi: 'काम देने वाले', icon: '💼' },
  { value: 'feed_worker', labelEn: 'काम करने वाले (Worker Feed)', labelHi: 'काम करने वाले', icon: '🔧' },
  { value: 'feed_trending', labelEn: 'Trending Page', labelHi: 'ट्रेंडिंग पेज', icon: '🔥' },
];

const ADMIN_KEY = '786313786';

const callAdminApi = async (action: string, method: string, body?: any, params?: Record<string, string>) => {
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ads`;
  const queryParams = new URLSearchParams({ action, ...params });
  const url = `${baseUrl}?${queryParams}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const AdminAdManager = ({ language, onBack }: AdminAdManagerProps) => {
  const [position, setPosition] = useState<AdPosition>('feed_job');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [priority, setPriority] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [existingAds, setExistingAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingAds();
  }, []);

  const loadExistingAds = async () => {
    setLoadingAds(true);
    try {
      const result = await callAdminApi('list', 'GET');
      setExistingAds(result.data || []);
    } catch (err) {
      console.error('Failed to load ads:', err);
    }
    setLoadingAds(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'केवल इमेज फाइल अपलोड करें', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'फाइल 5MB से छोटी होनी चाहिए', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl('');
  };

  const uploadImage = async (): Promise<string | null> => {
    if (imageUrl) return imageUrl;
    if (!imageFile) return null;

    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `ads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('trending-images')
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('trending-images')
        .getPublicUrl(fileName);

      return urlData?.publicUrl || null;
    } catch (err) {
      console.error('Upload failed:', err);
      toast({ title: 'इमेज अपलोड विफल', variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'टाइटल डालें', variant: 'destructive' });
      return;
    }
    if (!imageUrl && !imageFile) {
      toast({ title: 'इमेज अपलोड करें या URL डालें', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const finalImageUrl = await uploadImage();
      if (!finalImageUrl) { setSending(false); return; }

      await callAdminApi('create', 'POST', {
        title: title.trim(),
        image_url: finalImageUrl,
        link_url: linkUrl.trim() || null,
        position,
        priority,
      });

      toast({
        title: '✅ विज्ञापन पोस्ट हो गया!',
        description: `${POSITION_OPTIONS.find(p => p.value === position)?.labelHi} में दिखेगा`,
      });

      setTitle('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setLinkUrl('');
      setPriority(1);
      loadExistingAds();
    } catch (err: any) {
      console.error('Ad post failed:', err);
      toast({ title: 'विज्ञापन पोस्ट नहीं हुआ', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await callAdminApi('delete', 'DELETE', undefined, { id: adId });
      toast({ title: '🗑️ विज्ञापन हटा दिया गया' });
      loadExistingAds();
    } catch (err) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleToggleAd = async (adId: string, currentActive: boolean) => {
    try {
      await callAdminApi('toggle', 'PUT', { id: adId, is_active: !currentActive });
      toast({ title: currentActive ? '⏸️ विज्ञापन बंद किया' : '▶️ विज्ञापन चालू किया' });
      loadExistingAds();
    } catch (err) {
      toast({ title: 'Toggle failed', variant: 'destructive' });
    }
  };

  const positionLabel = (pos: string) => {
    const opt = POSITION_OPTIONS.find(p => p.value === pos);
    return opt ? `${opt.icon} ${opt.labelHi}` : pos;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">
          {language === 'hi' ? '📢 विज्ञापन प्रबंधक' : '📢 Ad Manager'}
        </h1>
      </div>

      <div className="p-4 space-y-6 pb-20">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'hi' ? 'नया विज्ञापन बनाएं' : 'Create New Ad'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'कहाँ दिखाना है?' : 'Where to show?'}</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as AdPosition)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.icon} {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'शीर्षक (Shop/Factory का नाम)' : 'Title'}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. राम इलेक्ट्रिकल्स" />
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'फोटो' : 'Photo'}</Label>
              {imagePreview ? (
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  </AspectRatio>
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 w-8 h-8" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload photo'}</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'या URL डालें:' : 'Or enter URL:'}</p>
              <Input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); setImagePreview(null); }} placeholder="https://example.com/image.jpg" />
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'लिंक URL (Affiliate / Website)' : 'Link URL'}</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://shop.example.com" />
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'प्राथमिकता (1-10)' : 'Priority (1-10)'}</Label>
              <Input type="number" min={1} max={10} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </div>

            <Button onClick={handleSubmit} disabled={sending || uploading} className="w-full">
              {sending || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {language === 'hi' ? 'विज्ञापन पोस्ट करें' : 'Post Ad'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{language === 'hi' ? 'मौजूदा विज्ञापन' : 'Existing Ads'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingAds ? (
              <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : existingAds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{language === 'hi' ? 'कोई विज्ञापन नहीं' : 'No ads yet'}</p>
            ) : (
              existingAds.map((ad: any) => (
                <div key={ad.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <img src={ad.image_url} alt={ad.title} className="w-16 h-12 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ad.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{positionLabel(ad.position)}</Badge>
                      <Badge variant={ad.is_active ? 'default' : 'secondary'} className="text-[10px]">{ad.is_active ? '✅ Active' : '⏸️ Inactive'}</Badge>
                    </div>
                    {ad.link_url && (
                      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" /> Link
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleToggleAd(ad.id, ad.is_active)}>
                      {ad.is_active ? '⏸️' : '▶️'}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => handleDeleteAd(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAdManager;
