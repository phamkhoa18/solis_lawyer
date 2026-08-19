'use client';

import { useEffect, useRef } from 'react';

let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;

async function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'neutral',
        fontFamily: 'inherit',
        mindmap: { padding: 12 },
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

/**
 * Render container HTML có chứa <pre class="mermaid">...</pre> thành sơ đồ SVG.
 * - Lazy-load mermaid (~480KB) CHỈ khi bài có diagram
 * - `enabled=false` khi đang stream để tránh render từng chunk
 */
export default function MermaidRenderer({
  html,
  className,
  enabled = true,
}: {
  html: string;
  className?: string;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // re-run khi nội dung đổi (dùng ~hash đầu + độ dài làm key cho nhẹ)
  const key = enabled ? `${html.length}:${html.slice(0, 48)}` : 'disabled';

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const container = ref.current;
    if (!container) return;

    const blocks = container.querySelectorAll<HTMLPreElement>('pre.mermaid');
    if (!blocks.length) return;

    (async () => {
      try {
        const mermaid = await getMermaid();
        if (cancelled) return;
        let i = 0;
        for (const pre of Array.from(blocks)) {
          const code = (pre.textContent || '').trim();
          if (!code) continue;
          try {
            const { svg } = await mermaid.render(`mmd-${Date.now().toString(36)}-${i++}`, code);
            if (cancelled) return;
            const wrap = document.createElement('div');
            wrap.className = 'mermaid-diagram my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 text-sm';
            wrap.innerHTML = svg;
            pre.replaceWith(wrap);
          } catch {
            pre.classList.add('text-xs', 'text-red-500', 'bg-red-50', 'p-3', 'rounded');
          }
        }
      } catch {
        // mermaid không load được → giữ nguyên text
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
