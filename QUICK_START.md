# Nuta Blog CMS - Quick Start Guide

Get your CMS live in 10 minutes! Follow these exact steps.

## Step 1: Create Posts Table in Supabase (2 minutes)

### 1.1 Open Supabase Dashboard
Go to: https://app.supabase.com

### 1.2 Select Your Project
Click on project: `twmpnqbzrntjwammtxbw`

### 1.3 Open SQL Editor
In the left sidebar, click **"SQL Editor"**

### 1.4 Create New Query
Click **"New Query"** button

### 1.5 Copy and Paste This SQL

```sql
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('blog', 'vlog', 'story')),
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read published posts
CREATE POLICY "Allow public read published posts" ON posts
  FOR SELECT
  USING (published = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON posts
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 1.6 Run the Query
Click the **"Run"** button (or press Ctrl+Enter)

✅ **You should see:** "Success. No rows returned."

---

## Step 2: Deploy to Render (5 minutes)

### 2.1 Go to Render
Visit: https://render.com

### 2.2 Sign In with GitHub
Click **"Sign up with GitHub"** or **"Sign in"**

### 2.3 Create New Web Service
- Click **"New +"** button
- Select **"Web Service"**

### 2.4 Connect Your Repository
- Click **"Connect"** next to `SteveHaveIt/Blog`
- Select the repository
- Click **"Connect"**

### 2.5 Configure Service
Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `nuta-blog-cms` |
| **Environment** | `Node` |
| **Region** | `Oregon` (or closest to you) |
| **Branch** | `main` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Instance Type** | `Free` (or `Starter` for production) |

### 2.6 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

```
SUPABASE_URL=https://twmpnqbzrntjwammtxbw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_DFMzHept9hcRTAug1T0vlQ_Mxn3bBC2
DATABASE_URL=postgresql://postgres:Nuta145600.@db.twmpnqbzrntjwammtxbw.supabase.co:5432/postgres
NODE_ENV=production
```

### 2.7 Deploy
Click **"Create Web Service"**

⏳ **Wait 2-5 minutes** for deployment to complete

✅ **You'll see:** A green checkmark and a URL like `https://nuta-blog-cms.onrender.com`

**Save this URL!** You'll need it for the next step.

---

## Step 3: Set Bot Webhook (1 minute)

Once your deployment is complete and you have your URL:

### 3.1 Open Terminal or Command Prompt

### 3.2 Run This Command

Replace `YOUR_DEPLOYED_URL` with your actual Render URL:

```bash
curl -X POST https://YOUR_DEPLOYED_URL/api/trpc/telegram.setWebhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://YOUR_DEPLOYED_URL/api/trpc/telegram.webhook"}'
```

**Example:**
```bash
curl -X POST https://nuta-blog-cms.onrender.com/api/trpc/telegram.setWebhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://nuta-blog-cms.onrender.com/api/trpc/telegram.webhook"}'
```

✅ **You should see:** `{"success":true,"message":"Webhook set successfully"}`

---

## Step 4: Test Your Bot (2 minutes)

### 4.1 Open Telegram
Search for: **@Nutablog_bot**

### 4.2 Start the Bot
Type: `/new`

### 4.3 Submit a Test Post
1. Click **📰 Blog**
2. Enter title: `My First Post`
3. Enter content: `This is a test post`
4. Type `skip` for media
5. Type `skip` for tags
6. Type `default` for author
7. Click **✅ Submit**

✅ **You should see:** 
```
✔️ Content submitted successfully!

📌 Your post has been saved to the Nuta CMS and is now published.
```

---

## 🎉 You're Live!

Your Nuta Blog CMS is now fully operational:

- ✅ Posts table created in Supabase
- ✅ API deployed to Render
- ✅ Telegram bot connected and working
- ✅ Content submission flow tested

### What You Can Do Now

**Submit Content via Telegram:**
- Type `/new` in @Nutablog_bot
- Follow the guided flow
- Content is automatically saved to your CMS

**Fetch Content via API:**
```bash
curl "https://YOUR_DEPLOYED_URL/api/trpc/posts.list?type=blog&published=true"
```

**Display on Your Website:**
See TELEGRAM_BOT_GUIDE.md for React component examples

---

## Troubleshooting

### "Posts table does not exist"
- **Solution:** Make sure you ran the SQL script in Supabase and clicked "Run"

### Webhook setup fails
- **Check:** Is your Render deployment complete? (green checkmark)
- **Fix:** Wait a few more minutes and try again

### Bot doesn't respond to /new
- **Check:** Did the webhook setup return success?
- **Fix:** Run the webhook setup command again with your correct URL

### "Connection refused" errors
- **Check:** Are your Supabase credentials correct in Render environment variables?
- **Fix:** Verify DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY are exactly correct

---

## Next Steps

Once everything is working:

1. **Start submitting content** via Telegram bot
2. **Integrate with your website** (see TELEGRAM_BOT_GUIDE.md)
3. **Add enhancements** (analytics, scheduled publishing, editing UI)

---

## Support

For detailed information, see:
- **API Documentation:** README.md
- **Deployment Details:** DEPLOYMENT_GUIDE.md
- **Bot Usage:** TELEGRAM_BOT_GUIDE.md

**Your CMS is ready to use!** 🚀
