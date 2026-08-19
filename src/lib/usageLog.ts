/**
 * Ghi chi phí sử dụng FPT API (token → USD) — fire-and-forget, không bao giờ chặn main flow.
 * Giá theo research 19/08/2026 (USD / 1M token: in/out).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AiUsageModel: any = null;
async function getModel() {
  if (!AiUsageModel) {
    const { default: connectDB } = await import('@/lib/dbConnect');
    await connectDB();
    const { default: model } = await import('@/models/AiUsage');
    AiUsageModel = model;
  }
  return AiUsageModel;
}

const PRICE: Record<string, [number, number]> = {
  'DeepSeek-V4-Flash': [0.14, 0.28],
  'GLM-5.2': [1.4, 4.4],
  'gemma-4-31B-it': [0.15, 0.45],
  'gemma-4-26B-A4B-it': [0.14, 0.4],
  'gemma-3-27b-it': [0.11, 0.17],
  'gpt-oss-120b': [0.14, 0.61],
  'gpt-oss-20b': [0.05, 0.2],
  'Llama-3.3-70B-Instruct': [0.21, 0.45],
  Vietnamese_Embedding: [0.01, 0],
  'multilingual-e5-large': [0.02, 0],
};

export function calcCost(model: string, pt: number, ct: number): number {
  const [pin, pout] = PRICE[model] || [0.3, 0.6]; // mặc định giá trung bình nếu model lạ
  return Math.round(((pt * pin) / 1_000_000 + (ct * pout) / 1_000_000) * 1e6) / 1e6;
}

export interface UsageEntry {
  model: string;
  kind?: 'chat' | 'embedding';
  promptTokens?: number;
  completionTokens?: number;
  estimated?: boolean;
}

export function logUsage(entry: UsageEntry): void {
  void (async () => {
    try {
      const Model = await getModel();
      const pt = Math.round(entry.promptTokens || 0);
      const ct = Math.round(entry.completionTokens || 0);
      await Model.create({
        model: entry.model,
        kind: entry.kind || 'chat',
        promptTokens: pt,
        completionTokens: ct,
        costUsd: calcCost(entry.model, pt, ct),
        estimated: !!entry.estimated,
      });
    } catch {
      // logging không được phép làm lỗi nghiệp vụ
    }
  })();
}

/** Ước lượng token thô (~4 ký tự/token) khi API không trả usage (stream) */
export function estimateTokens(chars: number): number {
  return Math.round(chars / 4);
}
