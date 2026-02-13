import { useState } from 'react';
import { ArrowLeft, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminPostFormProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

type TargetTable = 'posts' | 'app_ads' | 'govt_schemes' | 'notifications' | 'trending_items';

const TABLE_OPTIONS: { value: TargetTable; labelEn: string; labelHi: string }[] = [
  { value: 'posts', labelEn: 'Post (Job/Service)', labelHi: 'पोस्ट (नौकरी/सेवा)' },
  { value: 'app_ads', labelEn: 'Advertisement', labelHi: 'विज्ञापन' },
  { value: 'govt_schemes', labelEn: 'Government Scheme', labelHi: 'सरकारी योजना' },
  { value: 'notifications', labelEn: 'Notification', labelHi: 'सूचना' },
  { value: 'trending_items', labelEn: 'Trending Item', labelHi: 'ट्रेंडिंग आइटम' },
];

const AdminPostForm = ({ language, onBack }: AdminPostFormProps) => {
  const [target, setTarget] = useState<TargetTable>('posts');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [postType, setPostType] = useState<'job' | 'service'>('job');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const t = {
    en: {
      pageTitle: 'Admin: Send Content',
      selectType: 'Select Target',
      title: 'Title',
      description: 'Description',
      imageUrl: 'Image URL (optional)',
      linkUrl: 'Link URL (optional)',
      prompt: 'AI Prompt (optional)',
      category: 'Category (optional)',
      isUrgent: 'Urgent',
      isNew: 'Mark as New',
      postType: 'Post Type',
      send: 'Send',
      success: 'Sent successfully!',
      error: 'Failed to send',
      titleRequired: 'Title is required',
    },
    hi: {
      pageTitle: 'एडमिन: कंटेंट भेजें',
      selectType: 'टारगेट चुनें',
      title: 'शीर्षक',
      description: 'विवरण',
      imageUrl: 'इमेज URL (वैकल्पिक)',
      linkUrl: 'लिंक URL (वैकल्पिक)',
      prompt: 'AI प्रॉम्प्ट (वैकल्पिक)',
      category: 'कैटेगरी (वैकल्पिक)',
      isUrgent: 'अर्जेंट',
      isNew: 'नया मार्क करें',
      postType: 'पोस्ट टाइप',
      send: 'भेजें',
      success: 'सफलतापूर्वक भेज दिया!',
      error: 'भेजने में विफल',
      titleRequired: 'शीर्षक आवश्यक है',
    },
  };

  const txt = t[language];

  const showField = (field: string) => {
    switch (field) {
      case 'imageUrl': return ['app_ads', 'trending_items'].includes(target);
      case 'linkUrl': return ['app_ads', 'govt_schemes'].includes(target);
      case 'prompt': return target === 'trending_items';
      case 'category': return ['trending_items', 'govt_schemes'].includes(target);
      case 'isUrgent': return target === 'posts';
      case 'isNew': return target === 'trending_items';
      case 'postType': return target === 'posts';
      default: return false;
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLinkUrl('');
    setPrompt('');
    setCategory('');
    setIsUrgent(false);
    setIsNew(false);
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toast({ title: txt.titleRequired, variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let error: any = null;

      switch (target) {
        case 'posts': {
          const res = await supabase.from('posts').insert({
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            type: postType,
            is_urgent: isUrgent,
          });
          error = res.error;
          break;
        }
        case 'app_ads': {
          const res = await supabase.from('app_ads').insert({
            title: title.trim(),
            image_url: imageUrl.trim() || 'https://placehold.co/600x200',
            link_url: linkUrl.trim() || null,
            is_active: true,
          });
          error = res.error;
          break;
        }
        case 'govt_schemes': {
          const res = await supabase.from('govt_schemes').insert({
            title: title.trim(),
            description: description.trim() || null,
            link: linkUrl.trim() || null,
            category: category.trim() || null,
            is_active: true,
          });
          error = res.error;
          break;
        }
        case 'notifications': {
          // Send notification to all — we use the RPC
          // For now insert directly (admin policy)
          const res = await supabase.from('notifications').insert({
            user_id: user.id, // self notification for now
            title: title.trim(),
            message: description.trim() || title.trim(),
            type: 'general',
          });
          error = res.error;
          break;
        }
        case 'trending_items': {
          const res = await supabase.from('trending_items').insert({
            title: title.trim(),
            description: description.trim() || null,
            image_url: imageUrl.trim() || 'https://placehold.co/600x400',
            prompt: prompt.trim() || title.trim(),
            category: category.trim() || 'Corporate',
            is_new: isNew,
            is_active: true,
          });
          error = res.error;
          break;
        }
      }

      if (error) throw error;

      toast({ title: txt.success });
      resetForm();
    } catch (err: any) {
      console.error('Admin post error:', err);
      toast({ title: txt.error, description: err?.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      <div className="sticky top-[52px] z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">{txt.pageTitle}</h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Target selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{txt.selectType}</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as TargetTable)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {language === 'hi' ? opt.labelHi : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{txt.title} *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{txt.description}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
        </div>

        {/* Post Type */}
        {showField('postType') && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{txt.postType}</Label>
            <Select value={postType} onValueChange={(v) => setPostType(v as 'job' | 'service')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">{language === 'hi' ? 'नौकरी' : 'Job'}</SelectItem>
                <SelectItem value="service">{language === 'hi' ? 'सेवा' : 'Service'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Image URL */}
        {showField('imageUrl') && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> {txt.imageUrl}
            </Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
        )}

        {/* Link URL */}
        {showField('linkUrl') && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{txt.linkUrl}</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>
        )}

        {/* Prompt */}
        {showField('prompt') && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{txt.prompt}</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} maxLength={2000} />
          </div>
        )}

        {/* Category */}
        {showField('category') && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{txt.category}</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Corporate / IT / Government" />
          </div>
        )}

        {/* Toggles */}
        {showField('isUrgent') && (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{txt.isUrgent}</Label>
            <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
          </div>
        )}

        {showField('isNew') && (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{txt.isNew}</Label>
            <Switch checked={isNew} onCheckedChange={setIsNew} />
          </div>
        )}

        {/* Send Button */}
        <Button className="w-full h-12 text-base" onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
          {txt.send}
        </Button>
      </div>
    </div>
  );
};

export default AdminPostForm;
