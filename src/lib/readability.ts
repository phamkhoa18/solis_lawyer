/**
 * Readability gate cho AI Writer (theo research 2026-08):
 * - EN: Flesch Reading Ease + Flesch-Kincaid (target: FRE ≥ 60, grade ≤ 9)
 * - VI: chưa có công thức chuẩn — heuristic theo arXiv 2411.04756:
 *   độ dài câu theo ÂM TIẾT (≤22 TB, ≤20% câu >30) + tỷ lệ từ dài
 * - Legalese scan: cụm từ pháp lý khô cứng EN + VI kèm thay thế plain
 */

import textReadability from 'text-readability';

export interface EnglishScore {
  flesch: number;
  grade: number;
  avgSentenceWords: number;
  longSentences: { text: string; words: number }[];
  pass: boolean;
}

export interface VietnameseScore {
  avgSyllPerSentence: number;
  pctLongSentences: number;
  pctHardWords: number;
  longSentences: { text: string; syllables: number }[];
  pass: boolean;
}

export interface LegaleseMatch {
  phrase: string;
  replacement: string;
  count: number;
  lang: 'en' | 'vi';
}

const LEGALESE_EN: [string, string][] = [
  ['pursuant to', 'under'],
  ['notwithstanding', 'despite'],
  ['in the event that', 'if'],
  ['hereinafter', 'from now on'],
  ['herein', 'in this'],
  ['therein', 'in that'],
  ['aforementioned', 'already mentioned'],
  ['aforesaid', 'already said'],
  ['inter alia', 'among other things'],
  ['prior to', 'before'],
  ['subsequent to', 'after'],
  ['in accordance with', 'under'],
  ['with regard to', 'about'],
  ['with respect to', 'about'],
  ['due to the fact that', 'because'],
  ['in order to', 'to'],
  ['until such time as', 'until'],
  ['at the present time', 'now'],
  ['for the purpose of', 'to'],
  ['is of the opinion that', 'thinks'],
  ['make a decision', 'decide'],
  ['provide assistance', 'help'],
  ['utilize', 'use'],
  ['commence', 'start'],
  ['null and void', 'invalid'],
];

const LEGALESE_VI: [string, string][] = [
  ['trong trường hợp', 'nếu'],
  ['tại thời điểm hiện nay', 'bây giờ'],
  ['tại thời điểm hiện tại', 'bây giờ'],
  ['theo đúng quy định của pháp luật', 'theo luật'],
  ['theo đúng quy định', 'theo luật'],
  ['cung cấp hỗ trợ', 'giúp'],
  ['đưa ra quyết định', 'quyết định'],
  ['nhằm mục đích', 'để'],
  ['triển khai thực hiện', 'thực hiện'],
  ['cơ quan có thẩm quyền giải quyết', 'cơ quan có quyền quyết định'],
  ['người có yêu cầu', 'người nộp đơn'],
  ['khuyến nghị nên', 'nên'],
  ['trong thời gian diễn ra', 'trong lúc'],
  ['trước thời điểm', 'trước khi'],
  ['sau thời điểm', 'sau khi'],
];

export function stripHtml(html: string): string {
  return html
    .replace(/<pre class="mermaid">[\s\S]*?<\/pre>/gi, ' ') // bỏ diagram
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 4); // bỏ mẩu rác
}

export function scoreEnglish(html: string): EnglishScore {
  const text = stripHtml(html);
  const sents = sentences(text);
  if (!sents.length) {
    return { flesch: 0, grade: 0, avgSentenceWords: 0, longSentences: [], pass: true };
  }
  const flesch = Math.round((textReadability.fleschReadingEase(text) || 0) * 10) / 10;
  const grade = Math.round((textReadability.fleschKincaidGrade(text) || 0) * 10) / 10;
  const wordCounts = sents.map((s) => s.split(/\s+/).length);
  const avg = Math.round((wordCounts.reduce((a, b) => a + b, 0) / sents.length) * 10) / 10;
  const longSentences = sents
    .map((s, i) => ({ text: s.slice(0, 140), words: wordCounts[i] }))
    .filter((s) => s.words > 25);
  return { flesch, grade, avgSentenceWords: avg, longSentences, pass: flesch >= 50 && grade <= 12 };
}

export function scoreVietnamese(html: string): VietnameseScore {
  const text = stripHtml(html);
  const sents = sentences(text);
  if (!sents.length) {
    return { avgSyllPerSentence: 0, pctLongSentences: 0, pctHardWords: 0, longSentences: [], pass: true };
  }
  // Tiếng Việt: mỗi token = 1 âm tiết
  const syllCounts = sents.map((s) => s.split(/\s+/).length);
  const avg = Math.round((syllCounts.reduce((a, b) => a + b, 0) / sents.length) * 10) / 10;
  const longCount = syllCounts.filter((n) => n > 30).length;
  const pctLong = Math.round((longCount / sents.length) * 1000) / 10;
  const tokens = text.split(/\s+/);
  const hardWords = tokens.filter((t) => t.replace(/[.,!?;:"'()\-–—]/g, '').length > 7).length;
  const pctHard = Math.round((hardWords / Math.max(tokens.length, 1)) * 1000) / 10;
  const longSentences = sents
    .map((s, i) => ({ text: s.slice(0, 140), syllables: syllCounts[i] }))
    .filter((s) => s.syllables > 30);
  return { avgSyllPerSentence: avg, pctLongSentences: pctLong, pctHardWords: pctHard, longSentences, pass: avg <= 22 && pctLong <= 20 };
}

export function scanLegalese(enHtml: string, viHtml: string): LegaleseMatch[] {
  const matches: LegaleseMatch[] = [];
  const enText = stripHtml(enHtml).toLowerCase();
  const viText = stripHtml(viHtml).toLowerCase();
  for (const [phrase, replacement] of LEGALESE_EN) {
    const count = enText.split(phrase).length - 1;
    if (count > 0) matches.push({ phrase, replacement, count, lang: 'en' });
  }
  for (const [phrase, replacement] of LEGALESE_VI) {
    const count = viText.split(phrase).length - 1;
    if (count > 0) matches.push({ phrase, replacement, count, lang: 'vi' });
  }
  return matches;
}

export interface QualityReport {
  en: EnglishScore;
  vi: VietnameseScore;
  legalese: LegaleseMatch[];
  judge?: {
    en: { score: number; worst: string[] };
    vi: { score: number; worst: string[] };
  };
}

export function computeQuality(enHtml: string, viHtml: string): QualityReport {
  return { en: scoreEnglish(enHtml), vi: scoreVietnamese(viHtml), legalese: scanLegalese(enHtml, viHtml) };
}
