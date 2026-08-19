'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import MermaidRenderer from '@/components/MermaidRenderer';
import { toast } from 'react-hot-toast';
import { RefreshCw, Loader2, Check, X, ChevronDown, CalendarClock, ExternalLink, Send } from 'lucide-react';

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

const PLAN_META: Record<Post['plan'], { label: string; emoji: string }> = {
  criminal: { label: 'Luật Hình Sự', emoji: '⚖️' },
  family: { label: 'Luật Gia Đình', emoji: '👨‍👩‍👧' },
  academic: { label: 'Phân Tích Án Lệ', emoji: '📚' },
};

const STATUS_META: Record<Post['status'], { label: string; cls: string }> = {
  pending: { label: '🕓 Chờ duyệt', cls: 'bg-amber-50 text-[#9b6f45] border-amber-200' },
  approved: { label: '✅ Đã đăng', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '🗑 Đã huỷ', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  failed: { label: '❌ Lỗi', cls: 'bg-red-50 text-red-600 border-red-200' },
  awaiting_feedback: { label: '✏️ Chờ góp ý (TG)', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
};

export default function DailyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openLang, setOpenLang] = useState<'vi' | 'en'>('vi');

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
    const t = setInterval(load, 30000); // tự refresh 30s — thấy ngay bài mới viết xong
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
      if (d.success) toast.success('Đang viết 3 bài nền — chờ vài phút sẽ hiện ở đây + Telegram');
    } catch {
      toast.error('Lỗi');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bài Mỗi Ngày</h1>
          <p className="text-sm text-slate-500">
            Xưởng tự viết 7h sáng: ⚖️ Hình Sự · 👨‍👩‍👧 Gia Đình · 📚 Án Lệ — duyệt ở đây hoặc trên Telegram
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Làm mới
          </Button>
          <Button size="sm" className="h-8 text-xs bg-[#9b6f45] hover:bg-[#85603a]" onClick={sendNow}>
            <Send className="w-3.5 h-3.5" /> Viết 3 bài ngay
          </Button>
        </div>
      </div>

      {!loading && !posts.length && (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
          Chưa có bài nào. Bấm &quot;Viết 3 bài ngay&quot; hoặc chờ cron 7h sáng (hoặc /now trên Telegram).
        </div>
      )}

      {posts.map((p) => {
        const plan = PLAN_META[p.plan];
        const st = STATUS_META[p.status];
        const isOpen = openId === p._id;
        return (
          <div key={p._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 flex gap-4">
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt="" className="w-28 h-[63px] object-cover rounded-lg border border-slate-100 flex-shrink-0" />
              ) : (
                <div className="w-28 h-[63px] rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 text-xs flex-shrink-0">
                  chưa có ảnh
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-slate-500">{plan.emoji} {plan.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                  {p.version > 1 && <span className="text-[11px] text-blue-500">🔁 v{p.version}</span>}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> {p.runDate}
                  </span>
                  {p.article?.quality?.judge && (
                    <span className="text-[11px] text-slate-400">
                      Judge {p.article.quality.judge.en?.score}/{p.article.quality.judge.vi?.score}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {p.article?.titleVi || p.topic}
                </p>
                {p.article?.titleEn && <p className="text-xs text-slate-400 truncate">{p.article.titleEn}</p>}
                {p.feedback && (
                  <p className="text-[11px] text-blue-500 mt-1 truncate">✏️ Góp ý: {p.feedback}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {p.article && (
                  <>
                    {p.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-[#9b6f45] hover:bg-[#85603a]" disabled={busyId === p._id} onClick={() => act(p._id, 'approve')}>
                          {busyId === p._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Duyệt &amp; đăng
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busyId === p._id} onClick={() => act(p._id, 'reject')}>
                          <X className="w-3 h-3" /> Huỷ
                        </Button>
                      </>
                    )}
                    {p.status === 'approved' && p.casestudySlug && (
                      <a href={`/case-studies/${p.casestudySlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1 justify-end">
                        Xem bài <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpenId(isOpen ? null : p._id)}>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> {isOpen ? 'Thu gọn' : 'Xem bài'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isOpen && p.article && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center gap-1 mb-3">
                  {(['vi', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setOpenLang(l)}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${openLang === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
                <MermaidRenderer
                  className="text-sm text-slate-700 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-200 [&_blockquote]:pl-3 [&_a]:text-[#9b6f45] [&_a]:underline"
                  html={openLang === 'vi' ? p.article.contentVi : p.article.contentEn}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
