/**
 * FPT Cloud (FPT AI Marketplace) client — OpenAI-compatible API.
 * Docs: https://ai-docs.fptcloud.com | Console: https://marketplace.fptcloud.com
 *
 * Lưu ý: GLM-5.2 là reasoning model — nó burn token vào `reasoning_content`
 * trước khi ra `content`, nên max_tokens phải đặt lớn (>= 4000).
 */

const BASE_URL = process.env.FPT_CLOUD_BASE_URL || 'https://mkp-api.fptcloud.com';
const API_KEY = process.env.FPT_CLOUD_API_KEY || '';

import { logUsage, estimateTokens } from '@/lib/usageLog';

export interface FptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FptChatOptions {
  model: string;
  messages: FptMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Nhận từng chunk text khi streaming */
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
}

/** Các model khuyến nghị cho việc viết bài (key = id trên FPT Cloud) */
export const FPT_WRITER_MODELS = [
  {
    id: 'DeepSeek-V4-Flash',
    name: 'DeepSeek V4 Flash — nhanh, rẻ, chất lượng tốt',
    note: '$0.14/$0.28 mỗi 1M token · context 500K',
  },
  {
    id: 'GLM-5.2',
    name: 'GLM 5.2 — chất lượng viết cao nhất',
    note: '$1.40/$4.40 mỗi 1M token · context 1M · reasoning',
  },
  {
    id: 'gemma-4-31B-it',
    name: 'Gemma 4 31B — rẻ, đa ngôn ngữ tốt',
    note: '$0.15/$0.45 mỗi 1M token · context 262K',
  },
] as const;

export const FPT_FAST_MODEL = 'DeepSeek-V4-Flash';

export async function fptChat(opts: FptChatOptions): Promise<string> {
  if (!API_KEY) throw new Error('Thiếu FPT_CLOUD_API_KEY trong .env.local');

  // Theo dõi stream đã phát chunk chưa — chỉ retry khi CHƯA phát gì (tránh lặp nội dung)
  let emitted = false;
  const tracked: FptChatOptions = opts.onChunk
    ? { ...opts, onChunk: (t) => { emitted = true; opts.onChunk!(t); } }
    : opts;

  const result = await chatOnce(tracked);
  if (result instanceof Error) {
    if (emitted) throw result; // đã stream 1 phần — không retry
    // Retry với max_tokens gấp đôi: model reasoning (GLM-5.2, DeepSeek think-mode)
    // có thể đốt hết budget token vào reasoning_content → content rỗng
    const retry = await chatOnce({ ...tracked, maxTokens: Math.min((tracked.maxTokens ?? 4000) * 2, 16000) });
    if (retry instanceof Error) throw retry;
    return retry;
  }
  return result;
}

async function chatOnce(opts: FptChatOptions): Promise<string | Error> {
  const stream = !!opts.onChunk;
  try {
    const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 4000,
        stream,
      }),
      signal: opts.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return new Error(`FPT API lỗi ${res.status}: ${errText.slice(0, 300)}`);
    }

    if (!stream) {
      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      logUsage({
        model: opts.model,
        promptTokens: json?.usage?.prompt_tokens,
        completionTokens: json?.usage?.completion_tokens,
      });
      if (!content || !String(content).trim()) {
        return new Error('FPT API trả content rỗng (thử tăng max_tokens — model reasoning tốn token suy nghĩ)');
      }
      return String(content);
    }

    // Parse SSE stream, chỉ lấy delta.content (bỏ reasoning_content)
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            opts.onChunk!(delta);
          }
        } catch {
          // bỏ qua chunk lỗi format
        }
      }
    }

    if (!full.trim()) return new Error('FPT API stream không trả nội dung');
    // Stream không có usage chính xác → ước lượng
    const promptChars = opts.messages.reduce((s, m) => s + (m.content?.length || 0), 0);
    logUsage({
      model: opts.model,
      promptTokens: estimateTokens(promptChars),
      completionTokens: estimateTokens(full.length),
      estimated: true,
    });
    return full;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return e instanceof Error ? e : new Error(String(e));
  }
}

/** Gọi model embedding (Vietnamese_Embedding / multilingual-e5) — trả về vector */
export async function fptEmbed(texts: string[], model = 'Vietnamese_Embedding'): Promise<number[][]> {
  if (!API_KEY) throw new Error('Thiếu FPT_CLOUD_API_KEY trong .env.local');
  // giới hạn 8K token context của model embedding
  const inputs = texts.map((t) => t.slice(0, 12000));
  const res = await fetch(`${BASE_URL}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model, input: inputs }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`FPT Embedding lỗi ${res.status}`);
  const json = await res.json();
  logUsage({
    model,
    kind: 'embedding',
    promptTokens: json?.usage?.prompt_tokens || estimateTokens(inputs.join(' ').length),
  });
  return (json?.data || []).map((d: { embedding: number[] }) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
export async function fptJson<T>(opts: Omit<FptChatOptions, 'onChunk'>): Promise<T> {
  // Gộp chỉ dẫn JSON vào system message đầu (tránh message system cuối gây model "nói nhiều")
  const messages: FptMessage[] = opts.messages.map((m, i) =>
    i === 0 && m.role === 'system'
      ? {
          ...m,
          content:
            m.content +
            '\n\nCRITICAL: Respond with a single valid JSON object only — no prose before or after it, no markdown fences.',
        }
      : m
  );

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await fptChat({ ...opts, messages });
    let text = raw.trim();
    // Model đôi khi thêm lời dẫn — cắt đoạn { ... } đầu tiên hoàn chỉnh
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error('Model không trả JSON hợp lệ: ' + (lastErr instanceof Error ? lastErr.message : lastErr));
}
