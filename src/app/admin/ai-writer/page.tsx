'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TextEditor from '@/components/TextEditor';
import ImageUploader from '@/components/cloudinaryUpload';
import MermaidRenderer from '@/components/MermaidRenderer';
import { toast } from 'react-hot-toast';
import slugify from 'slugify';
import {
  Sparkles,
  Rss,
  Link2,
  PenLine,
  Loader2,
  Save,
  Pencil,
  Eye,
  RefreshCw,
  ExternalLink,
  Globe,
  X,
  ListPlus,
  CircleCheck,
  CircleX,
  ImagePlus,
  Upload,
  ChevronDown,
  Square,
} from 'lucide-react';

/* ───────────────────────── types ───────────────────────── */
interface FeedItem {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  pubDate?: string;
  snippet?: string;
}

interface QualityReport {
  en: { flesch: number; grade: number; avgSentenceWords: number; longSentences: { text: string; words: number }[]; pass: boolean };
  vi: { avgSyllPerSentence: number; pctLongSentences: number; pctHardWords: number; longSentences: { text: string; syllables: number }[]; pass: boolean };
  legalese: { phrase: string; replacement: string; count: number; lang: 'en' | 'vi' }[];
  judge?: { en: { score: number; worst: string[] }; vi: { score: number; worst: string[] } };
  sourceCheck?: { simVi: number; simEn: number; verbatimVi: number; verbatimEn: number; flag?: boolean };
  proseIssues?: { text: string; reason: string }[];
}

interface GenResult {
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  slug: string;
  tags: string[];
  contentEn: string;
  contentVi: string;
  quality?: QualityReport;
  related?: { title: string; slug: string }[];
  source: { title: string; url: string };
}

/* ───────────────────────── constants ───────────────────── */
const MODELS = [
  { id: 'DeepSeek-V4-Flash', label: 'DeepSeek V4 Flash', note: 'Rẻ · Nhanh' },
  { id: 'GLM-5.2', label: 'GLM 5.2', note: 'Chất lượng cao' },
  { id: 'gemma-4-31B-it', label: 'Gemma 4 31B', note: 'Đa ngôn ngữ' },
];

const SUGGESTED_TOPICS = [
  'Ly hôn Úc: "chia đôi 50/50" là hiểu lầm — thay đổi quyền nuôi con từ 6/5/2024',
  'Cha mẹ Việt cần biết 6 yếu tố "lợi ích tốt nhất của con" sau cải cách Luật Gia đình 2023',
  'Vợ/chồng giấu tài sản khi ly hôn: nghĩa vụ khai báo tài sản mới từ 10/6/2025',
  'Bạo hành gia đình giờ thay đổi khoản chia tài sản: Kennon adjustment được luật hoá từ 6/2025',
  'Ai được giữ thú cưng khi chia tay? Thú cưng là tài sản theo sửa đổi Luật Gia đình 2024',
  'Thỏa thuận tài chính trước hôn nhân (BFA) có bị hủy không? Bài học từ Thorne v Kennedy',
  'Luật sư bảo vệ quyền lợi trẻ em (ICL) giờ phải gặp trực tiếp con bạn — điều đó nghĩa là gì',
  'Ly hôn khi đang giữ visa partner: cạm bẫy luật gia đình và luật di trú người Việt cần tránh',
  'Coercive control — kiểm soát tâm lý trở thành tội danh tại NSW từ 7/2024',
  'Bị cảnh sát chặn xe tại Úc: quyền của bạn — hướng dẫn cho người Việt',
  'Đồng thuận tình dục (affirmative consent) và stealthing: luật NSW từ 2022',
  'Vòng đeo GPS: theo dõi điện tử cho bị cáo bạo hành gia đình tại NSW và QLD',
  'Bail (bảo lãnh) tại NSW sau cải cách 2024-2025: show cause, unacceptable risk',
  'ACT phi hình sự hoá ma túy số lượng nhỏ từ 10/2023 — nếu bị bắt thì sao',
  'Trẻ 10 tuổi đã có thể bị truy tố hình sự tại Úc — tranh cãi nâng tuổi TNHS',
  'QLD "Adult Crime, Adult Time": khi trẻ vị thành niên chịu mức án như người lớn',
  'Hơn 340.000 người phạm tội trong một năm: số liệu tội phạm ABS 2024-25',
  'Một vụ trục xuất gian lận liên bang diễn ra thế nào: hành trình vụ án',
  'Cơ hội được ân xá sớm không dùng để giảm án: phán quyết Tòa Cấp cao về s 19ALB',
  'Ủy ban điều tra bạo hành gia đình bang Nam Úc với 136 khuyến nghị',
];

