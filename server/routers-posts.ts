import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import {
  createPost,
  deletePost,
  getPosts,
  getPostById,
  publishPost,
  updatePost,
  type InsertPost,
} from './db-posts';
import { TRPCError } from '@trpc/server';

// Validation schemas
const postTypeSchema = z.enum(['blog', 'vlog', 'story']);

const createPostSchema = z.object({
  type: postTypeSchema,
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  media_url: z.string().url().optional(),
});

const updatePostSchema = z.object({
  type: postTypeSchema.optional(),
  title: z.string().optional(),
  content: z.string().min(1).optional(),
  media_url: z.string().url().optional(),
});

const getPostsFilterSchema = z.object({
  type: postTypeSchema.optional(),
  published: z.boolean().optional(),
});

export const postsRouter = router({
  /**
   * POST /api/trpc/posts.create
   * Accept content from Telegram bot or other sources
   * Used by: Telegram bot integration
   */
  create: publicProcedure.input(createPostSchema).mutation(async ({ input }) => {
    try {
      const postData: InsertPost = {
        type: input.type,
        title: input.title,
        content: input.content,
        media_url: input.media_url,
        published: false, // Default to draft
      };

      const post = await createPost(postData);

      if (!post) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
        });
      }

      return {
        message: 'Content received and stored',
        data: post,
      };
    } catch (error) {
      console.error('[Posts Router] Error creating post:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create post',
      });
    }
  }),

  /**
   * GET /api/trpc/posts.list
   * Retrieve content for website consumption
   * Supports filtering by type and published status
   * Used by: Website frontend
   */
  list: publicProcedure.input(getPostsFilterSchema).query(async ({ input }) => {
    try {
      const posts = await getPosts({
        type: input.type,
        published: input.published,
      });

      return {
        data: posts,
        count: posts.length,
      };
    } catch (error) {
      console.error('[Posts Router] Error listing posts:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch posts',
      });
    }
  }),

  /**
   * GET /api/trpc/posts.getById
   * Retrieve a single post by ID
   */
  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    try {
      const post = await getPostById(input.id);

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return post;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error('[Posts Router] Error fetching post:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch post',
      });
    }
  }),

  /**
   * PUT /api/trpc/posts.update
   * Update existing content
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePostSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const post = await updatePost(input.id, input.data);

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        return {
          message: 'Post updated successfully',
          data: post,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Posts Router] Error updating post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update post',
        });
      }
    }),

  /**
   * POST /api/trpc/posts.publish
   * Mark content as published and set published_at
   */
  publish: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        const post = await publishPost(input.id);

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        return {
          message: 'Post published successfully',
          data: post,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Posts Router] Error publishing post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to publish post',
        });
      }
    }),

  /**
   * DELETE /api/trpc/posts.delete
   * Delete content securely
   */
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deletePost(input.id);

        return {
          message: 'Post deleted successfully',
          success: true,
        };
      } catch (error) {
        console.error('[Posts Router] Error deleting post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete post',
        });
      }
    }),
});
