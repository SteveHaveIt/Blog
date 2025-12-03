import { getSupabaseClient, type Post } from './supabase';

export interface InsertPost {
  type: 'blog' | 'vlog' | 'story';
  title?: string;
  content: string;
  media_url?: string;
  published?: boolean;
}

/**
 * Insert a new post into the database
 */
export async function createPost(post: InsertPost): Promise<Post | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error }: any = await ((supabase
      .from('posts') as any)
      .insert([post as any])
      .select()
      .single() as any);

    if (error) {
      console.error('[Database] Error creating post:', error);
      throw error;
    }

    return (data as Post) || null;
  } catch (error) {
    console.error('[Database] Exception creating post:', error);
    throw error;
  }
}

/**
 * Fetch all posts with optional filtering
 */
export async function getPosts(
  filters?: {
    type?: 'blog' | 'vlog' | 'story';
    published?: boolean;
  }
): Promise<Post[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    let query: any = supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.published !== undefined) {
      query = query.eq('published', filters.published);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Database] Error fetching posts:', error);
      throw error;
    }

    return ((data || []) as Post[]);
  } catch (error) {
    console.error('[Database] Exception fetching posts:', error);
    throw error;
  }
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await (supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single() as any);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected
      console.error('[Database] Error fetching post:', error);
      throw error;
    }

    return ((data as Post) || null);
  } catch (error) {
    console.error('[Database] Exception fetching post:', error);
    throw error;
  }
}

/**
 * Update a post
 */
export async function updatePost(
  id: string,
  updates: Partial<InsertPost>
): Promise<Post | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error }: any = await ((supabase
      .from('posts') as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single() as any);

    if (error) {
      console.error('[Database] Error updating post:', error);
      throw error;
    }

    return ((data as Post) || null);
  } catch (error) {
    console.error('[Database] Exception updating post:', error);
    throw error;
  }
}

/**
 * Publish a post (mark as published and set published_at)
 */
export async function publishPost(id: string): Promise<Post | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const updateData = {
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error }: any = await ((supabase
      .from('posts') as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single() as any);

    if (error) {
      console.error('[Database] Error publishing post:', error);
      throw error;
    }

    return ((data as Post) || null);
  } catch (error) {
    console.error('[Database] Exception publishing post:', error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { error }: any = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      console.error('[Database] Error deleting post:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[Database] Exception deleting post:', error);
    throw error;
  }
}
