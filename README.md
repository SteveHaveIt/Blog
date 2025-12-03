# Nuta Mini Program - Blog/Vlog/Story Manager

A fully functional content management system that integrates with Telegram bots, Supabase database, and your website. This program allows you to manage blogs, vlogs, and stories without relying on third-party CMS subscriptions.

## Overview

The Nuta Mini Program is a self-hosted CMS solution that provides:

- **Telegram Bot Integration**: Accept content submissions via POST requests from your Telegram bot
- **Supabase Backend**: Secure PostgreSQL database for storing all content
- **RESTful API**: tRPC-based API endpoints for content management
- **Content Filtering**: Filter content by type (blog/vlog/story) and publication status
- **Publishing Workflow**: Draft content, publish when ready, and track publication dates
- **Full CRUD Operations**: Create, read, update, and delete content programmatically

## Tech Stack

- **Backend**: Node.js + Express.js
- **API Framework**: tRPC (TypeScript RPC)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React 19 + Tailwind CSS
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Deployment**: Ready for Render, Vercel, or any Node.js host

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account with a project created
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SteveHaveIt/Blog.git
   cd nuta-blog-cms
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=your-database-url
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The server will run on `http://localhost:3000`

## API Endpoints

All endpoints are accessible via tRPC at `/api/trpc/`. The API uses JSON for request and response bodies.

### 1. Create Content (Telegram Bot Integration)

**Endpoint**: `POST /api/trpc/posts.create`

**Purpose**: Accept content submissions from Telegram bot

**Request Body**:
```json
{
  "type": "blog",
  "title": "My First Blog Post",
  "content": "This is the main content of the blog post...",
  "media_url": "https://example.com/image.png"
}
```

**Parameters**:
- `type` (required): `"blog"`, `"vlog"`, or `"story"`
- `title` (optional): Content title
- `content` (required): Main content text
- `media_url` (optional): URL to image or video

**Response**:
```json
{
  "message": "Content received and stored",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "blog",
    "title": "My First Blog Post",
    "content": "This is the main content...",
    "media_url": "https://example.com/image.png",
    "published": false,
    "created_at": "2025-12-03T05:00:00Z",
    "published_at": null,
    "updated_at": "2025-12-03T05:00:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog",
    "title": "My First Blog Post",
    "content": "This is the main content of the blog post...",
    "media_url": "https://example.com/image.png"
  }'
```

### 2. Retrieve Content (Website Integration)

**Endpoint**: `GET /api/trpc/posts.list`

**Purpose**: Fetch content for website display with optional filtering

**Query Parameters**:
- `type` (optional): Filter by `"blog"`, `"vlog"`, or `"story"`
- `published` (optional): Filter by publication status (`true` or `false`)

**Response**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "blog",
      "title": "My First Blog Post",
      "content": "This is the main content...",
      "media_url": "https://example.com/image.png",
      "published": true,
      "created_at": "2025-12-03T05:00:00Z",
      "published_at": "2025-12-03T05:05:00Z",
      "updated_at": "2025-12-03T05:05:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example - Get all published blogs**:
```bash
curl "http://localhost:3000/api/trpc/posts.list?type=blog&published=true"
```

**cURL Example - Get all vlogs (published and drafts)**:
```bash
curl "http://localhost:3000/api/trpc/posts.list?type=vlog"
```

### 3. Get Single Post

**Endpoint**: `GET /api/trpc/posts.getById`

**Purpose**: Retrieve a specific post by its ID

**Request Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**: Returns the post object or 404 error

**cURL Example**:
```bash
curl "http://localhost:3000/api/trpc/posts.getById?id=550e8400-e29b-41d4-a716-446655440000"
```

### 4. Update Content

**Endpoint**: `PUT /api/trpc/posts.update`

**Purpose**: Modify existing content

**Request Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "title": "Updated Blog Title",
    "content": "Updated content here...",
    "media_url": "https://example.com/new-image.png"
  }
}
```

**Response**:
```json
{
  "message": "Post updated successfully",
  "data": { /* updated post object */ }
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/api/trpc/posts.update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "title": "Updated Blog Title",
      "content": "Updated content here..."
    }
  }'
