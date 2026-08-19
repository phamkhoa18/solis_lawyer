/**
 * Telegram Bot API wrapper — gửi tin/nút + polling getUpdates (chạy được từ localhost,
 * không cần webhook/public URL).
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const API = (method: string) => `https://api.telegram.org/bot${TOKEN}/${method}`;

export interface TgButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export async function tgCall<T = unknown>(method: string, payload: Record<string, unknown>): Promise<T | null> {
  if (!TOKEN) return null;
  try {
    const res = await fetch(API(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
    const json = await res.json();
    if (!json.ok) {
      console.error(`Telegram ${method} lỗi:`, JSON.stringify(json).slice(0, 200));
      return null;
    }
    return json.result as T;
  } catch (e) {
    console.error(`Telegram ${method} lỗi mạng:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function sendMessage(chatId: string, html: string, buttons?: TgButton[][]) {
  return tgCall<{ message_id: number }>('sendMessage', {
    chat_id: chatId,
    text: html.slice(0, 4000),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

export async function sendPhoto(chatId: string, photoUrl: string, caption: string, buttons?: TgButton[][]) {
  return tgCall<{ message_id: number }>('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption.slice(0, 1000),
    parse_mode: 'HTML',
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

/**
 * Gửi ảnh bằng upload multipart (buffer) — BẮT BUỘC với localhost:
 * Telegram không thể tải ảnh qua URL localhost/192.168.x, chỉ nhận upload thẳng.
 */
export async function sendPhotoBuffer(
  chatId: string,
  image: Buffer,
  caption: string,
  buttons?: TgButton[][]
): Promise<{ message_id: number } | null> {
  if (!TOKEN) return null;
  try {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption.slice(0, 1000));
    form.append('parse_mode', 'HTML');
    if (buttons) form.append('reply_markup', JSON.stringify({ inline_keyboard: buttons }));
    form.append('photo', new Blob([new Uint8Array(image)], { type: 'image/png' }), 'cover.png');
    const res = await fetch(API('sendPhoto'), {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60000),
    });
    const json = await res.json();
    if (!json.ok) {
      console.error('Telegram sendPhoto(multipart) lỗi:', JSON.stringify(json).slice(0, 200));
      return null;
    }
    return json.result as { message_id: number };
  } catch (e) {
    console.error('Telegram sendPhoto(multipart) lỗi mạng:', e instanceof Error ? e.message : e);
    return null;
  }
}

export async function editMessageText(chatId: string, messageId: number, html: string, buttons?: TgButton[][]) {
  return tgCall('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: html.slice(0, 4000),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return tgCall('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text, show_alert: false } : {}),
  });
}

export interface TgUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; first_name: string; username?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    from: { id: number; first_name: string; username?: string };
    message?: { message_id: number; chat: { id: number } };
  };
}

/** Long-polling một lượt — trả updates mới + offset kế tiếp */
export async function getUpdates(offset: number): Promise<{ updates: TgUpdate[]; nextOffset: number }> {
  try {
    const res = await fetch(`${API('getUpdates')}?timeout=25&offset=${offset}`, {
      signal: AbortSignal.timeout(35000),
    });
    const json = await res.json();
    if (!json.ok) return { updates: [], nextOffset: offset };
    const updates = json.result as TgUpdate[];
    return {
      updates,
      nextOffset: updates.length ? updates[updates.length - 1].update_id + 1 : offset,
    };
  } catch {
    return { updates: [], nextOffset: offset };
  }
}

/** Escape HTML cho Telegram */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
