# Telegram Bot Integration Guide - Nuta CMS

Your Telegram bot is now fully integrated with the Nuta Blog CMS. This guide explains how to set it up and use it.

## Bot Information

- **Bot Token**: `8416151324:AAHCpIMgZcvEebVjYfZRk6aA0tnSDr4Dpd8`
- **Bot Username**: `@Nutablog_bot`
- **Bot Name**: Nutablog_bot

## How It Works

The bot provides a guided, step-by-step interface for submitting content to your CMS:

```
/new → Select Type (Blog/Vlog/Story) → Enter Title → Enter Content → Add Media → Add Tags → Set Author → Review → Submit
```

## Setup Instructions

### Step 1: Deploy Your Application

First, deploy your application to Render or Vercel (see DEPLOYMENT_GUIDE.md). You'll get a URL like:
- Render: `https://nuta-blog-cms.onrender.com`
- Vercel: `https://nuta-blog-cms.vercel.app`

### Step 2: Set the Webhook

Once deployed, set the Telegram webhook to receive updates:

```bash
curl -X POST https://your-deployed-url.com/api/trpc/telegram.setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://your-deployed-url.com/api/trpc/telegram.webhook"
  }'
```

Replace `your-deployed-url.com` with your actual deployment URL.

### Step 3: Verify Webhook

Check if the webhook is set correctly:

```bash
curl https://your-deployed-url.com/api/trpc/telegram.getWebhookInfo
```

You should see a response like:
```json
{
  "success": true,
  "data": {
    "url": "https://your-deployed-url.com/api/trpc/telegram.webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "allowed_updates": ["message", "callback_query"]
  }
}
```

## Using the Bot

### Starting a New Submission

1. Open Telegram and find **@Nutablog_bot**
2. Type `/new` or `/new@Nutablog_bot`
3. The bot will show 3 inline buttons: **Blog**, **Vlog**, **Story**
4. Click the button for your content type

### Guided Submission Flow

#### Step 1: Select Type
```
📝 Create New Content
What type of content are you submitting?

[📰 Blog] [🎬 Vlog] [📸 Story]
```

#### Step 2: Enter Title
```
✅ Type selected: BLOG

📌 Now, what's the title of your blog?

Type "cancel" to stop, "restart" to begin again
```

#### Step 3: Enter Content
```
✅ Title: My Amazing Blog Post

📝 Now, write the content/body of your blog.

Type "cancel" to stop
```

#### Step 4: Add Media (Optional)
```
✅ Content saved.

📸 Now send media (photos/videos) or type "skip" to continue without media.

You can send multiple files
```

You can:
- Send one or multiple photos/videos
- Type `skip` to continue without media

#### Step 5: Add Tags (Optional)
```
✅ Skipped media.

🏷️ Add tags (comma-separated) or type "skip" to continue.

Example: technology, tutorial, beginner
```

Examples:
- `python, programming, tutorial`
- `travel, photography, adventure`
- `skip` (to skip tags)

#### Step 6: Set Author
```
✅ Tags saved: technology, tutorial, beginner

👤 Author name (default: "Steve Have It") or type "default":
```

Examples:
- `Steve Have It` (custom author)
- `default` (uses "Steve Have It")
- `John Doe` (any custom name)

#### Step 7: Review & Submit
```
📋 Review Your Submission

Type: BLOG
Title: My Amazing Blog Post
Content: This is my first blog post about...
Media: None
Tags: technology, tutorial, beginner
Author: Steve Have It
Slug: my-amazing-blog-post
Status: Published

Everything looks good?

[✅ Submit] [❌ Cancel]
```

Click **✅ Submit** to save to the CMS, or **❌ Cancel** to discard.

### Special Commands

During submission, you can use these commands:

| Command | Action |
|---------|--------|
| `cancel` | Cancel the current submission and start fresh |
| `restart` | Restart the submission from the beginning |
| `skip` | Skip optional fields (media, tags) |
| `default` | Use default value for author |

