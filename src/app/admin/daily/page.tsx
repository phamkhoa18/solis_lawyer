'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import MermaidRenderer from '@/components/MermaidRenderer';
import { toast } from 'react-hot-toast';
import {
  RefreshCw,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Send,
  FileText,
  Clock3,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

/* ───────────────────────── types ───────────────────────── */
interface Post {
  _id: string;
  plan: 'criminal' | 'family' | 'academic';
  topic: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed' | 'awaiting_feedback';
  version: number;
  feedback?: string;
  article?: {
    titleVi: string;
    titleEn: string;
    contentVi: string;
    contentEn: string;
    quality?: { judge?: { en?: { score?: number }; vi?: { score?: number } } };
  };
  coverUrl?: string;
  casestudySlug?: string;
  runDate: string;
  createdAt: string;
  sentAt?: string;
}

/* ───────────────────────── meta ─────────────────────────── */
const PLAN_META: Record<Post['plan'], { label: string; emoji: string; bg: string }> = {
  criminal: { label: 'Hình Sự', emoji: '⚖️', bg: 'bg-blue-50' },
  family: { label: 'Gia Đình', emoji: '👨‍👩‍👧', bg: 'bg-violet-50' },
  academic: { label: 'Án Lệ', emoji: '📚', bg: 'bg-amber-50' },
};

const STATUS_META: Record<Post['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; dot: string }> = {
  pending: { label: 'Chờ duyệt', variant: 'outline', dot: 'bg-amber-400' },
  approved: { label: 'Đã đăng', variant: 'default', dot: 'bg-emerald-400' },
  rejected: { label: 'Đã huỷ', variant: 'secondary', dot: 'bg-slate-300' },
  failed: { label: 'Lỗi', variant: 'destructive', dot: 'bg-red-400' },
  awaiting_feedback: { label: 'Chờ góp ý', variant: 'outline', dot: 'bg-sky-400' },
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function DailyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openLang, setOpenLang] = useState<'vi' | 'en'>('vi');
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadingRef = useRef(false);
  const load = useCallback(async (silent = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!silent) setLoading(true);
    try { const res = await fetch('/api/ai/daily/posts'); const d = await res.json(); if (d.success) setPosts(d.data); else if (!silent) toast.error(d.message || 'Lỗi'); }
    catch { if (!silent) toast.error('Lỗi kết nối'); }
    finally { loadingRef.current = false; if (!silent) setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(() => load(true), 30000); return () => clearInterval(t); }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try { const res = await fetch('/api/ai/daily/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) }); const d = await res.json(); if (d.success) { toast.success(action === 'approve' ? 'Đã đăng!' : 'Đã huỷ'); load(); } else toast.error(d.message || 'Thất bại'); }
    catch { toast.error('Lỗi kết nối'); }
    finally { setBusyId(null); }
  };

  const sendNow = async () => {
    if (sending) return;
    setSending(true);
    const toastId = toast.loading('Đang khởi chạy viết 3 bài...');
    try {
      const res = await fetch('/api/ai/daily/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force: true }) });
      const d = await res.json();
      if (d.success) {
        toast.success('Đang viết 3 bài — vài phút nữa sẽ hiện trên Telegram!', { id: toastId, duration: 8000 });
        setTimeout(() => load(true), 45000);
      } else {
        toast.error(d.message || 'Lỗi khởi chạy', { id: toastId });
      }
    } catch {
      toast.error('Lỗi kết nối server', { id: toastId });
    } finally {
      setTimeout(() => setSending(false), 10000);
    }
  };

  const byDate = useMemo(() => { const m = new Map<string, Post[]>(); for (const p of posts) { const arr = m.get(p.runDate) || []; arr.push(p); m.set(p.runDate, arr); } return m; }, [posts]);

  const monthPosts = useMemo(() => posts.filter((p) => { const d = new Date(p.createdAt); return d.getFullYear() === viewMonth.getFullYear() && d.getMonth() === viewMonth.getMonth(); }), [posts, viewMonth]);
  const stats = useMemo(() => ({
    total: monthPosts.length,
    pending: monthPosts.filter((p) => p.status === 'pending' || p.status === 'awaiting_feedback').length,
    approved: monthPosts.filter((p) => p.status === 'approved').length,
    issues: monthPosts.filter((p) => p.status === 'failed' || p.status === 'rejected').length,
  }), [monthPosts]);

  const cells = useMemo(() => {
    const y = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const startOffset = (new Date(y, mo, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const today = dateKey(new Date());
    const out: Array<{ key: string; day: number; isToday: boolean } | null> = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) { const key = dateKey(new Date(y, mo, d)); out.push({ key, day: d, isToday: key === today }); }
    while (out.length % 7) out.push(null);
    return out;
  }, [viewMonth]);

  const visiblePosts = useMemo(() => (selectedDate ? posts.filter((p) => p.runDate === selectedDate) : posts), [posts, selectedDate]);

  const STAT_ITEMS = [
    { icon: FileText, label: 'Bài trong tháng', value: stats.total },
    { icon: Clock3, label: 'Chờ duyệt', value: stats.pending },
    { icon: CheckCircle2, label: 'Đã đăng', value: stats.approved },
    { icon: AlertTriangle, label: 'Lỗi / Huỷ', value: stats.issues },
  ];

  return (
    <div className="space-y-6">
      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Bài Mỗi Ngày</h1>
          <p className="text-sm text-muted-foreground">Cron 7h sáng — ⚖️ Hình Sự · 👨‍👩‍👧 Gia Đình · 📚 Án Lệ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Làm mới
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-[#9b6f45] hover:bg-[#85603a]" disabled={sending}>
                <Sparkles className="w-3.5 h-3.5" /> Viết 3 bài ngay
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận viết 3 bài?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hệ thống sẽ tự viết 3 bài (Hình sự, Gia đình, Án lệ), tạo ảnh bìa và gửi Telegram. Quá trình mất ~5 phút, tốn credit FPT Cloud.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction className="bg-[#9b6f45] hover:bg-[#85603a]" onClick={sendNow}>
                  <Sparkles className="w-3.5 h-3.5" /> Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_ITEMS.map((s) => (
          <Card key={s.label} className="py-4">
            <CardContent className="flex items-center gap-3.5 py-0">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                <p className="text-xl font-bold leading-tight">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══ CALENDAR + QUEUE ══ */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#9b6f45]" />
                {MONTHS_VI[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setViewMonth(new Date()); setSelectedDate(null); }}>Hôm nay</Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop grid */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((w) => <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{w}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((c, i) => {
                  if (!c) return <div key={`e${i}`} />;
                  const dayPosts = byDate.get(c.key) || [];
                  const isSel = selectedDate === c.key;
                  return (
                    <button key={c.key} onClick={() => setSelectedDate(isSel ? null : c.key)} className={`relative min-h-[56px] rounded-lg border p-1.5 text-left transition-all ${isSel ? 'border-[#9b6f45] bg-[#9b6f45]/5 ring-1 ring-[#9b6f45]/20' : dayPosts.length ? 'border-border hover:border-[#9b6f45]/40 hover:bg-accent/50' : 'border-transparent hover:bg-muted/50'}`}>
                      <span className={`text-xs font-medium ${c.isToday ? 'w-5 h-5 flex items-center justify-center rounded-full bg-foreground text-background' : 'text-muted-foreground'}`}>{c.day}</span>
                      <div className="mt-1 flex gap-0.5">{dayPosts.slice(0, 4).map((p) => <span key={p._id} className={`w-1.5 h-1.5 rounded-full ${STATUS_META[p.status].dot}`} />)}</div>
                      {dayPosts.length > 4 && <p className="text-[9px] text-muted-foreground">+{dayPosts.length - 4}</p>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden space-y-1.5">
              {Array.from(byDate.entries()).filter(([key]) => { const d = new Date(key); return d.getFullYear() === viewMonth.getFullYear() && d.getMonth() === viewMonth.getMonth(); }).sort(([a], [b]) => b.localeCompare(a)).map(([key, dayPosts]) => (
                <button key={key} onClick={() => setSelectedDate(selectedDate === key ? null : key)} className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedDate === key ? 'border-[#9b6f45] bg-[#9b6f45]/5' : 'border-border hover:bg-accent/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${key === dateKey(new Date()) ? 'text-[#9b6f45]' : ''}`}>{key.split('-').reverse().join('/')}</span>
                    <div className="flex gap-1">{dayPosts.map((p) => <span key={p._id} className={`w-2 h-2 rounded-full ${STATUS_META[p.status].dot}`} />)}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{dayPosts.length} bài</span>
                </button>
              ))}
            </div>

            <Separator className="mt-4" />
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {Object.entries(STATUS_META).map(([k, v]) => <span key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={`w-2 h-2 rounded-full ${v.dot}`} /> {v.label}</span>)}
              <span className="text-[10px] text-muted-foreground/50 ml-auto hidden sm:inline">Bấm ngày để lọc</span>
            </div>
          </CardContent>
        </Card>

        {/* Today queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Send className="w-4 h-4 text-[#9b6f45]" /> Hôm nay</CardTitle>
            <CardDescription>{dateKey(new Date())}</CardDescription>
          </CardHeader>
          <CardContent>
            {(byDate.get(dateKey(new Date())) || []).length === 0 ? (
              <div className="py-8 text-center">
                <Send className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Chưa có bài hôm nay</p>
                <p className="text-[11px] text-muted-foreground/50 mt-1">Cron 7h hoặc bấm &quot;Viết 3 bài ngay&quot;</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(byDate.get(dateKey(new Date())) || []).map((p) => (
                  <div key={p._id} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                    <div className={`w-8 h-8 rounded-lg ${PLAN_META[p.plan].bg} flex items-center justify-center text-sm`}>{PLAN_META[p.plan].emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{p.article?.titleVi || p.topic}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[p.status].dot}`} />
                        <span className="text-[10px] text-muted-foreground">{STATUS_META[p.status].label}</span>
                        {p.sentAt && <span className="text-[10px]" title="Đã gửi TG">📱</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══ POST LIST ══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {selectedDate ? `Ngày ${selectedDate.split('-').reverse().join('/')}` : 'Tất cả bài'}
            <span className="text-muted-foreground font-normal ml-1">({visiblePosts.length})</span>
          </h2>
          {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Bỏ lọc</button>}
        </div>

        {!loading && !posts.length && (
          <Card className="border-dashed"><CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Chưa có bài nào</p>
          </CardContent></Card>
        )}

        {loading && !posts.length && (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="py-4"><div className="flex gap-4"><div className="w-28 h-16 rounded-lg bg-muted" /><div className="flex-1 space-y-2"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-2/3" /><div className="h-3 bg-muted rounded w-1/2" /></div></div></CardContent></Card>)}</div>
        )}

        {visiblePosts.map((p) => {
          const plan = PLAN_META[p.plan];
          const st = STATUS_META[p.status];
          const isOpen = openId === p._id;
          return (
            <Card key={p._id} className="overflow-hidden">
              <CardContent className="py-4">
                <div className="flex gap-4">
                  {/* Cover */}
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt="" className="w-28 h-16 object-cover rounded-lg border flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg ${plan.bg} flex items-center justify-center text-sm`}>{plan.emoji}</div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{plan.emoji} {plan.label}</Badge>
                      <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                      {p.sentAt && <Badge variant="outline" className="text-[10px]">📱 TG</Badge>}
                      {p.version > 1 && <Badge variant="outline" className="text-[10px]">v{p.version}</Badge>}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold mt-1.5 line-clamp-1">{p.article?.titleVi || p.topic}</p>

                    {/* Subtitle */}
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.article?.titleEn && <p className="text-[11px] text-muted-foreground truncate flex-1">{p.article.titleEn}</p>}
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{p.runDate.split('-').reverse().join('/')}</span>
                    </div>

                    {p.feedback && <p className="text-[11px] text-sky-500 mt-1 truncate">✏️ {p.feedback}</p>}
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0">
                    {p.article && p.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-[#9b6f45] hover:bg-[#85603a]" disabled={busyId === p._id} onClick={() => act(p._id, 'approve')}>
                          {busyId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Duyệt
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busyId === p._id} onClick={() => act(p._id, 'reject')}>
                          <X className="w-3 h-3" /> Huỷ
                        </Button>
                      </>
                    )}
                    {p.status === 'approved' && p.casestudySlug && (
                      <a href={`/case-studies/${p.casestudySlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Xem
                      </a>
                    )}
                    {p.article && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpenId(isOpen ? null : p._id)}>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> {isOpen ? 'Gọn' : 'Xem'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mobile actions */}
                {p.article && (
                  <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t">
                    {p.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-8 text-xs bg-[#9b6f45] hover:bg-[#85603a] flex-1" disabled={busyId === p._id} onClick={() => act(p._id, 'approve')}>
                          {busyId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Duyệt
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" disabled={busyId === p._id} onClick={() => act(p._id, 'reject')}><X className="w-3 h-3" /></Button>
                      </>
                    )}
                    {p.status === 'approved' && p.casestudySlug && <a href={`/case-studies/${p.casestudySlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Xem</a>}
                    <Button size="sm" variant="ghost" className="h-8 text-xs ml-auto" onClick={() => setOpenId(isOpen ? null : p._id)}>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> {isOpen ? 'Gọn' : 'Xem'}
                    </Button>
                  </div>
                )}
              </CardContent>

              {/* Expanded */}
              {isOpen && p.article && (
                <div className="border-t bg-muted/30">
                  <div className="px-6 pt-4">
                    <Tabs value={openLang} onValueChange={(v) => setOpenLang(v as 'vi' | 'en')}>
                      <TabsList className="w-fit">
                        <TabsTrigger value="vi">🇻🇳 Tiếng Việt</TabsTrigger>
                        <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="px-6 py-4 max-h-[500px] overflow-y-auto">
                    <MermaidRenderer className="prose prose-sm prose-slate max-w-none [&_a]:text-[#9b6f45] [&_a]:underline" html={openLang === 'vi' ? p.article.contentVi : p.article.contentEn} />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
