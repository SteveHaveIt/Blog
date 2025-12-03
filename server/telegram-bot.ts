import { z } from 'zod';
import { getSupabaseClient } from './supabase';

// Telegram Bot Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8416151324:AAHCpIMgZcvEebVjYfZRk6aA0tnSDr4Dpd8';
const BOT_USERNAME = '@Nutablog_bot';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Submission state tracking (in production, use Redis or database)
const submissionStates = new Map<number, SubmissionState>();

interface SubmissionState {
  userId: number;
  chatId: number;
  step: 'type' | 'title' | 'content' | 'media' | 'tags' | 'author' | 'review' | 'complete';
  type?: 'blog' | 'vlog' | 'story';
  title?: string;
  content?: string;
  mediaUrls: string[];
  tags?: string[];
  author?: string;
  timestamp: Date;
  messageIds: number[]; // Track messages for cleanup
}

// Validation schemas
const SubmissionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['blog', 'vlog', 'story']),
  mediaUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().default('Steve Have It'),
  timestamp: z.date(),
  slug: z.string(),
  status: z.enum(['draft', 'published']).default('published'),
});

type Submission = z.infer<typeof SubmissionSchema>;

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * Send message to Telegram user
 */
async function sendMessage(
  chatId: number,
  text: string,
  options?: {
    replyMarkup?: any;
    parseMode?: 'HTML' | 'Markdown';
  }
): Promise<any> {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || 'HTML',
        reply_markup: options?.replyMarkup,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('[Telegram] Error sending message:', data.description);
      return null;
    }
    return data.result;
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error);
    return null;
  }
}

/**
 * Send inline keyboard with buttons
 */
async function sendInlineKeyboard(
  chatId: number,
  text: string,
  buttons: Array<Array<{ text: string; callbackData: string }>>
): Promise<any> {
  return sendMessage(chatId, text, {
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: buttons,
    },
  });
}

/**
 * Start new submission flow
 */
async function handleNewCommand(userId: number, chatId: number): Promise<void> {
  // Initialize submission state
  const state: SubmissionState = {
    userId,
    chatId,
    step: 'type',
    mediaUrls: [],
    timestamp: new Date(),
    messageIds: [],
  };

  submissionStates.set(userId, state);

  const message = await sendInlineKeyboard(
    chatId,
    '📝 <b>Create New Content</b>\n\nWhat type of content are you submitting?',
    [
      [
        { text: '📰 Blog', callbackData: 'type_blog' },
        { text: '🎬 Vlog', callbackData: 'type_vlog' },
        { text: '📸 Story', callbackData: 'type_story' },
      ],
    ]
  );

  if (message) {
    state.messageIds.push(message.message_id);
  }
}

/**
 * Handle callback query (button press)
 */
async function handleCallbackQuery(
  callbackQueryId: string,
  userId: number,
  chatId: number,
  data: string
): Promise<void> {
  const state = submissionStates.get(userId);

  if (!state) {
    await sendMessage(chatId, '❌ Session expired. Please use /new to start again.');
    return;
  }

  // Handle type selection
  if (data.startsWith('type_')) {
    const type = data.replace('type_', '') as 'blog' | 'vlog' | 'story';
    state.type = type;
    state.step = 'title';

    await sendMessage(
      chatId,
      `✅ Type selected: <b>${type.toUpperCase()}</b>\n\n📌 Now, what's the title of your ${type}?\n\n<i>Type "cancel" to stop, "restart" to begin again</i>`
    );

    return;
  }

  // Acknowledge callback
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: 'Processing...',
    }),
  });
}

/**
 * Handle text message input
 */
async function handleTextMessage(
  userId: number,
  chatId: number,
  text: string
): Promise<void> {
  let state = submissionStates.get(userId);

  // Handle special commands
  if (text.toLowerCase() === 'cancel') {
    submissionStates.delete(userId);
    await sendMessage(chatId, '❌ Submission cancelled. Use /new to start again.');
    return;
  }

  if (text.toLowerCase() === 'restart') {
    submissionStates.delete(userId);
    await handleNewCommand(userId, chatId);
    return;
  }

  if (!state) {
    await sendMessage(chatId, '❌ No active submission. Use /new to start.');
    return;
  }

  // Process based on current step
  switch (state.step) {
    case 'title':
      if (text.length < 3) {
        await sendMessage(chatId, '❌ Title too short. Please enter at least 3 characters.');
        return;
      }
      state.title = text;
      state.step = 'content';
      await sendMessage(
        chatId,
        `✅ Title: <b>${text}</b>\n\n📝 Now, write the content/body of your ${state.type}.\n\n<i>Type "cancel" to stop</i>`
      );
      break;

    case 'content':
      if (text.length < 10) {
        await sendMessage(chatId, '❌ Content too short. Please enter at least 10 characters.');
        return;
      }
      state.content = text;
      state.step = 'media';
      await sendMessage(
        chatId,
        `✅ Content saved.\n\n📸 Now send media (photos/videos) or type "skip" to continue without media.\n\n<i>You can send multiple files</i>`
      );
      break;

    case 'media':
      if (text.toLowerCase() === 'skip') {
        state.step = 'tags';
        await sendMessage(
          chatId,
          `✅ Skipped media.\n\n🏷️ Add tags (comma-separated) or type "skip" to continue.\n\nExample: <code>technology, tutorial, beginner</code>`
        );
      } else {
        await sendMessage(chatId, '❌ Please send media files or type "skip".');
      }
      break;

    case 'tags':
      if (text.toLowerCase() === 'skip') {
        state.tags = [];
      } else {
        state.tags = text.split(',').map(tag => tag.trim());
      }
      state.step = 'author';
      await sendMessage(
        chatId,
        `✅ Tags saved: ${state.tags.length > 0 ? state.tags.join(', ') : 'None'}\n\n👤 Author name (default: "Steve Have It") or type "default":`
      );
      break;

    case 'author':
      state.author = text.toLowerCase() === 'default' ? 'Steve Have It' : text;
      state.step = 'review';
      await reviewSubmission(userId, chatId, state);
      break;
  }

  submissionStates.set(userId, state);
}

