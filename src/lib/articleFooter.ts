/**
 * Template chân bài chuẩn — CTA Solis Lawyers + disclaimer + nguồn tham khảo.
 * Render bằng code (inline styles) thay vì AI tự viết → nhất quán 100% mọi bài,
 * đẹp trong TinyMCE, trang public và email.
 */

export interface FooterSource {
  title?: string;
  url?: string;
}

const BRAND = {
  gold: '#d5aa6d',
  brown: '#9b6f45',
  dark: '#1e293b',
  darker: '#0f172a',
  cream: '#faf7f2',
  creamBorder: '#e7dccd',
  muted: '#64748b',
};

export function buildArticleFooter(lang: 'vi' | 'en', source?: FooterSource): string {
  const isVi = lang === 'vi';

  const ctaTitle = isVi ? 'Bạn cần luật sư hiểu rõ hoàn cảnh của mình?' : 'Need a lawyer who truly understands your situation?';
  const ctaBody = isVi
    ? 'Solis Lawyers tư vấn trực tiếp bằng tiếng Việt, đã đồng hành cùng nhiều gia đình Việt tại Úc. Hãy liên hệ để trao đổi về tình huống của bạn — mọi thông tin hoàn toàn bảo mật.'
    : 'Solis Lawyers advises in English and Vietnamese, with real experience supporting the Vietnamese community in Australia. Get in touch about your situation — everything you share stays confidential.';
  const emailBtn = `✉ contact@solislaw.com.au`;
  const webBtn = isVi ? '🌐 solislaw.com.au' : '🌐 solislaw.com.au';
  const contactLabel = isVi ? 'Liên hệ ngay' : 'Contact us';

  const disLabel = isVi ? 'Thông tin chung:' : 'General information:';
  const disBody = isVi
    ? 'Bài viết chỉ mang tính thông tin chung, không phải tư vấn pháp lý. Quy định có thể thay đổi — vui lòng liên hệ Solis Lawyers để được tư vấn cho trường hợp cụ thể của bạn.'
    : 'This article is general information only and is not legal advice. Laws can change — please contact Solis Lawyers for advice on your specific situation.';
  const srcLabel = isVi ? 'Nguồn tham khảo:' : 'Source:';
  const srcBlock =
    source?.url
      ? ` <p style="margin:0;">📚 <strong>${srcLabel}</strong> <a href="${source.url}" target="_blank" rel="noopener noreferrer" style="color:${BRAND.brown};">${(source.title || source.url).slice(0, 120)}</a></p>`
      : '';

  return `
<!-- Solis footer — DO NOT EDIT manually -->
<div class="solis-footer" style="margin-top:36px;">
  <div style="background:linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%); border-radius:14px; padding:26px 28px; margin-bottom:14px;">
    <div style="font-size:12px; letter-spacing:3px; color:${BRAND.gold}; font-weight:700; margin-bottom:8px;">SOLIS LAWYERS</div>
    <div style="font-size:19px; font-weight:700; color:#ffffff; margin-bottom:10px; line-height:1.35;">${ctaTitle}</div>
    <div style="font-size:14px; color:#cbd5e1; line-height:1.65; margin-bottom:18px;">${ctaBody}</div>
    <div>
      <a href="mailto:contact@solislaw.com.au" style="display:inline-block; background:${BRAND.gold}; color:${BRAND.darker}; font-weight:700; font-size:14px; padding:11px 22px; border-radius:8px; text-decoration:none; margin-right:10px; margin-bottom:8px;">${emailBtn}</a>
      <a href="https://solislaw.com.au" target="_blank" rel="noopener noreferrer" style="display:inline-block; border:1px solid ${BRAND.gold}; color:${BRAND.gold}; font-weight:700; font-size:14px; padding:11px 22px; border-radius:8px; text-decoration:none; margin-bottom:8px;">${webBtn}</a>
    </div>
  </div>
  <div style="background:${BRAND.cream}; border:1px solid ${BRAND.creamBorder}; border-radius:12px; padding:16px 20px; font-size:13px; color:${BRAND.muted}; line-height:1.75;">
    <p style="margin:0 0 ${srcBlock ? '6px' : '0'};">⚖️ <strong>${disLabel}</strong> ${disBody}</p>${srcBlock}
  </div>
</div>`.trim();
}

/**
 * Xoá disclaimer/nguồn do AI tự viết (bản cũ) trước khi ghép footer chuẩn.
 * Chống trùng lặp khi model vẫn tuân theo instruction cũ.
 */
export function stripLegacyFooter(html: string): string {
  let out = html;
  const patterns: RegExp[] = [
    // <p><em>Bài viết chỉ mang tính thông tin chung...</em></p>
    /<p>\s*<em>\s*Bài viết chỉ mang tính thông tin chung[\s\S]*?<\/em>\s*<\/p>/gi,
    /<p>\s*<em>\s*This article is general information[\s\S]*?<\/em>\s*<\/p>/gi,
    // biến thể không em
    /<p>\s*Bài viết chỉ mang tính thông tin chung[^<]*<\/p>/gi,
    /<p>\s*This article is general information[^<]*<\/p>/gi,
    // dòng Nguồn: / Source:
    /<p>\s*<strong>\s*(Nguồn|Nguồn tham khảo|Source)\s*:?\s*<\/strong>\s*[\s\S]*?<\/p>/gi,
    /<p>\s*(Nguồn|Nguồn tham khảo|Source)\s*:\s*<a[\s\S]*?<\/p>/gi,
    /<p>\s*(Nguồn|Nguồn tham khảo|Source)\s*:[^<]*<\/p>/gi,
  ];
  for (const re of patterns) out = out.replace(re, '');
  // footer chuẩn cũ (nếu regenerate) — thay mới
  out = out.replace(/<!-- Solis footer[\s\S]*?<div class="solis-footer"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  return out.trim();
}
