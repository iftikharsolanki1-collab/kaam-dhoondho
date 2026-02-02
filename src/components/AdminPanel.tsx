import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Shield, Briefcase, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface Scheme {
  id: string;
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  eligibility: string | null;
  eligibility_hi: string | null;
  benefits: string | null;
  benefits_hi: string | null;
  link: string | null;
  category: string | null;
  is_active: boolean | null;
}

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  position: string;
  priority: number;
  expires_at: string | null;
}

interface Post {
  id: string;
  title: string;
  name: string | null;
  location: string | null;
  type: string;
  is_urgent: boolean | null;
  created_at: string;
}

export const AdminPanel = ({ language, onBack }: AdminPanelProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showNewScheme, setShowNewScheme] = useState(false);
  const [showNewAd, setShowNewAd] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      title: 'Admin Panel',
      notAdmin: 'You do not have admin access',
      schemes: 'Government Schemes',
      ads: 'Advertisements',
      posts: 'All Posts',
      addScheme: 'Add Scheme',
      addAd: 'Add Advertisement',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      active: 'Active',
      title_label: 'Title',
      title_hi_label: 'Title (Hindi)',
      description: 'Description',
      description_hi: 'Description (Hindi)',
      eligibility: 'Eligibility',
      benefits: 'Benefits',
      link: 'Link URL',
      category: 'Category',
      image_url: 'Image URL',
      link_url: 'Click URL',
      priority: 'Priority',
      expires: 'Expires At',
      loading: 'Checking admin access...',
    },
    hi: {
      title: 'एडमिन पैनल',
      notAdmin: 'आपके पास एडमिन एक्सेस नहीं है',
      schemes: 'सरकारी योजनाएं',
      ads: 'विज्ञापन',
      posts: 'सभी पोस्ट',
      addScheme: 'योजना जोड़ें',
      addAd: 'विज्ञापन जोड़ें',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      active: 'सक्रिय',
      title_label: 'शीर्षक',
      title_hi_label: 'शीर्षक (हिंदी)',
      description: 'विवरण',
      description_hi: 'विवरण (हिंदी)',
      eligibility: 'पात्रता',
      benefits: 'लाभ',
      link: 'लिंक URL',
      category: 'श्रेणी',
      image_url: 'छवि URL',
      link_url: 'क्लिक URL',
      priority: 'प्राथमिकता',
      expires: 'समाप्ति तिथि',
      loading: 'एडमिन एक्सेस जांच रहा है...',
    }
  };

  const t = texts[language];

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
        if (data) {
          loadData();
        }
      }
    } catch (err) {
      console.error('Admin check failed:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    // Load schemes
    const { data: schemesData } = await supabase
      .from('govt_schemes')
      .select('*')
      .order('created_at', { ascending: false });
    if (schemesData) setSchemes(schemesData);

    // Load ads
    const { data: adsData } = await supabase
      .from('app_ads' as any)
      .select('*')
      .order('priority', { ascending: false });
    if (adsData) setAds(adsData as unknown as Ad[]);

    // Load posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, title, name, location, type, is_urgent, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (postsData) setPosts(postsData);
  };

  const handleSaveScheme = async (scheme: Partial<Scheme>) => {
    try {
      if (editingScheme?.id) {
        const { error } = await supabase
          .from('govt_schemes')
          .update(scheme)
          .eq('id', editingScheme.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('govt_schemes')
          .insert(scheme as any);
        if (error) throw error;
      }
      toast({ title: language === 'en' ? 'Saved!' : 'सेव हो गया!' });
      setEditingScheme(null);
      setShowNewScheme(false);
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteScheme = async (id: string) => {
    try {
      const { error } = await supabase.from('govt_schemes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Deleted!' : 'हटा दिया गया!' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleSaveAd = async (ad: Partial<Ad>) => {
    try {
      if (editingAd?.id) {
        const { error } = await supabase
          .from('app_ads' as any)
          .update(ad)
          .eq('id', editingAd.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_ads' as any)
          .insert(ad as any);
        if (error) throw error;
      }
      toast({ title: language === 'en' ? 'Saved!' : 'सेव हो गया!' });
      setEditingAd(null);
      setShowNewAd(false);
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const { error } = await supabase.from('app_ads' as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Deleted!' : 'हटा दिया गया!' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Post deleted!' : 'पोस्ट हटा दी गई!' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t.title}</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">{t.notAdmin}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-primary/80">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Shield className="w-5 h-5" />
        <h1 className="text-lg font-semibold">{t.title}</h1>
      </div>

      <div className="p-4">
        <Tabs defaultValue="schemes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="schemes" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t.schemes}</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">{t.ads}</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">{t.posts}</span>
            </TabsTrigger>
          </TabsList>

          {/* Schemes Tab */}
          <TabsContent value="schemes" className="space-y-4">
            <Button onClick={() => setShowNewScheme(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t.addScheme}
            </Button>

            {(showNewScheme || editingScheme) && (
              <SchemeForm
                scheme={editingScheme}
                language={language}
                onSave={handleSaveScheme}
                onCancel={() => {
                  setEditingScheme(null);
                  setShowNewScheme(false);
                }}
                t={t}
              />
            )}

            {schemes.map((scheme) => (
              <Card key={scheme.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{scheme.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setEditingScheme(scheme)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteScheme(scheme.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{scheme.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${scheme.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {scheme.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {scheme.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{scheme.category}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-4">
            <Button onClick={() => setShowNewAd(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t.addAd}
            </Button>

            {(showNewAd || editingAd) && (
              <AdForm
                ad={editingAd}
                language={language}
                onSave={handleSaveAd}
                onCancel={() => {
                  setEditingAd(null);
                  setShowNewAd(false);
                }}
                t={t}
              />
            )}

            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title} 
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">Priority: {ad.priority}</p>
                      <span className={`text-xs px-2 py-1 rounded ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setEditingAd(ad)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteAd(ad.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.name} • {post.location} • {post.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Scheme Form Component
const SchemeForm = ({ scheme, language, onSave, onCancel, t }: any) => {
  const [form, setForm] = useState({
    title: scheme?.title || '',
    title_hi: scheme?.title_hi || '',
    description: scheme?.description || '',
    description_hi: scheme?.description_hi || '',
    eligibility: scheme?.eligibility || '',
    eligibility_hi: scheme?.eligibility_hi || '',
    benefits: scheme?.benefits || '',
    benefits_hi: scheme?.benefits_hi || '',
    link: scheme?.link || '',
    category: scheme?.category || '',
    is_active: scheme?.is_active ?? true,
  });

  return (
    <Card className="border-primary">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.title_label}</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>{t.title_hi_label}</Label>
            <Input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>{t.description}</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <Label>{t.description_hi}</Label>
          <Textarea value={form.description_hi} onChange={(e) => setForm({ ...form, description_hi: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.eligibility}</Label>
            <Textarea value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
          </div>
          <div>
            <Label>{t.benefits}</Label>
            <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.link}</Label>
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </div>
          <div>
            <Label>{t.category}</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
          <Label>{t.active}</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(form)} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Ad Form Component
const AdForm = ({ ad, language, onSave, onCancel, t }: any) => {
  const [form, setForm] = useState({
    title: ad?.title || '',
    image_url: ad?.image_url || '',
    link_url: ad?.link_url || '',
    is_active: ad?.is_active ?? true,
    position: ad?.position || 'feed_bottom',
    priority: ad?.priority || 0,
    expires_at: ad?.expires_at || '',
  });

  return (
    <Card className="border-primary">
      <CardContent className="p-4 space-y-4">
        <div>
          <Label>{t.title_label}</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>{t.image_url}</Label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
        </div>
        {form.image_url && (
          <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
        <div>
          <Label>{t.link_url}</Label>
          <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.priority}</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>{t.expires}</Label>
            <Input type="datetime-local" value={form.expires_at?.slice(0, 16) || ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
          <Label>{t.active}</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(form)} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
