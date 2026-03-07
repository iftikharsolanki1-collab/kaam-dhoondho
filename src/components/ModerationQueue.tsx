import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Search, Trash2, Ban, CheckCircle, AlertTriangle, Loader2, Shield, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ModerationQueueProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface ReportItem {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  message: string | null;
  status: string;
  created_at: string;
  post_title?: string;
  post_user_id?: string;
  report_count?: number;
}

const ModerationQueue = ({ language, onBack }: ModerationQueueProps) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const texts = {
    en: {
      title: 'Moderation Queue',
      subtitle: 'Review reported posts and take action',
      search: 'Search by reason or post...',
      filter: 'Status',
      all: 'All',
      pending: 'Pending',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
      deletePost: 'Delete Post',
      banUser: 'Strike User',
      dismiss: 'Dismiss',
      noReports: 'No reports found',
      reason: 'Reason',
      message: 'Message',
      reportedAt: 'Reported',
      reports: 'reports',
      confirmDelete: 'Are you sure you want to delete this post?',
      confirmDeleteDesc: 'This will permanently remove the post and resolve all related reports.',
      confirmBan: 'Issue a strike to this user?',
      confirmBanDesc: '1st strike = 3-day ban, 2nd = 7-day ban, 3rd = permanent ban.',
      postDeleted: 'Post deleted successfully',
      strikeIssued: 'Strike issued to user',
      reportDismissed: 'Report dismissed',
    },
    hi: {
      title: 'मॉडरेशन कतार',
      subtitle: 'रिपोर्ट की गई पोस्ट की समीक्षा करें',
      search: 'कारण या पोस्ट से खोजें...',
      filter: 'स्थिति',
      all: 'सभी',
      pending: 'लंबित',
      resolved: 'हल किया गया',
      dismissed: 'खारिज',
      deletePost: 'पोस्ट हटाएं',
      banUser: 'स्ट्राइक दें',
      dismiss: 'खारिज करें',
      noReports: 'कोई रिपोर्ट नहीं मिली',
      reason: 'कारण',
      message: 'संदेश',
      reportedAt: 'रिपोर्ट किया गया',
      reports: 'रिपोर्ट',
      confirmDelete: 'क्या आप इस पोस्ट को हटाना चाहते हैं?',
      confirmDeleteDesc: 'यह पोस्ट स्थायी रूप से हटा दी जाएगी।',
      confirmBan: 'इस यूज़र को स्ट्राइक देना चाहते हैं?',
      confirmBanDesc: 'पहली स्ट्राइक = 3 दिन बैन, दूसरी = 7 दिन, तीसरी = स्थायी बैन।',
      postDeleted: 'पोस्ट सफलतापूर्वक हटाई गई',
      strikeIssued: 'यूज़र को स्ट्राइक दी गई',
      reportDismissed: 'रिपोर्ट खारिज की गई',
    },
  };

  const t = texts[language];

  const reasonLabels: Record<string, { en: string; hi: string }> = {
    fake: { en: 'Fake / Fraud', hi: 'फर्जी / धोखाधड़ी' },
    inappropriate: { en: 'Inappropriate', hi: 'अनुचित सामग्री' },
    spam: { en: 'Spam', hi: 'स्पैम' },
    harassment: { en: 'Harassment', hi: 'उत्पीड़न' },
    misleading: { en: 'Misleading Info', hi: 'भ्रामक जानकारी' },
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = (supabase as any).from('reports').select('*');
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with post titles
      const postIds = [...new Set((data || []).map((r: any) => r.post_id))];
      let postMap: Record<string, any> = {};
      if (postIds.length > 0) {
        const { data: posts } = await supabase.from('posts').select('id, title, user_id').in('id', postIds);
        posts?.forEach((p) => { postMap[p.id] = p; });
      }

      // Count reports per post
      const countMap: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        countMap[r.post_id] = (countMap[r.post_id] || 0) + 1;
      });

      const enriched = (data || []).map((r: any) => ({
        ...r,
        post_title: postMap[r.post_id]?.title || 'Unknown Post',
        post_user_id: postMap[r.post_id]?.user_id,
        report_count: countMap[r.post_id] || 1,
      }));

      // Sort by report count descending (high-risk first)
      enriched.sort((a: ReportItem, b: ReportItem) => (b.report_count || 0) - (a.report_count || 0));

      setReports(enriched);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (report: ReportItem) => {
    setActionLoading(report.id);
    try {
      // Delete the post (cascades reports)
      const { error } = await supabase.from('posts').delete().eq('id', report.post_id);
      if (error) throw error;

      toast({ title: '✅', description: t.postDeleted });
      loadReports();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStrikeUser = async (report: ReportItem) => {
    if (!report.post_user_id) return;
    setActionLoading(report.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current strike count
      const { data: strikes } = await (supabase as any)
        .from('user_strikes')
        .select('strike_number')
        .eq('user_id', report.post_user_id)
        .order('strike_number', { ascending: false })
        .limit(1);

      const currentStrikes = strikes?.[0]?.strike_number || 0;
      const newStrikeNum = currentStrikes + 1;

      let banUntil: string | null = null;
      let isPermanent = false;

      if (newStrikeNum === 1) {
        banUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      } else if (newStrikeNum === 2) {
        banUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        isPermanent = true;
      }

      await (supabase as any).from('user_strikes').insert({
        user_id: report.post_user_id,
        reason: report.reason,
        strike_number: newStrikeNum,
        ban_until: banUntil,
        is_permanent: isPermanent,
        admin_id: user?.id,
      });

      // Update report status
      await (supabase as any).from('reports').update({ status: 'resolved' }).eq('id', report.id);

      // Delete the post too
      await supabase.from('posts').delete().eq('id', report.post_id);

      toast({
        title: '⚠️',
        description: `${t.strikeIssued} (Strike #${newStrikeNum}${isPermanent ? ' - PERMANENT BAN' : ''})`,
      });
      loadReports();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await (supabase as any).from('reports').update({ status: 'dismissed' }).eq('id', reportId);
      toast({ title: '✅', description: t.reportDismissed });
      loadReports();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.reason.toLowerCase().includes(q) ||
      r.post_title?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="resolved">{t.resolved}</SelectItem>
              <SelectItem value="dismissed">{t.dismissed}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t.noReports}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className={`shadow-sm ${report.status === 'pending' ? 'border-l-4 border-l-destructive' : ''}`}>
                <CardContent className="p-4">
                  {/* Post info & report count */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{report.post_title}</p>
                      <p className="text-xs text-muted-foreground">{t.reportedAt}: {formatDate(report.created_at)}</p>
                    </div>
                    <Badge variant={(report.report_count || 0) >= 5 ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                      {report.report_count} {t.reports}
                    </Badge>
                  </div>

                  {/* Reason */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {reasonLabels[report.reason]?.[language] || report.reason}
                    </Badge>
                    {report.status !== 'pending' && (
                      <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'} className="ml-2 text-xs">
                        {report.status === 'resolved' ? t.resolved : t.dismissed}
                      </Badge>
                    )}
                  </div>

                  {/* Message */}
                  {report.message && (
                    <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-2 rounded">
                      "{report.message}"
                    </p>
                  )}

                  {/* Actions (only for pending) */}
                  {report.status === 'pending' && (
                    <div className="flex gap-2 flex-wrap">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={actionLoading === report.id}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            {t.deletePost}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                            <AlertDialogDescription>{t.confirmDeleteDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{language === 'hi' ? 'रद्द' : 'Cancel'}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(report)}>{t.deletePost}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50" disabled={actionLoading === report.id}>
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            {t.banUser}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.confirmBan}</AlertDialogTitle>
                            <AlertDialogDescription>{t.confirmBanDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{language === 'hi' ? 'रद्द' : 'Cancel'}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStrikeUser(report)}>{t.banUser}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button size="sm" variant="ghost" onClick={() => handleDismiss(report.id)} disabled={actionLoading === report.id}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {t.dismiss}
                      </Button>
                    </div>
                  )}

                  {actionLoading === report.id && (
                    <div className="flex justify-center mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationQueue;
