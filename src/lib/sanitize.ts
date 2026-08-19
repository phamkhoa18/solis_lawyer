/**
 * Sanitize HTML bài viết (allowlist) — chặn stored XSS từ nội dung AI/external,
 * vẫn giữ footer chuẩn (inline styles) + cấu trúc tạp chí.
 */
import sanitizeHtml from 'sanitize-html';
import type { IOptions } from 'sanitize-html';

const ALLOWED: IOptions = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u',
    'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'pre',
    'br', 'span', 'div', 'img', 'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'style'],
    img: ['src', 'alt', 'width', 'height', 'style'],
    p: ['style'], span: ['style'], div: ['style', 'class'],
    pre: ['class'], td: ['style'], th: ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedStyles: {
    '*': {
      color: [/.*/], 'background-color': [/.*/], 'background': [/.*/],
      'font-weight': [/.*/], 'font-size': [/.*/], 'font-family': [/.*/],
      'text-align': [/.*/], 'line-height': [/.*/], 'letter-spacing': [/.*/],
      padding: [/.*/], 'padding-top': [/.*/], 'padding-bottom': [/.*/], 'padding-left': [/.*/], 'padding-right': [/.*/],
      margin: [/.*/], 'margin-top': [/.*/], 'margin-bottom': [/.*/], 'margin-right': [/.*/], 'margin-left': [/.*/],
      border: [/.*/], 'border-radius': [/.*/], 'background-image': [/.*/],
      display: [/.*/], 'text-decoration': [/.*/], 'box-shadow': [/.*/],
      width: [/.*/], 'max-width': [/.*/], height: [/.*/],
    },
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, ALLOWED);
}
