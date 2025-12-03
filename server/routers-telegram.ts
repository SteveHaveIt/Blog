import { publicProcedure, router } from './_core/trpc';
import { handleTelegramUpdate, setTelegramWebhook, getTelegramWebhookInfo } from './telegram-bot';
import { z } from 'zod';

export const telegramRouter = router({
  /**
   * Webhook endpoint for Telegram bot updates
   * POST /api/trpc/telegram.webhook
   */
  webhook: publicProcedure
    .input(z.any()) // Accept any Telegram update
    .mutation(async ({ input }) => {
      try {
        await handleTelegramUpdate(input);
        return { success: true };
      } catch (error) {
        console.error('[Telegram Webhook] Error:', error);
        return { success: false, error: 'Failed to process update' };
      }
    }),

  /**
   * Set webhook URL for the bot
   * POST /api/trpc/telegram.setWebhook
   */
  setWebhook: publicProcedure
    .input(z.object({ webhookUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        const success = await setTelegramWebhook(input.webhookUrl);
        return {
          success,
          message: success ? 'Webhook set successfully' : 'Failed to set webhook',
        };
      } catch (error) {
        console.error('[Telegram] Error setting webhook:', error);
        return { success: false, error: 'Failed to set webhook' };
      }
    }),

  /**
   * Get webhook info
   * GET /api/trpc/telegram.getWebhookInfo
   */
  getWebhookInfo: publicProcedure.query(async () => {
    try {
      const info = await getTelegramWebhookInfo();
      return { success: true, data: info };
    } catch (error) {
      console.error('[Telegram] Error getting webhook info:', error);
      return { success: false, error: 'Failed to get webhook info' };
    }
  }),
});