/**
 * Review submission before final submission
 */
async function reviewSubmission(
  userId: number,
  chatId: number,
  state: SubmissionState
): Promise<void> {
  const slug = generateSlug(state.title || '');

  const reviewText = `
📋 <b>Review Your Submission</b>

<b>Type:</b> ${state.type?.toUpperCase()}
<b>Title:</b> ${state.title}
<b>Content:</b> ${state.content?.substring(0, 100)}...
<b>Media:</b> ${state.mediaUrls.length > 0 ? state.mediaUrls.length + ' file(s)' : 'None'}
<b>Tags:</b> ${state.tags && state.tags.length > 0 ? state.tags.join(', ') : 'None'}
<b>Author:</b> ${state.author}
<b>Slug:</b> <code>${slug}</code>
<b>Status:</b> Published

Everything looks good?
  `;

  await sendInlineKeyboard(
    chatId,
    reviewText,
    [
      [
        { text: '✅ Submit', callbackData: 'submit_confirm' },
        { text: '❌ Cancel', callbackData: 'submit_cancel' },
      ],
    ]
  );
}

/**
 * Submit content to Supabase
 */
async function submitToSupabase(state: SubmissionState): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const slug = generateSlug(state.title || '');

    // Check for duplicates (last 5 submissions)
    const { data: recentPosts, error: checkError } = await ((supabase
      .from('posts') as any)
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5) as any);

    if (checkError) {
      console.error('[Telegram] Error checking duplicates:', checkError);
    } else if (recentPosts) {
      const isDuplicate = recentPosts.some(
        (post: any) => post.title.toLowerCase() === state.title?.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('A post with this title already exists');
      }
    }

    // Create post
    const postData: any = {
      type: state.type,
      title: state.title,
      content: state.content,
      media_url: state.mediaUrls.length > 0 ? state.mediaUrls[0] : null,
      published: true,
      created_at: state.timestamp,
      updated_at: new Date(),
    };

    const { data: post, error: insertError } = await ((supabase
      .from('posts') as any)
      .insert([postData])
      .select()
      .single() as any);

    if (insertError) {
      console.error('[Telegram] Error inserting post:', insertError);
      throw insertError;
    }

    console.log('[Telegram] Post created successfully:', post?.id);
    return true;
  } catch (error) {
    console.error('[Telegram] Submission error:', error);
    return false;
  }
}

/**
 * Handle Telegram webhook update
 */
export async function handleTelegramUpdate(update: any): Promise<void> {
  try {
    // Handle message
    if (update.message) {
      const { message_id, from, chat, text } = update.message;
      const userId = from.id;
      const chatId = chat.id;

      if (text === '/new' || text === `/new@${BOT_USERNAME}`) {
        await handleNewCommand(userId, chatId);
      } else if (text) {
        await handleTextMessage(userId, chatId, text);
      }
    }

    // Handle callback query (button press)
    if (update.callback_query) {
      const { id: callbackQueryId, from, message, data } = update.callback_query;
      const userId = from.id;
      const chatId = message.chat.id;

      if (data.startsWith('type_')) {
        await handleCallbackQuery(callbackQueryId, userId, chatId, data);
      } else if (data === 'submit_confirm') {
        const state = submissionStates.get(userId);
        if (state) {
          const success = await submitToSupabase(state);
          if (success) {
            await sendMessage(
              chatId,
              '✔️ <b>Content submitted successfully!</b>\n\n📌 Your post has been saved to the Nuta CMS and is now published.'
            );
            submissionStates.delete(userId);
          } else {
            await sendMessage(
              chatId,
              '❌ <b>Error submitting content.</b>\n\nPlease try again or contact support.'
            );
          }
        }
      } else if (data === 'submit_cancel') {
        submissionStates.delete(userId);
        await sendMessage(chatId, '❌ Submission cancelled. Use /new to start again.');
      }
    }
  } catch (error) {
    console.error('[Telegram] Error handling update:', error);
  }
}

/**
 * Set webhook for Telegram bot
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await response.json();
    if (data.ok) {
      console.log('[Telegram] Webhook set successfully:', webhookUrl);
      return true;
    } else {
      console.error('[Telegram] Failed to set webhook:', data.description);
      return false;
    }
  } catch (error) {
    console.error('[Telegram] Error setting webhook:', error);
    return false;
  }
}

/**
 * Get webhook info
 */
export async function getTelegramWebhookInfo(): Promise<any> {
  try {
    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`, {
      method: 'POST',
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('[Telegram] Error getting webhook info:', error);
    return null;
  }
}
