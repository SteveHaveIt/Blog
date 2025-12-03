# Nuta Mini Program - Project TODO

## Core Features
- [ ] Supabase integration setup with service role key
- [ ] Database schema for posts table (id, type, title, content, media_url, published, created_at, published_at)
- [ ] POST /post endpoint - Accept content from Telegram bot
- [ ] GET /getposts endpoint - Retrieve content for website consumption
- [ ] POST /publish/:id endpoint - Mark content as published
- [ ] DELETE /delete/:id endpoint - Delete content securely
- [ ] PUT /update/:id endpoint - Update existing content

## Security & Configuration
- [ ] Environment variables setup (.env.example with placeholders)
- [ ] CORS configuration for Telegram bot and website requests
- [ ] Service role key protection (server-side only)
- [ ] Input validation for all endpoints
- [ ] Error handling for missing/invalid fields

## Website Integration
- [ ] JSON response format for frontend compatibility
- [ ] Filter support by content type (blog/vlog/story)
- [ ] Filter support by published status
- [ ] Response pagination (optional)

## Testing & Documentation
- [ ] README.md with endpoint documentation
- [ ] Example cURL requests for /post and /getposts
- [ ] Postman collection or similar testing guide
- [ ] Unit tests for API endpoints

## Deployment Preparation
- [ ] index.js (main server file)
- [ ] package.json with all dependencies
- [ ] .env.example file with placeholders
- [ ] Deployment guide for Render/Vercel
- [ ] GitHub repository setup and push

## Optional Advanced Features
- [ ] Drafts & previews functionality
- [ ] Scheduled publishing
- [ ] Media hosting via Cloudinary or direct links
- [ ] Analytics tracking (view/engagement metrics)

## Completed Features
- [x] Supabase integration setup with service role key
- [x] Database schema for posts table (id, type, title, content, media_url, published, created_at, published_at)
- [x] POST /post endpoint - Accept content from Telegram bot
- [x] GET /getposts endpoint - Retrieve content for website consumption
- [x] POST /publish/:id endpoint - Mark content as published
- [x] DELETE /delete/:id endpoint - Delete content securely
- [x] PUT /update/:id endpoint - Update existing content
- [x] Environment variables setup (.env.example with placeholders)
- [x] CORS configuration for Telegram bot and website requests
- [x] Input validation for all endpoints
- [x] Error handling for missing/invalid fields
- [x] JSON response format for frontend compatibility
- [x] Filter support by content type (blog/vlog/story)
- [x] Filter support by published status
- [x] README.md with endpoint documentation
- [x] Example cURL requests for /post and /getposts
- [x] Unit tests for API endpoints (all 13 tests passing)

## Pending Tasks
- [x] Receive Supabase credentials from user
- [x] Test Supabase connection (credentials validated)
- [ ] Create posts table in Supabase (user to run SQL script)
- [ ] Test all API endpoints with sample data (after table creation)
- [x] Push code to GitHub repository
- [x] Create deployment guide for Render/Vercel

## Completed in This Session
- [x] Supabase integration with service role key
- [x] Complete tRPC API endpoints (create, read, update, delete, publish)
- [x] Database helper functions for all CRUD operations
- [x] Comprehensive unit tests (13 tests, all passing)
- [x] Full README documentation with API examples
- [x] Input validation using Zod
- [x] Error handling and logging
- [x] Deployment guide for Render and Vercel
- [x] Code pushed to GitHub (SteveHaveIt/Blog)
- [x] Environment variables configured securely
