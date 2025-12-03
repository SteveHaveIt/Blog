# Nuta Blog CMS - Deployment & Setup Guide

## Step 1: Create the Posts Table in Supabase

Before deploying, you need to create the `posts` table in your Supabase database. Follow these steps:

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: `twmpnqbzrntjwammtxbw`
3. **Click "SQL Editor"** in the left sidebar
4. **Click "New Query"**
5. **Copy and paste the following SQL**:

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Allow public read published posts" ON posts
  FOR SELECT
  USING (published = true);

-- Allow service role full access (for your API)
CREATE POLICY "Allow service role full access" ON posts
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

6. **Click "Run"** to execute the SQL
7. **Verify**: Go to the "Table Editor" and you should see the `posts` table

### Option B: Using Command Line

If you have `psql` installed:

```bash
psql postgresql://postgres:Nuta145600.@db.twmpnqbzrntjwammtxbw.supabase.co:5432/postgres << 'EOF'
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

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published posts" ON posts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Allow service role full access" ON posts
  FOR ALL
  USING (true)
  WITH CHECK (true);
EOF
```

## Step 2: Deploy to Render

### Prerequisites
- GitHub account (already done ✅)
- Render account (free: https://render.com)

### Deployment Steps

1. **Go to Render**: https://render.com
2. **Sign in** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repository**:
   - Select `SteveHaveIt/Blog`
   - Choose the `main` branch
5. **Configure the service**:
   - **Name**: `nuta-blog-cms`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Instance Type**: Free (or Starter for production)

6. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
     ```
     SUPABASE_URL=https://twmpnqbzrntjwammtxbw.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=sb_secret_DFMzHept9hcRTAug1T0vlQ_Mxn3bBC2
     DATABASE_URL=postgresql://postgres:Nuta145600.@db.twmpnqbzrntjwammtxbw.supabase.co:5432/postgres
     NODE_ENV=production
     ```

7. **Click "Create Web Service"**
8. **Wait for deployment** (usually 2-5 minutes)
9. **Get your URL**: Render will provide a URL like `https://nuta-blog-cms.onrender.com`

### Test the Deployment

Once deployed, test your API:

```bash
# Test creating a post
curl -X POST https://nuta-blog-cms.onrender.com/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog",
    "title": "My First Post",
    "content": "This is a test post",
    "media_url": "https://example.com/image.png"
  }'

# Test fetching posts
curl "https://nuta-blog-cms.onrender.com/api/trpc/posts.list?type=blog&published=true"
```

## Step 3: Deploy to Vercel (Alternative)

### Prerequisites
- GitHub account (already done ✅)
- Vercel account (free: https://vercel.com)

### Deployment Steps

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New..."** → **"Project"**
3. **Import your GitHub repository**:
   - Search for `SteveHaveIt/Blog`
   - Click "Import"

4. **Configure Project**:
   - **Project Name**: `nuta-blog-cms`
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these variables:
     ```
     SUPABASE_URL=https://twmpnqbzrntjwammtxbw.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=sb_secret_DFMzHept9hcRTAug1T0vlQ_Mxn3bBC2
     DATABASE_URL=postgresql://postgres:Nuta145600.@db.twmpnqbzrntjwammtxbw.supabase.co:5432/postgres
     NODE_ENV=production
     ```

6. **Click "Deploy"**
7. **Wait for deployment** (usually 1-3 minutes)
8. **Get your URL**: Vercel will provide a URL like `https://nuta-blog-cms.vercel.app`

## Step 4: Configure Your Telegram Bot

Once deployed, configure your Telegram bot to send content to your API:

### Telegram Bot Webhook Setup

```bash
# Set webhook to your deployed URL
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-deployed-url.com/api/telegram/webhook"
  }'
```

### Example Telegram Bot Handler

Create a handler in your bot that sends POST requests to:

```
POST https://your-deployed-url.com/api/trpc/posts.create
Content-Type: application/json

{
  "type": "blog",
  "title": "Post Title",
  "content": "Post content here...",
  "media_url": "https://example.com/image.png"
}
```

## Step 5: Integrate with Your Website

### Fetch Posts from Your Website

```javascript
// Fetch all published blogs
const response = await fetch('https://your-deployed-url.com/api/trpc/posts.list?type=blog&published=true');
const { data: posts } = await response.json();

// Display posts on your website
posts.forEach(post => {
  console.log(`${post.title}: ${post.content}`);
  if (post.media_url) {
    console.log(`Image: ${post.media_url}`);
  }
});
```

### React Component Example

```jsx
import { useEffect, useState } from 'react';

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://your-deployed-url.com/api/trpc/posts.list?type=blog&published=true')
      .then(res => res.json())
      .then(data => {
        setPosts(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.media_url && <img src={post.media_url} alt={post.title} />}
          <time>{new Date(post.published_at).toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  );
}
```

## API Endpoints Reference

All endpoints are available at `https://your-deployed-url.com/api/trpc/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `posts.create` | POST | Create new content |
| `posts.list` | GET | Fetch posts (with optional filters) |
| `posts.getById` | GET | Get single post by ID |
| `posts.update` | PUT | Update existing post |
| `posts.publish` | POST | Mark post as published |
| `posts.delete` | DELETE | Delete post |

## Troubleshooting

### "Posts table does not exist"
- **Solution**: Run the SQL script in Supabase SQL Editor (Step 1)

### "Connection refused"
- **Solution**: Verify your Supabase credentials are correct in environment variables

### "Unauthorized" errors
- **Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly (not the anon key)

### Deployment fails
- **Check logs**: 
  - Render: View logs in the dashboard
  - Vercel: Check deployment logs in the dashboard
- **Verify environment variables**: Make sure all required env vars are set
- **Check build output**: Run `pnpm build` locally to identify issues

## Local Development

To test locally before deploying:

```bash
# Install dependencies
pnpm install

# Set environment variables
export SUPABASE_URL=https://twmpnqbzrntjwammtxbw.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=sb_secret_DFMzHept9hcRTAug1T0vlQ_Mxn3bBC2

# Start dev server
pnpm dev

# Server runs on http://localhost:3000
```

## Next Steps

1. ✅ Create the posts table in Supabase (Step 1)
2. ✅ Deploy to Render or Vercel (Step 2 or 3)
3. ✅ Configure your Telegram bot (Step 4)
4. ✅ Integrate with your website (Step 5)
5. ✅ Test all endpoints

## Support

For issues or questions:
- Check the README.md for API documentation
- Review the code in `server/routers-posts.ts` for implementation details
- Check Supabase logs for database errors
- Check Render/Vercel logs for deployment issues

## Security Notes

- **Never commit credentials** to GitHub
- **Use environment variables** for all secrets
- **Enable Row Level Security** (already done in SQL script)
- **Restrict API access** by domain if needed
- **Monitor logs** for suspicious activity
- **Rotate keys** periodically

---

**Your Nuta Blog CMS is ready to deploy!** 🚀
