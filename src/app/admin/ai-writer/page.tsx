'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';

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
  source: { title: string; url: string };
}

const MODELS = [
  { id: 'DeepSeek-V4-Flash', label: 'DeepSeek V4 Flash', note: 'rẻ · nhanh · khuyên dùng' },
  { id: 'GLM-5.2', label: 'GLM 5.2', note: 'chất lượng nhất · chậm hơn' },
  { id: 'gemma-4-31B-it', label: 'Gemma 4 31B', note: 'rẻ · đa ngôn ngữ' },
];

const SUGGESTED_TOPICS = [
  'Chia tài sản khi ly hôn ở Úc sau Luật Gia đình sửa đổi 2024: bạo hành gia đình giờ ảnh hưởng thế nào đến khoản chia',
  'Coercive control — tội danh kiểm soát tâm lý mới tại NSW từ 7/2024: người Việt cần biết gì',
  'Quyền nuôi con sau cải cách Luật Gia đình 6/5/2024: bỏ giả định chia đôi, an toàn con là trên hết',
  'Ly hôn khi đang giữ visa partner (visa bạn đời): cạm bẫy di trú cần tránh',
];

function QualityPanel({
  quality: q,
  polishing,
  onPolish,
}: {
  quality: QualityReport;
  polishing: boolean;
  onPolish: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">📊 Chất lượng bài viết</h3>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onPolish} disabled={polishing}>
          {polishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Sửa giọng tự động
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 p-3 space-y-1">
          <p className="font-medium text-slate-700">🇬🇧 English</p>
          <p className="text-slate-600">
            Flesch <b>{q.en.flesch}</b> {q.en.flesch >= 60 ? '✅' : q.en.flesch >= 50 ? '⚠️' : '❌'} · Grade{' '}
            <b>{q.en.grade}</b> {q.en.grade <= 9 ? '✅' : '⚠️'} (target ≤ 9)
          </p>
          <p className="text-slate-600">TB {q.en.avgSentenceWords} từ/câu · câu dài: {q.en.longSentences.length}</p>
          {q.judge && (
            <p className="text-slate-600">
              LLM Judge: <b>{q.judge.en.score}/100</b> {q.judge.en.score >= 70 ? '✅' : '⚠️'}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-3 space-y-1">
          <p className="font-medium text-slate-700">🇻🇳 Tiếng Việt</p>
          <p className="text-slate-600">
            TB <b>{q.vi.avgSyllPerSentence}</b> âm tiết/câu {q.vi.avgSyllPerSentence <= 22 ? '✅' : '⚠️'} (target ≤ 22)
          </p>
          <p className="text-slate-600">
            Câu &gt;30 âm tiết: {q.vi.pctLongSentences}% · từ khó: {q.vi.pctHardWords}%
          </p>
          {q.judge && (
            <p className="text-slate-600">
              LLM Judge: <b>{q.judge.vi.score}/100</b> {q.judge.vi.score >= 70 ? '✅' : '⚠️'}
            </p>
          )}
        </div>
      </div>

      {q.legalese.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-400">Cụm trang trọng cần thay:</span>
          {q.legalese.map((l) => (
            <span key={l.phrase} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-[#9b6f45]">
              &quot;{l.phrase}&quot; → &quot;{l.replacement}&quot; ×{l.count}
            </span>
          ))}
        </div>
      )}

      {(q.judge?.en?.worst?.length || q.judge?.vi?.worst?.length) ? (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer select-none">Câu khó đọc nhất (LLM judge)</summary>
          <ul className="mt-1.5 space-y-1 list-disc pl-4">
            {q.judge?.en?.worst?.map((w, i) => (
              <li key={`e${i}`}>🇬🇧 {w.slice(0, 120)}</li>
            ))}
            {q.judge?.vi?.worst?.map((w, i) => (
              <li key={`v${i}`}>🇻🇳 {w.slice(0, 120)}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="text-[11px] text-slate-400">
        Điểm chỉ mang tính tham khảo — quyết định cuối thuộc biên tập viên. Nút sửa giữ nguyên mọi thông tin pháp lý.
      </p>
    </div>
  );
}

export default function AIWriterPage() {
  // ── Input state ──
  const [mode, setMode] = useState<'feeds' | 'url' | 'topic'>('topic');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [angle, setAngle] = useState('');
  const [model, setModel] = useState('DeepSeek-V4-Flash');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  // ── Feeds ──
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  // ── Generation state ──
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [enHtml, setEnHtml] = useState('');
  const [viHtml, setViHtml] = useState('');
  const [result, setResult] = useState<GenResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Save state ──
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
  const [coverStatus, setCoverStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [catRes, meRes] = await Promise.all([fetch('/api/categories'), fetch('/api/auth/me')]);
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
        const meData = await meRes.json();
        if (meData.success) setMe(meData.user);
      } catch {
        toast.error('Không tải được danh mục / thông tin người dùng');
      }
    })();
  }, []);

  const loadFeeds = useCallback(async () => {
    setLoadingFeeds(true);
    try {
      const res = await fetch('/api/ai/feeds');
      const data = await res.json();
      if (data.success) {
        setFeeds(data.data);
        if (!data.data?.length) toast.error('Không tải được tin từ nguồn (thử lại sau vài phút)');
      } else toast.error(data.message || 'Lỗi tải feeds');
    } catch {
      toast.error('Lỗi kết nối khi tải feeds');
    } finally {
      setLoadingFeeds(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'feeds' && !feeds.length && !loadingFeeds) loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const pickFeedItem = (item: FeedItem) => {
    setMode('url');
    setUrl(item.link);
    setTopic('');
    toast.success(`Đã chọn: ${item.title.slice(0, 60)}...`);
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setGenerating(false);
    setStatus('Đã dừng.');
  };

  const generate = async () => {
    if (mode === 'url' && !url.trim()) return toast.error('Nhập URL bài nguồn');
    if (mode === 'topic' && !topic.trim()) return toast.error('Nhập đề bài');
    if (mode === 'feeds') {
      if (!url.trim() && !topic.trim()) return toast.error('Chọn một tin trong danh sách trước');
      setMode(url.trim() ? 'url' : 'topic');
    }

    const activeMode = url.trim() && mode !== 'topic' ? 'url' : 'topic';
    setGenerating(true);
    setResult(null);
    setEnHtml('');
    setViHtml('');
    setEditing(false);
    setStatus('Bắt đầu...');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          topic: topic.trim() || undefined,
          url: activeMode === 'url' ? url.trim() : undefined,
          angle: angle.trim() || undefined,
          model,
          length,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ message: 'Lỗi server' }));
        throw new Error(err.message || `Lỗi ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          try {
            const evt = JSON.parse(trimmed.slice(5).trim());
            if (evt.type === 'status') setStatus(evt.message);
            else if (evt.type === 'en') setEnHtml((p) => p + evt.text);
            else if (evt.type === 'vi') setViHtml((p) => p + evt.text);
            else if (evt.type === 'done') {
              setResult(evt.data);
              // Thay stream bằng bản final (đã qua lint/repair mermaid)
              setEnHtml(evt.data.contentEn || '');
              setViHtml(evt.data.contentVi || '');
              setStatus('Hoàn tất! Kiểm tra và lưu bài below.');
            } else if (evt.type === 'error') {
              throw new Error(evt.message);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        toast.error((e as Error).message || 'Lỗi khi tạo bài viết');
        setStatus('Lỗi: ' + (e as Error).message);
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const checks: [boolean, string][] = [
      [!!result.titleVi && !!result.titleEn, 'Tiêu đề VI & EN'],
      [!!result.descVi && !!result.descEn, 'Mô tả VI & EN'],
      [!!result.contentVi && !!result.contentEn, 'Nội dung VI & EN'],
      [!!result.slug, 'Slug'],
      [!!category, 'Danh mục'],
      [!!image, 'Ảnh bìa'],
      [!!me, 'Tác giả (cần đăng nhập)'],
    ];
    const missing = checks.find(([ok]) => !ok);
    if (missing) return toast.error(`Thiếu: ${missing[1]}`);

    if (result.descVi.length > 200 || result.descEn.length > 200) {
      return toast.error('Mô tả không được quá 200 ký tự');
    }

    setSaving(true);
    try {
      const res = await fetch('/api/casestudies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { en: result.titleEn, vi: result.titleVi },
          description: { en: result.descEn, vi: result.descVi },
          content: { en: result.contentEn, vi: result.contentVi },
          slug: result.slug,
          image,
          category,
          user: me!._id,
          isActive: saveStatus === 'published',
          publishedAt: saveStatus === 'published' ? new Date() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(saveStatus === 'published' ? 'Đã xuất bản bài viết!' : 'Đã lưu bản nháp!');
      } else {
        toast.error(data.message || 'Lưu thất bại');
      }
    } catch {
      toast.error('Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

  const generateCoverImage = async () => {
    if (!result?.titleVi) return toast.error('Cần có bài viết trước khi tạo ảnh bìa');
    setCoverLoading(true);
    setCoverVariant((v) => v + 1);
    try {
      const cat = categories.find((c) => c._id === category);
      const res = await fetch('/api/ai/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || result.titleVi,
          titleVi: result.titleVi,
          titleEn: result.titleEn,
          categoryLabel: cat?.name?.vi || cat?.name?.en || 'Luật Úc',
          variant: Date.now() % 100000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
        toast.success('Đã tạo ảnh bìa!');
      } else toast.error(data.message || 'Tạo ảnh thất bại');
    } catch {
      toast.error('Không thể kết nối server');
    } finally {
      setCoverLoading(false);
      setCoverStatus('');
    }
  };

  const updateResult = (patch: Partial<GenResult>) => setResult((p) => (p ? { ...p, ...patch } : p));

  const buildFeedback = (q?: QualityReport): string => {
    if (!q) return '';
    const parts: string[] = [];
    const legalese = q.legalese.map((l) => `"${l.phrase}" → "${l.replacement}" (x${l.count}, ${l.lang.toUpperCase()})`);
    if (legalese.length) parts.push(`Formal phrases to replace:\n${legalese.join('\n')}`);
    const longEn = q.en.longSentences.slice(0, 3).map((s) => `"${s.text}..." (${s.words} words)`);
    if (longEn.length) parts.push(`EN sentences too long (over 25 words):\n${longEn.join('\n')}`);
    const longVi = q.vi.longSentences.slice(0, 3).map((s) => `"${s.text}..." (${s.syllables} âm tiết)`);
    if (longVi.length) parts.push(`Câu VI quá dài (trên 30 âm tiết):\n${longVi.join('\n')}`);
    return parts.join('\n\n');
  };

  const polishVoice = async () => {
    if (!result) return;
    setPolishing(true);
    try {
      const res = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentEn: result.contentEn,
          contentVi: result.contentVi,
          feedback: buildFeedback(result.quality),
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateResult({ contentEn: data.data.contentEn, contentVi: data.data.contentVi, quality: data.data.quality });
        setEnHtml(data.data.contentEn);
        setViHtml(data.data.contentVi);
        toast.success('Đã sửa giọng văn — kiểm tra lại nội dung!');
      } else toast.error(data.message || 'Sửa thất bại');
    } catch {
      toast.error('Không thể kết nối server');
    } finally {
      setPolishing(false);
    }
  };

  const previewHtml = previewTab === 'vi' ? viHtml : enHtml;
  const editingContent = previewTab === 'vi' ? result?.contentVi : result?.contentEn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#9b6f45]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">AI Writer</h1>
            <p className="text-sm text-slate-500">Viết bài song ngữ Anh – Việt bằng FPT AI</p>
          </div>
        </div>
        {result?.source?.url && (
          <a
            href={result.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#9b6f45] hover:underline flex items-center gap-1 max-w-xs truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" /> Nguồn gốc
          </a>
        )}
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
        {/* ══ CỘT INPUT ══ */}
        <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-5">
          {/* Mode tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(
              [
                ['topic', 'Đề bài', PenLine],
                ['url', 'Từ URL', Link2],
                ['feeds', 'Tin mới', Rss],
              ] as const
            ).map(([m, label, Icon]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {mode === 'topic' && (
            <div className="space-y-2">
              <Label>Đề bài (tiếng Việt hoặc Anh)</Label>
              <Textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Quyền nuôi con sau cải cách Luật Gia đình 2024..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED_TOPICS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(t)}
                    className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-[#9b6f45] hover:bg-amber-100 transition-colors text-left"
                  >
                    {t.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'url' && (
            <div className="space-y-2">
              <Label>URL bài nguồn (Lexology, Mondaq, Chambers, LSJ, báo chí...)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              <p className="text-[11px] text-slate-400">
                AI sẽ đọc bài gốc, phân tích rồi viết lại 100% văn bản mới (không copy câu).
              </p>
            </div>
          )}

          {mode === 'feeds' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tin mới từ nguồn ({feeds.length})</Label>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadFeeds} disabled={loadingFeeds}>
                  {loadingFeeds ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Tải lại
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {loadingFeeds && !feeds.length && (
                  <div className="py-8 text-center text-sm text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Đang tải tin từ các nguồn...
                  </div>
                )}
                {feeds.map((f, i) => (
                  <button
                    key={`${f.link}-${i}`}
                    onClick={() => pickFeedItem(f)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors group"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">{f.sourceName}</p>
                    <p className="text-xs font-medium text-slate-700 group-hover:text-slate-900 line-clamp-2">{f.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Yêu cầu thêm (tuỳ chọn)</Label>
            <Input
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="VD: nhấn mạnh cho người Việt mới định cư, có ví dụ thực tế..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.label} <span className="text-slate-400">· {m.note}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Độ dài</Label>
              <Select value={length} onValueChange={(v) => setLength(v as 'short' | 'medium' | 'long')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short" className="text-xs">Ngắn (~700 từ)</SelectItem>
                  <SelectItem value="medium" className="text-xs">Vừa (~1.200 từ)</SelectItem>
                  <SelectItem value="long" className="text-xs">Dài (~1.700 từ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {generating ? (
            <Button variant="destructive" className="w-full" onClick={stopGeneration}>
              Dừng lại
            </Button>
          ) : (
            <Button className="w-full bg-[#9b6f45] hover:bg-[#85603a]" onClick={generate}>
              <Sparkles className="w-4 h-4" /> Tạo bài viết
            </Button>
          )}

          {status && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2">
              {generating && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />}
              <span className="line-clamp-2">{status}</span>
            </div>
          )}
        </div>

        {/* ══ CỘT KẾT QUẢ ══ */}
        <div className="space-y-4">
          {!result && !generating && !viHtml && !enHtml && (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
              <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                Chọn đề bài / dán URL / chọn tin từ nguồn rồi bấm <strong>Tạo bài viết</strong>.
                <br />
                Bài sẽ được viết song ngữ Anh – Việt, xem trước và chỉnh sửa ngay tại đây.
              </p>
            </div>
          )}

          {(viHtml || enHtml || result) && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Tab VI/EN + nút sửa */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                  <button
                    onClick={() => setPreviewTab('vi')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      previewTab === 'vi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                  <button
                    onClick={() => setPreviewTab('en')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      previewTab === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditing(!editing)}
                      disabled={generating}
                    >
                      {editing ? <Eye className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                      {editing ? 'Xem trước' : 'Chỉnh sửa'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Tiêu đề đang stream */}
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {result ? (previewTab === 'vi' ? result.titleVi : result.titleEn) : '...'}
                </h2>

                {editing && result ? (
                  <TextEditor
                    key={previewTab}
                    value={editingContent || ''}
                    onChange={(v) =>
                      previewTab === 'vi' ? updateResult({ contentVi: v }) : updateResult({ contentEn: v })
                    }
                  />
                ) : (
                  <MermaidRenderer
                    className="text-sm text-slate-700 leading-relaxed space-y-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_a]:text-[#9b6f45] [&_a]:underline [&_table]:w-full [&_table]:text-xs [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:p-2"
                    html={previewHtml || editingContent || ''}
                    enabled={!generating}
                  />
                )}

                {generating && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="inline-block w-1.5 h-4 bg-amber-400 animate-pulse" />
                    đang viết...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═─ Panel chất lượng ── */}
          {result?.quality && !generating && (
            <QualityPanel quality={result.quality} polishing={polishing} onPolish={polishVoice} />
          )}

          {/* ═─ Panel lưu bài ── */}
          {result && !generating && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#9b6f45]" /> Thông tin xuất bản
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tiêu đề VI</Label>
                  <Input value={result.titleVi} onChange={(e) => updateResult({ titleVi: e.target.value })} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tiêu đề EN</Label>
                  <Input value={result.titleEn} onChange={(e) => updateResult({ titleEn: e.target.value })} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mô tả VI ({result.descVi.length}/200)</Label>
                  <Textarea
                    rows={2}
                    value={result.descVi}
                    onChange={(e) => updateResult({ descVi: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mô tả EN ({result.descEn.length}/200)</Label>
                  <Textarea
                    rows={2}
                    value={result.descEn}
                    onChange={(e) => updateResult({ descEn: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Slug</Label>
                  <Input value={result.slug} onChange={(e) => updateResult({ slug: e.target.value })} className="text-sm" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => updateResult({ slug: slugify(result.titleEn, { lower: true, strict: true, trim: true }) })}
                >
                  Tạo lại từ tiêu đề EN
                </Button>
              </div>

              {result.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Danh mục</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id} className="text-sm">
                          {c.name?.vi || c.name?.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Trạng thái lưu</Label>
                  <Select value={saveStatus} onValueChange={(v) => setSaveStatus(v as 'draft' | 'published')}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" className="text-sm">Bản nháp</SelectItem>
                      <SelectItem value="published" className="text-sm">Xuất bản ngay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Ảnh bìa</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs w-full justify-start"
                  onClick={generateCoverImage}
                  disabled={coverLoading || !result?.titleVi}
                >
                  {coverLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#9b6f45]" />
                  )}
                  {coverLoading ? coverStatus || 'Đang tạo ảnh...' : 'Tạo ảnh bìa tự động (AI + logo Solis)'}
                </Button>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Ảnh bìa"
                    className="w-full rounded-lg border border-slate-200"
                  />
                )}
                <ImageUploader onUploadSuccess={(u) => setImage(u)} />
                <p className="text-[11px] text-slate-400">
                  Ảnh AI có sẵn logo + tiêu đề tiếng Việt. Không ưng? Bấm lại để sinh nền khác, hoặc tự upload.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-400">
                  Tác giả: {me?.name} · Lưu vào Case Studies
                </p>
                <Button className="bg-[#9b6f45] hover:bg-[#85603a]" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveStatus === 'published' ? 'Xuất bản' : 'Lưu nháp'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