## What Gets Saved

When you submit content, the bot saves:

```json
{
  "type": "blog",
  "title": "My Amazing Blog Post",
  "content": "This is my first blog post about...",
  "media_urls": ["https://example.com/image.png"],
  "tags": ["technology", "tutorial", "beginner"],
  "author": "Steve Have It",
  "slug": "my-amazing-blog-post",
  "status": "published",
  "timestamp": "2025-12-03T05:00:00Z"
}
```

## Features

### ✅ Guided Submission Flow
- Step-by-step prompts with clear instructions
- Inline buttons for easy selection
- Validation for required fields

### ✅ Multiple Media Support
- Send photos and videos
- Multiple files in one submission
- Automatic URL handling

### ✅ Smart Slug Generation
- Automatically generated from title
- URL-friendly formatting
- Prevents special characters

### ✅ Duplicate Prevention
- Checks last 5 submissions
- Prevents duplicate titles
- Saves you from accidental re-posts

### ✅ Error Handling
- Validates all required fields
- Provides helpful error messages
- Allows you to fix mistakes

### ✅ Success Confirmation
```
✔️ Content submitted successfully!

📌 Your post has been saved to the Nuta CMS and is now published.
```

## Troubleshooting

### Bot doesn't respond to /new
- **Check**: Is the webhook set correctly? Run the verification command above.
- **Fix**: Re-run the webhook setup command with your correct deployment URL.

### "Session expired" message
- **Reason**: You haven't submitted anything for a long time.
- **Fix**: Type `/new` again to start a fresh submission.

### "A post with this title already exists"
- **Reason**: You're trying to submit a post with the same title as a recent post.
- **Fix**: Change the title slightly or use `restart` to begin again.

### Media doesn't upload
- **Check**: Is the media file under 50MB?
- **Fix**: Try a smaller file or skip media with `skip`.

### "Error submitting content"
- **Reason**: Server error or database issue.
- **Fix**: Check your deployment logs and ensure Supabase is configured correctly.

## API Endpoints

The bot uses these endpoints internally:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/trpc/telegram.webhook` | POST | Receive Telegram updates |
| `/api/trpc/telegram.setWebhook` | POST | Configure webhook URL |
| `/api/trpc/telegram.getWebhookInfo` | GET | Check webhook status |
| `/api/trpc/posts.create` | POST | Save post to CMS |

## Advanced: Manual Webhook Setup

If you need to set the webhook manually using Telegram's API:

```bash
curl -X POST https://api.telegram.org/bot8416151324:AAHCpIMgZcvEebVjYfZRk6aA0tnSDr4Dpd8/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-deployed-url.com/api/trpc/telegram.webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

## Example Workflow

Here's a complete example of submitting a blog post:

1. **Open Telegram** → Search for `@Nutablog_bot`
2. **Type** `/new`
3. **Click** `📰 Blog`
4. **Enter title**: `How to Build a CMS`
5. **Enter content**: `In this tutorial, I'll show you how to build a content management system using Node.js and Supabase...`
6. **Send media**: Upload a cover image (or type `skip`)
7. **Add tags**: `cms, nodejs, supabase, tutorial`
8. **Set author**: `default` (or your name)
9. **Review**: Check everything looks good
10. **Click** `✅ Submit`
11. **Success!** Your post is now published on your CMS

## Security Notes

- ✅ Bot token is stored securely in environment variables
- ✅ Webhook validates Telegram's signature
- ✅ All data is validated before saving
- ✅ Duplicate detection prevents spam
- ✅ Error logs are stored in Supabase

## Support

For issues or questions:
- Check the troubleshooting section above
- Review your deployment logs
- Verify Supabase credentials and table exists
- Ensure webhook URL is correct and accessible

---

**Your Telegram bot is ready to use!** 🚀

Start submitting content with `/new` and watch it appear in your CMS instantly.
