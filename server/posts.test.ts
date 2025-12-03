import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost, getPosts, getPostById, updatePost, publishPost, deletePost } from './db-posts';
import { getSupabaseClient } from './supabase';

// Mock Supabase client
vi.mock('./supabase', () => ({
  getSupabaseClient: vi.fn(),
  initializeSupabaseSchema: vi.fn(),
}));

describe('Posts Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post with required fields', async () => {
      const mockPost = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'blog' as const,
        title: 'Test Blog',
        content: 'Test content',
        media_url: 'https://example.com/image.png',
        published: false,
        created_at: '2025-12-03T05:00:00Z',
        published_at: null,
        updated_at: '2025-12-03T05:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await createPost({
        type: 'blog',
        title: 'Test Blog',
        content: 'Test content',
        media_url: 'https://example.com/image.png',
      });

      expect(result).toEqual(mockPost);
    });

    it('should create a post with minimal fields', async () => {
      const mockPost = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'vlog' as const,
        title: undefined,
        content: 'Test content',
        media_url: undefined,
        published: false,
        created_at: '2025-12-03T05:00:00Z',
        published_at: null,
        updated_at: '2025-12-03T05:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await createPost({
        type: 'vlog',
        content: 'Test content',
      });

      expect(result?.type).toBe('vlog');
      expect(result?.content).toBe('Test content');
    });

    it('should throw error if Supabase client is not initialized', async () => {
      (getSupabaseClient as any).mockReturnValue(null);

      await expect(
        createPost({
          type: 'blog',
          content: 'Test content',
        })
      ).rejects.toThrow('Supabase client not initialized');
    });
  });

  describe('getPosts', () => {
    it('should fetch all posts', async () => {
      const mockPosts = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'blog' as const,
          title: 'Blog 1',
          content: 'Content 1',
          media_url: null,
          published: true,
          created_at: '2025-12-03T05:00:00Z',
          published_at: '2025-12-03T05:05:00Z',
          updated_at: '2025-12-03T05:00:00Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'vlog' as const,
          title: 'Vlog 1',
          content: 'Content 2',
          media_url: 'https://example.com/video.mp4',
          published: false,
          created_at: '2025-12-03T05:10:00Z',
          published_at: null,
          updated_at: '2025-12-03T05:10:00Z',
        },
      ];

      // Create a mock query that resolves to the posts
      const mockQuery = Promise.resolve({ data: mockPosts, error: null });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              eq: vi.fn(() => mockQuery),
              [Symbol.toStringTag]: 'Promise',
              then: mockQuery.then.bind(mockQuery),
              catch: mockQuery.catch.bind(mockQuery),
              finally: mockQuery.finally.bind(mockQuery),
            })),
            [Symbol.toStringTag]: 'Promise',
            then: mockQuery.then.bind(mockQuery),
            catch: mockQuery.catch.bind(mockQuery),
            finally: mockQuery.finally.bind(mockQuery),
          })),
          [Symbol.toStringTag]: 'Promise',
          then: mockQuery.then.bind(mockQuery),
          catch: mockQuery.catch.bind(mockQuery),
          finally: mockQuery.finally.bind(mockQuery),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await getPosts();

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe('blog');
      expect(result[1]?.type).toBe('vlog');
    });

    it('should filter posts by type', async () => {
      const mockPosts = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'blog' as const,
          title: 'Blog 1',
          content: 'Content 1',
          media_url: null,
          published: true,
          created_at: '2025-12-03T05:00:00Z',
          published_at: '2025-12-03T05:05:00Z',
          updated_at: '2025-12-03T05:00:00Z',
        },
      ];

      const mockQuery = Promise.resolve({ data: mockPosts, error: null });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              eq: vi.fn(() => mockQuery),
              [Symbol.toStringTag]: 'Promise',
              then: mockQuery.then.bind(mockQuery),
              catch: mockQuery.catch.bind(mockQuery),
              finally: mockQuery.finally.bind(mockQuery),
            })),
            [Symbol.toStringTag]: 'Promise',
            then: mockQuery.then.bind(mockQuery),
            catch: mockQuery.catch.bind(mockQuery),
            finally: mockQuery.finally.bind(mockQuery),
          })),
          [Symbol.toStringTag]: 'Promise',
          then: mockQuery.then.bind(mockQuery),
          catch: mockQuery.catch.bind(mockQuery),
          finally: mockQuery.finally.bind(mockQuery),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await getPosts({ type: 'blog' });

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe('blog');
    });

    it('should filter posts by published status', async () => {
      const mockPosts = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'blog' as const,
          title: 'Blog 1',
          content: 'Content 1',
          media_url: null,
          published: true,
          created_at: '2025-12-03T05:00:00Z',
          published_at: '2025-12-03T05:05:00Z',
          updated_at: '2025-12-03T05:00:00Z',
        },
      ];

      const mockQuery = Promise.resolve({ data: mockPosts, error: null });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              eq: vi.fn(() => mockQuery),
              [Symbol.toStringTag]: 'Promise',
              then: mockQuery.then.bind(mockQuery),
              catch: mockQuery.catch.bind(mockQuery),
              finally: mockQuery.finally.bind(mockQuery),
            })),
            [Symbol.toStringTag]: 'Promise',
            then: mockQuery.then.bind(mockQuery),
            catch: mockQuery.catch.bind(mockQuery),
            finally: mockQuery.finally.bind(mockQuery),
          })),
          [Symbol.toStringTag]: 'Promise',
          then: mockQuery.then.bind(mockQuery),
          catch: mockQuery.catch.bind(mockQuery),
          finally: mockQuery.finally.bind(mockQuery),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await getPosts({ published: true });

      expect(result).toHaveLength(1);
      expect(result[0]?.published).toBe(true);
    });
  });

  describe('getPostById', () => {
    it('should fetch a post by ID', async () => {
      const mockPost = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'blog' as const,
        title: 'Test Blog',
        content: 'Test content',
        media_url: null,
        published: true,
        created_at: '2025-12-03T05:00:00Z',
        published_at: '2025-12-03T05:05:00Z',
        updated_at: '2025-12-03T05:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await getPostById('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toEqual(mockPost);
    });

    it('should return null if post not found', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await getPostById('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBeNull();
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const mockPost = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'blog' as const,
        title: 'Updated Title',
        content: 'Updated content',
        media_url: null,
        published: false,
        created_at: '2025-12-03T05:00:00Z',
        published_at: null,
        updated_at: '2025-12-03T05:10:00Z',
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
              })),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await updatePost('550e8400-e29b-41d4-a716-446655440000', {
        title: 'Updated Title',
        content: 'Updated content',
      });

      expect(result?.title).toBe('Updated Title');
      expect(result?.content).toBe('Updated content');
    });
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      const mockPost = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'blog' as const,
        title: 'Test Blog',
        content: 'Test content',
        media_url: null,
        published: true,
        created_at: '2025-12-03T05:00:00Z',
        published_at: '2025-12-03T05:10:00Z',
        updated_at: '2025-12-03T05:10:00Z',
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
              })),
            })),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await publishPost('550e8400-e29b-41d4-a716-446655440000');

      expect(result?.published).toBe(true);
      expect(result?.published_at).not.toBeNull();
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const result = await deletePost('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBe(true);
    });

    it('should throw error if delete fails', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Delete failed' },
            }),
          })),
        })),
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      await expect(deletePost('550e8400-e29b-41d4-a716-446655440000')).rejects.toThrow();
    });
  });
});