/* ────────── Score bar ────────── */
function ScoreBar({ value, max = 100, label, good }: { value: number; max?: number; label: string; good: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold tabular-nums ${good ? 'text-emerald-600' : 'text-amber-600'}`}>
          {value}{max !== 100 ? '' : '/100'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${good ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ────────── Quality panel ────────── */
function QualityPanel({ quality: q, polishing, onPolish }: { quality: QualityReport; polishing: boolean; onPolish: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">📊 Chất lượng bài viết</CardTitle>
            <CardDescription className="text-xs">Tham khảo — quyết định cuối thuộc biên tập viên</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onPolish} disabled={polishing}>
            {polishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Sửa giọng
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-xl bg-muted/50">
            <p className="text-xs font-semibold">🇬🇧 English</p>
            <ScoreBar value={q.en.flesch} label="Flesch (dễ đọc)" good={q.en.flesch >= 60} />
            <ScoreBar value={q.en.grade} max={12} label="Grade level (≤ 9)" good={q.en.grade <= 9} />
            {q.judge && <ScoreBar value={q.judge.en.score} label="LLM Judge" good={q.judge.en.score >= 70} />}
            <p className="text-[11px] text-muted-foreground">TB {q.en.avgSentenceWords} từ/câu · {q.en.longSentences.length} câu dài</p>
          </div>
          <div className="space-y-3 p-4 rounded-xl bg-muted/50">
            <p className="text-xs font-semibold">🇻🇳 Tiếng Việt</p>
            <ScoreBar value={q.vi.avgSyllPerSentence} max={30} label="TB âm tiết/câu (≤ 22)" good={q.vi.avgSyllPerSentence <= 22} />
            <ScoreBar value={100 - q.vi.pctLongSentences} label={`Câu ngắn gọn (${q.vi.pctLongSentences}% dài)`} good={q.vi.pctLongSentences <= 20} />
            {q.judge && <ScoreBar value={q.judge.vi.score} label="LLM Judge" good={q.judge.vi.score >= 70} />}
            <p className="text-[11px] text-muted-foreground">Từ khó: {q.vi.pctHardWords}%</p>
          </div>
        </div>

        {q.sourceCheck && (
          <div className={`rounded-xl p-4 text-xs flex items-start gap-3 border ${q.sourceCheck.flag ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <span className="text-base">{q.sourceCheck.flag ? '⚠️' : '✅'}</span>
            <div>
              <p className="font-medium">{q.sourceCheck.flag ? 'Bài quá giống nguồn — sửa thêm trước khi đăng' : 'Đã viết lại đủ khác nguồn'}</p>
              <p className="mt-1 opacity-75">Tương đồng: VI {(q.sourceCheck.simVi * 100).toFixed(0)}% · EN {(q.sourceCheck.simEn * 100).toFixed(0)}% — Copy: VI {q.sourceCheck.verbatimVi}% · EN {q.sourceCheck.verbatimEn}%</p>
            </div>
          </div>
        )}

        {q.legalese.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {q.legalese.map((l) => (
              <Badge key={l.phrase} variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200">
                &quot;{l.phrase}&quot; → &quot;{l.replacement}&quot; ×{l.count}
              </Badge>
            ))}
          </div>
        )}

        {(q.proseIssues?.length || q.judge?.en?.worst?.length) ? (
          <>
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            </button>
            {expanded && (
              <div className="space-y-2 text-[11px] text-muted-foreground">
                {q.proseIssues?.slice(0, 5).map((p, i) => <p key={i}>✍️ &quot;{p.text.slice(0, 70)}&quot; — {p.reason}</p>)}
                {q.judge?.en?.worst?.map((w, i) => <p key={`e${i}`}>🇬🇧 {w.slice(0, 120)}</p>)}
                {q.judge?.vi?.worst?.map((w, i) => <p key={`v${i}`}>🇻🇳 {w.slice(0, 120)}</p>)}
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function AIWriterPage() {
  const [mode, setMode] = useState<'topic' | 'url' | 'feeds' | 'batch'>('topic');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [angle, setAngle] = useState('');
  const [model, setModel] = useState('DeepSeek-V4-Flash');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [enHtml, setEnHtml] = useState('');
  const [viHtml, setViHtml] = useState('');
  const [result, setResult] = useState<GenResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [previewTab, setPreviewTab] = useState<'vi' | 'en'>('vi');
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'draft' | 'published'>('draft');
  const [categories, setCategories] = useState<{ _id: string; name: { en: string; vi?: string } }[]>([]);
  const [me, setMe] = useState<{ _id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverVariant, setCoverVariant] = useState(0);
  const [autoCover, setAutoCover] = useState(true);
  const [coverExtras, setCoverExtras] = useState<{ ogUrl: string; feedUrl: string } | null>(null);
  const [usage, setUsage] = useState<{ month: { costUsd: number; calls: number }; allTime: { costUsd: number } } | null>(null);
  const [batchText, setBatchText] = useState('');
  const [batchItems, setBatchItems] = useState<{ topic: string; status: 'pending' | 'running' | 'done' | 'error'; note?: string; slug?: string }[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const batchItemsRef = useRef(batchItems);
  batchItemsRef.current = batchItems;

  useEffect(() => {
    (async () => {
      try {
        const [catRes, meRes] = await Promise.all([fetch('/api/categories'), fetch('/api/auth/me')]);
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
        const meData = await meRes.json();
        if (meData.success) setMe(meData.user);
      } catch { toast.error('Không tải được danh mục / thông tin người dùng'); }
    })();
    fetch('/api/ai/usage').then((r) => r.json()).then((d) => d.success && setUsage(d.data)).catch(() => {});
  }, []);

  const loadFeeds = useCallback(async () => {
    setLoadingFeeds(true);
    try {
      const res = await fetch('/api/ai/suggestions');
      const data = await res.json();
      if (data.success) { setFeeds(data.data); if (!data.data?.length) toast.success('Không có tin mới'); }
      else toast.error(data.message || 'Lỗi tải đề xuất');
    } catch { toast.error('Lỗi kết nối'); }
    finally { setLoadingFeeds(false); }
  }, []);

  const dismissFeedItem = async (link: string) => {
    setFeeds((p) => p.filter((f) => f.link !== link));
    try { await fetch('/api/ai/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link, action: 'dismiss' }) }); } catch {}
  };

  useEffect(() => { if (mode === 'feeds' && !feeds.length && !loadingFeeds) loadFeeds(); }, [mode, feeds.length, loadingFeeds, loadFeeds]);

  const pickFeedItem = (item: FeedItem) => { setMode('url'); setUrl(item.link); setTopic(''); toast.success(`Đã chọn: ${item.title.slice(0, 60)}...`); };
  const stopGeneration = () => { abortRef.current?.abort(); setGenerating(false); setStatus('Đã dừng.'); };

  const runGenerateStream = async (body: Record<string, unknown>, handlers: { onStatus?: (m: string) => void; onEn?: (t: string) => void; onVi?: (t: string) => void }, signal?: AbortSignal): Promise<GenResult> => {
    const res = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
    if (!res.ok || !res.body) { const err = await res.json().catch(() => ({ message: 'Lỗi server' })); throw new Error(err.message || `Lỗi ${res.status}`); }
    const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let finalData: GenResult | null = null;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n\n'); buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim(); if (!trimmed.startsWith('data:')) continue;
        try { const evt = JSON.parse(trimmed.slice(5).trim()); if (evt.type === 'status') handlers.onStatus?.(evt.message); else if (evt.type === 'en') handlers.onEn?.(evt.text); else if (evt.type === 'vi') handlers.onVi?.(evt.text); else if (evt.type === 'done') finalData = evt.data as GenResult; else if (evt.type === 'error') throw new Error(evt.message); }
        catch (parseErr) { if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) throw parseErr; }
      }
    }
    if (!finalData) throw new Error('Pipeline không trả kết quả'); return finalData;
  };

  const runBatch = async () => {
    if (!me?._id) return toast.error('Cần đăng nhập');
    if (!category) return toast.error('Chọn danh mục trước');
    const topics = batchText.split('\n').map((t) => t.trim()).filter((t) => t.length > 10);
    if (!topics.length) return toast.error('Nhập ít nhất 1 đề bài');
    if (topics.length > 10) return toast.error('Tối đa 10 đề mỗi loạt');
    const cat = categories.find((c) => c._id === category);
    const catLabel = cat?.name?.vi || cat?.name?.en || 'Luật Úc';
    setBatchRunning(true); setBatchItems(topics.map((t) => ({ topic: t, status: 'pending' as const })));
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const patch = (p: Partial<(typeof batchItems)[number]>) => setBatchItems((prev) => prev.map((x, j) => (j === i ? { ...x, ...p } : x)));
      patch({ status: 'running', note: 'Bắt đầu...' });
      try {
        const data = await runGenerateStream({ mode: 'topic', topic: t, model, length }, { onStatus: (m) => patch({ note: m }) });
        let coverUrl = '';
        if (autoCover) { patch({ note: 'Tạo ảnh bìa...' }); try { const r = await fetch('/api/ai/cover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: t, titleVi: data.titleVi, titleEn: data.titleEn, categoryLabel: catLabel, variant: Date.now() % 100000 }) }); const d = await r.json(); if (d.success) coverUrl = d.url; } catch {} }
        patch({ note: 'Lưu nháp...' }); let slug = data.slug; let saved = false; let lastErr = '';
        for (let attempt = 0; attempt < 3 && !saved; attempt++) { const res = await fetch('/api/casestudies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: { en: data.titleEn, vi: data.titleVi }, description: { en: (data.descEn || '').slice(0, 199), vi: (data.descVi || '').slice(0, 199) }, content: { en: data.contentEn, vi: data.contentVi }, slug, image: coverUrl || '/images/logo/solislaw.png', category, user: me._id, isActive: false }) }); const j = await res.json(); if (j.success) saved = true; else if ((j.message || '').includes('Slug')) slug = `${data.slug}-${attempt + 2}`; else { lastErr = j.message || 'Lỗi'; break; } }
        if (saved) patch({ status: 'done', slug, note: 'Đã lưu nháp ✓' }); else patch({ status: 'error', note: lastErr });
      } catch (e) { patch({ status: 'error', note: (e as Error).message || 'Lỗi' }); }
    }
    setBatchRunning(false);
    const okCount = batchItemsRef.current.filter((b) => b.status === 'done').length;
    const errCount = batchItemsRef.current.filter((b) => b.status === 'error').length;
    if (errCount === 0) toast.success(`Hoàn tất ${okCount} bài!`); else toast.error(`Xong ${okCount}, LỖI ${errCount} bài`);
  };

  const generate = async () => {
    if (mode === 'url' && !url.trim()) return toast.error('Nhập URL bài nguồn');
    if (mode === 'topic' && !topic.trim()) return toast.error('Nhập đề bài');
    if (mode === 'feeds') { if (!url.trim() && !topic.trim()) return toast.error('Chọn tin trước'); setMode(url.trim() ? 'url' : 'topic'); }
    const activeMode = url.trim() && mode !== 'topic' ? 'url' : 'topic';
    setGenerating(true); setResult(null); setEnHtml(''); setViHtml(''); setEditing(false); setStatus('Bắt đầu...');
    const toastId = toast.loading('Đang tạo bài viết...');
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const data = await runGenerateStream({ mode: activeMode, topic: topic.trim() || undefined, url: activeMode === 'url' ? url.trim() : undefined, angle: angle.trim() || undefined, model, length }, { onStatus: (m) => { setStatus(m); toast.loading(m, { id: toastId }); }, onEn: (t) => setEnHtml((p) => p + t), onVi: (t) => setViHtml((p) => p + t) }, controller.signal);
      setResult(data); setEnHtml(data.contentEn || ''); setViHtml(data.contentVi || '');
      if (autoCover) { setStatus('Bài xong! Tạo ảnh bìa...'); toast.loading('Tạo ảnh bìa...', { id: toastId }); const ok = await runCoverGeneration(data); setStatus(ok ? 'Hoàn tất!' : 'Xong bài (ảnh bìa lỗi).'); }
      toast.success('Bài viết đã hoàn tất!', { id: toastId }); setStatus('Hoàn tất!');
    } catch (e) { if ((e as Error).name !== 'AbortError') { toast.error((e as Error).message || 'Lỗi tạo bài', { id: toastId }); setStatus('Lỗi: ' + (e as Error).message); } else { toast.dismiss(toastId); } }
    finally { setGenerating(false); abortRef.current = null; }
  };

  const handleSave = async () => {
    if (!result) return;
    const checks: [boolean, string][] = [[!!result.titleVi && !!result.titleEn, 'Tiêu đề'], [!!result.descVi && !!result.descEn, 'Mô tả'], [!!result.contentVi && !!result.contentEn, 'Nội dung'], [!!result.slug, 'Slug'], [!!category, 'Danh mục'], [!!image, 'Ảnh bìa'], [!!me, 'Tác giả']];
    const missing = checks.find(([ok]) => !ok);
    if (missing) return toast.error(`Thiếu: ${missing[1]}`);
    if (result.descVi.length > 200 || result.descEn.length > 200) return toast.error('Mô tả quá 200 ký tự');
    setSaving(true);
    try {
      const res = await fetch('/api/casestudies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: { en: result.titleEn, vi: result.titleVi }, description: { en: result.descEn, vi: result.descVi }, content: { en: result.contentEn, vi: result.contentVi }, slug: result.slug, image, category, user: me!._id, isActive: saveStatus === 'published', publishedAt: saveStatus === 'published' ? new Date() : undefined }) });
      const data = await res.json();
      if (data.success) toast.success(saveStatus === 'published' ? 'Đã xuất bản!' : 'Đã lưu nháp!');
      else toast.error(data.message || 'Lưu thất bại');
    } catch { toast.error('Không thể kết nối server'); }
    finally { setSaving(false); }
  };

  const runCoverGeneration = async (data: { titleVi: string; titleEn?: string }): Promise<boolean> => {
    if (!data.titleVi) { toast.error('Cần tiêu đề'); return false; }
    setCoverLoading(true);
    try {
      const cat = categories.find((c) => c._id === category);
      setCoverVariant((p) => p + 1);
      const res = await fetch('/api/ai/cover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: topic || data.titleVi, titleVi: data.titleVi, titleEn: data.titleEn, categoryLabel: cat?.name?.vi || cat?.name?.en || 'Luật Úc', variant: (coverVariant + 1) % 100000 }) });
      const d = await res.json();
      if (d.success) { setImage(d.url); setCoverExtras({ ogUrl: d.ogUrl, feedUrl: d.feedUrl }); toast.success('Đã tạo ảnh bìa!'); return true; }
      toast.error(d.message || 'Tạo ảnh thất bại'); return false;
    } catch { toast.error('Lỗi kết nối'); return false; }
    finally { setCoverLoading(false); }
  };

  const updateResult = (patch: Partial<GenResult>) => setResult((p) => (p ? { ...p, ...patch } : p));
  const buildFeedback = (q?: QualityReport): string => {
    if (!q) return '';
    const parts: string[] = [];
    const legalese = q.legalese.map((l) => `"${l.phrase}" → "${l.replacement}" (x${l.count}, ${l.lang.toUpperCase()})`);
    if (legalese.length) parts.push(`Replace:\n${legalese.join('\n')}`);
    const longEn = q.en.longSentences.slice(0, 3).map((s) => `"${s.text}..." (${s.words}w)`);
    if (longEn.length) parts.push(`EN too long:\n${longEn.join('\n')}`);
    return parts.join('\n\n');
  };
  const polishVoice = async () => {
    if (!result) return; setPolishing(true);
    try {
      const res = await fetch('/api/ai/polish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentEn: result.contentEn, contentVi: result.contentVi, feedback: buildFeedback(result.quality) }) });
      const data = await res.json();
      if (data.success) { updateResult({ contentEn: data.data.contentEn, contentVi: data.data.contentVi, quality: data.data.quality }); setEnHtml(data.data.contentEn); setViHtml(data.data.contentVi); toast.success('Đã sửa giọng!'); }
      else toast.error(data.message || 'Sửa thất bại');
    } catch { toast.error('Lỗi kết nối'); }
    finally { setPolishing(false); }
  };

  const previewHtml = result ? (previewTab === 'vi' ? result.contentVi : result.contentEn) : (previewTab === 'vi' ? viHtml : enHtml);
  const editingContent = previewTab === 'vi' ? result?.contentVi : result?.contentEn;
  const hasResult = !!(viHtml || enHtml || result);

  return (
    <div className="space-y-6">
      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Writer</h1>
          <p className="text-sm text-muted-foreground">Viết bài song ngữ Anh – Việt bằng FPT AI</p>
        </div>
        {usage && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline">💰 ${usage.month.costUsd.toFixed(3)} / {usage.month.calls} lượt</Badge>
            {result?.source?.url && (
              <a href={result.source.url} target="_blank" rel="noopener noreferrer" className="text-[#9b6f45] hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Nguồn
              </a>
            )}
          </div>
        )}
      </div>

      {/* ══ MAIN GRID ══ */}
      <div className="grid xl:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── CỘT TRÁI: INPUT ── */}
        <Card>
          <CardContent className="space-y-5 pt-6">
            {/* Mode tabs */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <TabsList className="w-full">
                <TabsTrigger value="topic"><PenLine className="w-3.5 h-3.5" /> Đề bài</TabsTrigger>
                <TabsTrigger value="url"><Link2 className="w-3.5 h-3.5" /> URL</TabsTrigger>
                <TabsTrigger value="feeds"><Rss className="w-3.5 h-3.5" /> Tin mới</TabsTrigger>
                <TabsTrigger value="batch"><ListPlus className="w-3.5 h-3.5" /> Loạt</TabsTrigger>
              </TabsList>

              <TabsContent value="topic" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label>Đề bài (tiếng Việt hoặc Anh)</Label>
                  <Textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Quyền nuôi con sau cải cách Luật Gia đình 2024..." className="resize-none" />
                </div>
                <details className="text-xs group">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                    💡 {SUGGESTED_TOPICS.length} đề bài gợi ý
                  </summary>
                  <div className="mt-2 max-h-52 overflow-y-auto space-y-0.5">
                    {SUGGESTED_TOPICS.map((t, i) => (
                      <button key={i} onClick={() => setTopic(t)} className="w-full text-left px-3 py-2 rounded-lg text-[11px] leading-snug text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        {i + 1}. {t}
                      </button>
                    ))}
                  </div>
                </details>
              </TabsContent>

              <TabsContent value="url" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label>URL bài nguồn</Label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                  <p className="text-[11px] text-muted-foreground">AI đọc bài gốc, phân tích rồi viết lại 100% mới.</p>
                </div>
              </TabsContent>

              <TabsContent value="feeds" className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Đề xuất mới ({feeds.length})</Label>
                  <Button variant="ghost" size="sm" onClick={loadFeeds} disabled={loadingFeeds}>
                    {loadingFeeds ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Quét
                  </Button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1.5">
                  {loadingFeeds && !feeds.length && <div className="py-8 text-center text-sm text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Đang quét...</div>}
                  {!loadingFeeds && !feeds.length && <div className="py-6 text-center text-xs text-muted-foreground">Không có tin mới</div>}
                  {feeds.map((f, i) => (
                    <div key={`${f.link}-${i}`} className="group relative p-3 rounded-xl border hover:border-[#d5aa6d] hover:bg-accent/50 transition-all">
                      <button onClick={() => pickFeedItem(f)} className="w-full text-left pr-7">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{f.sourceName}</p>
                        <p className="text-xs font-medium line-clamp-2 mt-0.5">{f.title}</p>
                      </button>
                      <button onClick={() => dismissFeedItem(f.link)} title="Bỏ qua" className="absolute top-2.5 right-2.5 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="batch" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label>Nhiều đề — mỗi dòng 1 đề (tối đa 10)</Label>
                  <Textarea rows={4} value={batchText} onChange={(e) => setBatchText(e.target.value)} placeholder={'Quyền nuôi con...\nCoercive control...\nBail tại NSW...'} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label>Danh mục (dùng chung cả loạt)</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name?.vi || c.name?.en}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {batchItems.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {batchItems.map((b, i) => (
                      <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs border ${b.status === 'done' ? 'border-emerald-200 bg-emerald-50' : b.status === 'error' ? 'border-destructive/30 bg-destructive/5' : b.status === 'running' ? 'border-amber-200 bg-amber-50' : 'border-border'}`}>
                        {b.status === 'done' ? <CircleCheck className="w-4 h-4 text-emerald-600 mt-0.5" /> : b.status === 'error' ? <CircleX className="w-4 h-4 text-destructive mt-0.5" /> : b.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-[#9b6f45] mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground mt-0.5" />}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium line-clamp-1">{b.topic}</p>
                          <p className="text-muted-foreground mt-0.5">{b.status === 'done' && b.slug ? <a href={`/case-studies/${b.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#9b6f45] hover:underline">/{b.slug} ↗</a> : b.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Angle (not batch) */}
            {mode !== 'batch' && (
              <div className="space-y-2">
                <Label>Yêu cầu thêm (tuỳ chọn)</Label>
                <Input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="VD: nhấn mạnh cho người Việt mới định cư..." />
              </div>
            )}

            <Separator />

            {/* Model + Length */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id} textValue={m.label}>
                        <div className="flex flex-col">
                          <span>{m.label}</span>
                          <span className="text-[11px] text-muted-foreground">{m.note}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Độ dài</Label>
                <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short" textValue="Ngắn">Ngắn (~600 từ)</SelectItem>
                    <SelectItem value="medium" textValue="Vừa">Vừa (~800 từ)</SelectItem>
                    <SelectItem value="long" textValue="Dài">Dài (~1.500 từ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate button */}
            {mode === 'batch' ? (
              <Button className="w-full bg-[#9b6f45] hover:bg-[#85603a]" onClick={runBatch} disabled={batchRunning}>
                {batchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListPlus className="w-4 h-4" />}
                {batchRunning ? 'Đang chạy...' : `Chạy ${batchText.split('\n').filter((t) => t.trim().length > 10).length} đề`}
              </Button>
            ) : generating ? (
              <Button variant="destructive" className="w-full" onClick={stopGeneration}>
                <X className="w-4 h-4" /> Dừng lại
              </Button>
            ) : (
              <Button className="w-full bg-[#9b6f45] hover:bg-[#85603a]" onClick={generate}>
                <Sparkles className="w-4 h-4" /> Tạo bài viết
              </Button>
            )}

            {/* Auto cover */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-cover" className="text-xs text-muted-foreground cursor-pointer">Tự tạo ảnh bìa sau khi viết</Label>
              <Switch id="auto-cover" checked={autoCover} onCheckedChange={setAutoCover} />
            </div>

            {/* Status */}
            {status && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-2.5">
                {generating && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-[#9b6f45]" />}
                <span className="line-clamp-2">{status}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── CỘT PHẢI: KẾT QUẢ ── */}
        <div className="space-y-5">
          {/* Generating state */}
          {generating && !hasResult && (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#9b6f45] mx-auto" />
                <div>
                  <p className="text-sm font-semibold">Đang tạo bài viết...</p>
                  <p className="text-xs text-muted-foreground mt-1">{status || 'Bắt đầu...'}</p>
                </div>
                <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[#9b6f45] animate-pulse" style={{ width: '60%' }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placeholder */}
          {!hasResult && !generating && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Chọn đề bài / dán URL rồi bấm <strong className="text-foreground">Tạo bài viết</strong>
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">Bài song ngữ Anh – Việt, xem trước & chỉnh sửa tại đây</p>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {hasResult && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
                <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as 'vi' | 'en')}>
                  <TabsList>
                    <TabsTrigger value="vi">🇻🇳 Tiếng Việt</TabsTrigger>
                    <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                  </TabsList>
                </Tabs>
                {result && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} disabled={generating}>
                    {editing ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                    {editing ? 'Xem' : 'Sửa'}
                  </Button>
                )}
              </div>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-5">{result ? (previewTab === 'vi' ? result.titleVi : result.titleEn) : '...'}</h2>
                {editing && result ? (
                  <TextEditor key={previewTab} value={editingContent || ''} onChange={(v) => previewTab === 'vi' ? updateResult({ contentVi: v }) : updateResult({ contentEn: v })} />
                ) : (
                  <div className="max-h-[600px] overflow-y-auto pr-1">
                    <MermaidRenderer className="prose prose-sm prose-slate max-w-none [&_a]:text-[#9b6f45] [&_a]:underline [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:p-2" html={previewHtml || editingContent || ''} enabled={!generating} />
                  </div>
                )}
                {generating && <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><span className="w-1.5 h-5 bg-[#9b6f45] rounded-full animate-pulse" /> đang viết...</div>}
              </CardContent>
            </Card>
          )}

          {/* Quality */}
          {result?.quality && !generating && <QualityPanel quality={result.quality} polishing={polishing} onPolish={polishVoice} />}

          {/* Save panel */}
          {result && !generating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-[#9b6f45]" /> Thông tin xuất bản</CardTitle>
                <CardDescription>Kiểm tra và điều chỉnh trước khi lưu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Tiêu đề VI</Label><Input value={result.titleVi} onChange={(e) => updateResult({ titleVi: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Tiêu đề EN</Label><Input value={result.titleEn} onChange={(e) => updateResult({ titleEn: e.target.value })} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Mô tả VI <span className={result.descVi.length > 200 ? 'text-destructive' : 'text-muted-foreground'}>({result.descVi.length}/200)</span></Label><Textarea rows={2} value={result.descVi} onChange={(e) => updateResult({ descVi: e.target.value })} className="resize-none" /></div>
                  <div className="space-y-2"><Label>Mô tả EN <span className={result.descEn.length > 200 ? 'text-destructive' : 'text-muted-foreground'}>({result.descEn.length}/200)</span></Label><Textarea rows={2} value={result.descEn} onChange={(e) => updateResult({ descEn: e.target.value })} className="resize-none" /></div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2"><Label>Slug</Label><Input value={result.slug} onChange={(e) => updateResult({ slug: e.target.value })} /></div>
                  <Button variant="outline" size="sm" onClick={() => updateResult({ slug: slugify(result.titleEn, { lower: true, strict: true, trim: true }) })}>Tạo lại</Button>
                </div>

                {result.tags?.length > 0 && <div className="flex flex-wrap gap-1.5">{result.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>}

                {result.related && result.related.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">🔗 Nên link sang:</Label>
                    <div className="flex flex-wrap gap-1.5">{result.related.map((r) => <Badge key={r.slug} variant="outline" className="bg-amber-50 text-[#9b6f45] border-amber-200"><a href={`/case-studies/${r.slug}`} target="_blank" rel="noopener noreferrer">{r.title.slice(0, 50)} ↗</a></Badge>)}</div>
                  </div>
                )}

                <Separator />

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Danh mục</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name?.vi || c.name?.en}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Trạng thái</Label><Select value={saveStatus} onValueChange={(v) => setSaveStatus(v as typeof saveStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Bản nháp</SelectItem><SelectItem value="published">Xuất bản ngay</SelectItem></SelectContent></Select></div>
                </div>

                {/* Cover */}
                <div className="space-y-3">
                  <Label>Ảnh bìa</Label>
                  <Tabs defaultValue="ai">
                    <TabsList className="w-fit">
                      <TabsTrigger value="ai"><ImagePlus className="w-3 h-3" /> AI tạo</TabsTrigger>
                      <TabsTrigger value="upload"><Upload className="w-3 h-3" /> Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ai" className="mt-3">
                      <Button variant="outline" className="w-full" onClick={() => result && runCoverGeneration(result)} disabled={coverLoading || !result?.titleVi}>
                        {coverLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#9b6f45]" />}
                        {coverLoading ? 'Đang tạo...' : 'Tạo ảnh bìa AI'}
                      </Button>
                    </TabsContent>
                    <TabsContent value="upload" className="mt-3">
                      <ImageUploader onUploadSuccess={(u) => setImage(u)} />
                    </TabsContent>
                  </Tabs>
                  {image && (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Ảnh bìa" className="w-full rounded-xl border" />
                      {coverExtras && (
                        <div className="flex gap-3 text-[11px]">
                          <a href={coverExtras.ogUrl} target="_blank" rel="noopener noreferrer" className="text-[#9b6f45] hover:underline">OG 1200×630 ↗</a>
                          <a href={coverExtras.feedUrl} target="_blank" rel="noopener noreferrer" className="text-[#9b6f45] hover:underline">FB/IG 4:5 ↗</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-6">
                <p className="text-xs text-muted-foreground">Tác giả: {me?.name || '—'}</p>
                <Button className="bg-[#9b6f45] hover:bg-[#85603a]" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveStatus === 'published' ? 'Xuất bản' : 'Lưu nháp'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* FAB mobile */}
      {result && !generating && (
        <div className="fixed bottom-6 right-6 z-40 xl:hidden">
          <Button className="bg-[#9b6f45] hover:bg-[#85603a] shadow-lg h-12 px-5 rounded-2xl" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saveStatus === 'published' ? 'Xuất bản' : 'Lưu'}
          </Button>
        </div>
      )}
    </div>
  );
}
