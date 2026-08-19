'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

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
}

const PLAN_META: Record<Post['plan'], { label: string; emoji: string; dot: string }> = {
  criminal: { label: 'Hình Sự', emoji: '⚖️', dot: 'bg-blue-400' },
  family: { label: 'Gia Đình', emoji: '👨‍👩‍👧', dot: 'bg-violet-400' },
  academic: { label: 'Án Lệ', emoji: '📚', dot: 'bg-amber-400' },
};

const STATUS_META: Record<Post['status'], { label: string; cls: string; dot: string }> = {
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-[#9b6f45] border-amber-200/70', dot: 'bg-amber-400' },
  approved: { label: 'Đã đăng', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200/70', dot: 'bg-emerald-400' },
  rejected: { label: 'Đã huỷ', cls: 'bg-slate-100 text-slate-400 border-slate-200/70', dot: 'bg-slate-300' },
  failed: { label: 'Lỗi', cls: 'bg-red-50 text-red-500 border-red-200/70', dot: 'bg-red-400' },
  awaiting_feedback: { label: 'Chờ góp ý', cls: 'bg-sky-50 text-sky-600 border-sky-200/70', dot: 'bg-sky-400' },
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function DailyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openLang, setOpenLang] = useState<'vi' | 'en'>('vi');
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/daily/posts');
      const d = await res.json();
      if (d.success) setPosts(d.data);
    } catch {
      toast.error('Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const res = await fetch('/api/ai/daily/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(action === 'approve' ? 'Đã đăng bài lên web!' : 'Đã huỷ bài');
        load();
      } else toast.error(d.message || 'Thất bại');
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setBusyId(null);
    }
  };

  const sendNow = async () => {
    try {
      const res = await fetch('/api/ai/daily/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Đang viết 3 bài nền — vài phút nữa sẽ hiện ở đây + Telegram');
        setTimeout(load, 45000);
      }
    } catch {
      toast.error('Lỗi');
    }
  };

  // gộp bài theo ngày
  const byDate = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of posts) {
      const arr = m.get(p.runDate) || [];
      arr.push(p);
      m.set(p.runDate, arr);
    }
    return m;
  }, [posts]);

  const monthPosts = useMemo(
    () => posts.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getFullYear() === viewMonth.getFullYear() && d.getMonth() === viewMonth.getMonth();
    }),
    [posts, viewMonth]
  );
  const stats = useMemo(() => ({
    total: monthPosts.length,
    pending: monthPosts.filter((p) => p.status === 'pending' || p.status === 'awaiting_feedback').length,
    approved: monthPosts.filter((p) => p.status === 'approved').length,
    issues: monthPosts.filter((p) => p.status === 'failed' || p.status === 'rejected').length,
  }), [monthPosts]);

  // lưới lịch (tuần bắt đầu T2)
  const cells = useMemo(() => {
    const y = viewMonth.getFullYear();
    const mo = viewMonth.getMonth();
    const first = new Date(y, mo, 1);
    const startOffset = (first.getDay() + 6) % 7; // T2=0
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const today = dateKey(new Date());
    const out: Array<{ key: string; day: number; inMonth: boolean; isToday: boolean } | null> = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(new Date(y, mo, d));
      out.push({ key, day: d, inMonth: true, isToday: key === today });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewMonth]);

  const visiblePosts = useMemo(
    () => (selectedDate ? posts.filter((p) => p.runDate === selectedDate) : posts),
    [posts, selectedDate]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Bài Mỗi Ngày</h1>
          <p className="text-sm text-slate-400">
            Xưởng tự viết 7h sáng — ⚖️ Hình Sự · 👨‍👩‍👧 Gia Đình · 📚 Án Lệ · duyệt ở đây hoặc Telegram
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Làm mới
          </Button>
          <Button size="sm" className="h-9 text-xs bg-[#9b6f45] hover:bg-[#85603a] rounded-xl" onClick={sendNow}>
            <Sparkles className="w-3.5 h-3.5" /> Viết 3 bài ngay
          </Button>
        </div>
      </div>

      {/* Bento: 4 ô thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Bài trong tháng', value: stats.total, cls: 'text-slate-700', bg: 'bg-slate-50' },
          { icon: Clock3, label: 'Chờ duyệt', value: stats.pending, cls: 'text-[#9b6f45]', bg: 'bg-amber-50/80' },
          { icon: CheckCircle2, label: 'Đã đăng', value: stats.approved, cls: 'text-emerald-600', bg: 'bg-emerald-50/80' },
          { icon: X, label: 'Lỗi / huỷ', value: stats.issues, cls: 'text-red-400', bg: 'bg-red-50/70' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border/60 p-4 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.cls}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              <p className="text-xl font-semibold text-slate-800 leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento: lịch + hàng đợi hôm nay */}
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Lịch */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CalendarDays className="w-4 h-4 text-[#9b6f45]" />
              {MONTHS_VI[viewMonth.getMonth()]} / {viewMonth.getFullYear()}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={() => { setViewMonth(new Date()); setSelectedDate(null); }}>
                Hôm nay
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((c, i) => {
              if (!c) return <div key={`e${i}`} />;
              const dayPosts = byDate.get(c.key) || [];
              const isSel = selectedDate === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedDate(isSel ? null : c.key)}
                  className={`relative min-h-[64px] rounded-xl border p-1.5 text-left transition-all ${
                    isSel
                      ? 'border-[#d5aa6d] bg-[#fdf6ec] shadow-[inset_0_0_0_1px_rgba(155,111,69,0.15)]'
                      : dayPosts.length
                        ? 'border-border/60 bg-white hover:border-[#d5aa6d]/60 hover:bg-[#fdf9f2]'
                        : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-medium ${c.isToday ? 'w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-white' : 'text-slate-500'}`}>
                    {c.day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <div key={p._id} className={`h-1.5 rounded-full ${STATUS_META[p.status].dot} opacity-80`} title={`${PLAN_META[p.plan].label} — ${STATUS_META[p.status].label}`} />
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[9px] text-slate-400 leading-none">+{dayPosts.length - 3}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/50">
            {Object.entries(STATUS_META).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`w-2 h-2 rounded-full ${v.dot}`} /> {v.label}
              </span>
            ))}
            <span className="text-[10px] text-slate-300 ml-auto">Bấm vào ngày để lọc danh sách</span>
          </div>
        </div>

        {/* Hàng đợi hôm nay */}
        <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <p className="text-sm font-semibold text-slate-700 mb-1">Hàng đợi hôm nay</p>
          <p className="text-[11px] text-slate-400 mb-3">{dateKey(new Date())}</p>
          {(byDate.get(dateKey(new Date())) || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-300">
              <Send className="w-5 h-5 mx-auto mb-2 opacity-40" />
              Hôm nay chưa có bài — cron 7h hoặc bấm &quot;Viết 3 bài ngay&quot;
            </div>
          ) : (
            <div className="space-y-2">
              {(byDate.get(dateKey(new Date())) || []).map((p) => (
                <div key={p._id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70">
                  <span className="text-base">{PLAN_META[p.plan].emoji}</span>
                  <p className="flex-1 text-xs text-slate-600 line-clamp-2">{p.article?.titleVi || p.topic}</p>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_META[p.status].dot}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách bài */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          {selectedDate ? `Bài ngày ${selectedDate.split('-').reverse().join('/')}` : 'Tất cả bài'}
          <span className="text-slate-400 font-normal"> ({visiblePosts.length})</span>
        </h2>
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} className="text-xs text-[#9b6f45] hover:underline">
            ✕ bỏ lọc
          </button>
        )}
      </div>

      {!loading && !posts.length && (
        <div className="bg-white rounded-2xl border border-dashed border-border p-12 text-center text-sm text-slate-400">
          Chưa có bài nào — bấm &quot;Viết 3 bài ngay&quot; hoặc chờ cron 7h sáng.
        </div>
      )}

      <div className="space-y-3">
        {visiblePosts.map((p) => {
          const plan = PLAN_META[p.plan];
          const st = STATUS_META[p.status];
          const isOpen = openId === p._id;
          return (
            <div key={p._id} className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_12px_28px_-16px_rgba(15,23,42,0.12)] transition-shadow">
              <div className="p-4 flex gap-4">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="w-28 h-[63px] object-cover rounded-xl border border-border/50 flex-shrink-0" />
                ) : (
                  <div className="w-28 h-[63px] rounded-xl bg-slate-50 border border-border/50 flex items-center justify-center text-slate-300 text-[10px] flex-shrink-0">
                    chưa có ảnh
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-slate-400">{plan.emoji} {plan.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    {p.version > 1 && <span className="text-[10px] text-sky-500">🔁 v{p.version}</span>}
                    <span className="text-[10px] text-slate-300">{p.runDate.split('-').reverse().join('/')}</span>
                    {p.article?.quality?.judge && (
                      <span className="text-[10px] text-slate-300">
                        Judge {p.article.quality.judge.en?.score}/{p.article.quality.judge.vi?.score}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{p.article?.titleVi || p.topic}</p>
                  {p.article?.titleEn && <p className="text-xs text-slate-400 truncate">{p.article.titleEn}</p>}
                  {p.feedback && <p className="text-[11px] text-sky-500 mt-1 truncate">✏️ {p.feedback}</p>}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {p.article && (
                    <>
                      {p.status === 'pending' && (
                        <>
                          <Button size="sm" className="h-7 text-xs rounded-lg bg-[#9b6f45] hover:bg-[#85603a]" disabled={busyId === p._id} onClick={() => act(p._id, 'approve')}>
                            {busyId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Duyệt &amp; đăng
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" disabled={busyId === p._id} onClick={() => act(p._id, 'reject')}>
                            <X className="w-3 h-3" /> Huỷ
                          </Button>
                        </>
                      )}
                      {p.status === 'approved' && p.casestudySlug && (
                        <a href={`/case-studies/${p.casestudySlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1 justify-end">
                          Xem bài →
                        </a>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg" onClick={() => setOpenId(isOpen ? null : p._id)}>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> {isOpen ? 'Thu gọn' : 'Xem bài'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isOpen && p.article && (
                <div className="border-t border-border/50 p-4 bg-[#faf9f6]">
                  <div className="flex items-center gap-1 mb-3">
                    {(['vi', 'en'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setOpenLang(l)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${openLang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                      </button>
                    ))}
                  </div>
                  <MermaidRenderer
                    className="text-sm text-slate-700 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-800 [&_h2]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-200 [&_blockquote]:pl-3 [&_a]:text-[#9b6f45] [&_a]:underline"
                    html={openLang === 'vi' ? p.article.contentVi : p.article.contentEn}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