```

### 5. Publish Content

**Endpoint**: `POST /api/trpc/posts.publish`

**Purpose**: Mark content as published and set the publication timestamp

**Request Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "message": "Post published successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "published": true,
    "published_at": "2025-12-03T05:05:00Z",
    /* other fields */
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/trpc/posts.publish \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 6. Delete Content

**Endpoint**: `DELETE /api/trpc/posts.delete`

**Purpose**: Permanently remove content from the database

**Request Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "message": "Post deleted successfully",
  "success": true
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/api/trpc/posts.delete \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## Database Schema

The `posts` table in Supabase has the following structure:

```sql
CREATE TABLE posts (
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

CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (auto-configured by Manus)
DATABASE_URL=your-database-connection-string

# Server Port
PORT=3000

# OAuth Configuration (auto-configured by Manus)
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# App Configuration
VITE_APP_ID=your-app-id
VITE_APP_TITLE=Nuta Blog CMS
VITE_APP_LOGO=your-logo-url
```

## Security Considerations

1. **Service Role Key Protection**: The `SUPABASE_SERVICE_ROLE_KEY` is stored only on the server and never exposed to the frontend
2. **CORS Configuration**: Configure CORS to allow requests only from your Telegram bot and website domains
3. **Input Validation**: All inputs are validated using Zod schemas before database operations
4. **Error Handling**: Errors are logged server-side and sanitized responses are sent to clients

## Deployment

### Deploy to Render

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Set build command: `pnpm install && pnpm build`
   - Set start command: `pnpm start`
   - Add environment variables from `.env.example`

3. **Deploy**: Render will automatically deploy on push

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import project to Vercel**:
   - Visit https://vercel.com/new
   - Select your GitHub repository
   - Configure environment variables
   - Deploy

3. **Configure serverless functions**:
   - Vercel will automatically detect and deploy the Express server

### Deploy to Other Platforms

The project can be deployed to any Node.js hosting platform:
- Railway
- Fly.io
- DigitalOcean App Platform
- AWS EC2
- Heroku (deprecated but still works)

Build command: `pnpm build`
Start command: `pnpm start`

## Testing

### Using Postman

1. Import the provided Postman collection (see `postman-collection.json`)
2. Set the base URL to your deployment URL
3. Test each endpoint

### Using cURL

See the API Endpoints section above for cURL examples.

### Using the tRPC Client

The frontend can consume the API using the tRPC client:

```typescript
import { trpc } from '@/lib/trpc';

// Create a post
const { data: post } = await trpc.posts.create.useMutation({
  type: 'blog',
  title: 'My Post',
  content: 'Content here...',
});

// Fetch posts
const { data: posts } = trpc.posts.list.useQuery({
  type: 'blog',
  published: true,
});

// Publish a post
await trpc.posts.publish.useMutation({ id: postId });
```

## Troubleshooting

### Supabase Connection Issues

**Error**: `Failed to initialize Supabase schema: client not initialized`

**Solution**: Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correctly set in your environment variables.

### Database Errors

**Error**: `Posts table does not exist`

**Solution**: Create the posts table in Supabase using the SQL schema provided above, or use the Supabase dashboard to create it.

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Configure CORS in your Express server to allow requests from your frontend domain.

## File Structure

```
nuta-blog-cms/
├── server/
│   ├── supabase.ts              # Supabase client initialization
│   ├── db-posts.ts              # Database helper functions
│   ├── routers-posts.ts         # tRPC router for posts
│   ├── routers.ts               # Main app router
│   └── _core/                   # Framework core files
├── client/
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   └── lib/trpc.ts          # tRPC client
│   └── index.html
├── drizzle/
│   └── schema.ts                # Database schema
├── package.json
├── .env.example
└── README.md
```

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Scheduled publishing
- [ ] Content drafts and previews
- [ ] Media hosting via Cloudinary
- [ ] Analytics dashboard
- [ ] User authentication and roles
- [ ] Content versioning
- [ ] Webhook support for external integrations
- [ ] GraphQL API option

## Changelog

### Version 1.0.0 (Initial Release)

- ✅ Supabase integration with service role key
- ✅ Core API endpoints (create, read, update, delete, publish)
- ✅ Content filtering by type and publication status
- ✅ Telegram bot integration support
- ✅ Website content fetching
- ✅ Full documentation and examples
- ✅ Deployment-ready configuration
