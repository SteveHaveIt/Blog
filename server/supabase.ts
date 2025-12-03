import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Supabase client with service role key for server-side operations.
 * This client has full access to the database, bypassing Row Level Security.
 * IMPORTANT: Never expose this client or the service role key to the frontend.
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.warn(
        '[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
      );
      return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Initialize Supabase tables if they don't exist.
 * This function creates the 'posts' table with the required schema.
 * NOTE: Table creation should be done via Supabase dashboard or migrations.
 */
export async function initializeSupabaseSchema() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('[Supabase] Failed to initialize schema: client not available');
    return;
  }

  try {
    // Check if posts table exists by attempting a simple query
    const { error: checkError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist
      console.warn(
        '[Supabase] Posts table does not exist. Please create it via Supabase dashboard with the following schema:'
      );
      console.warn(`
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
      `);
    } else if (!checkError) {
      console.log('[Supabase] Posts table is ready');
    } else {
      console.error('[Supabase] Error checking posts table:', checkError);
    }
  } catch (error) {
    console.error('[Supabase] Error initializing schema:', error);
  }
}

/**
 * Type definitions for posts table
 */
export interface Post {
  id: string;
  type: 'blog' | 'vlog' | 'story';
  title: string | null;
  content: string;
  media_url: string | null;
  published: boolean;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

export interface InsertPost {
  type: 'blog' | 'vlog' | 'story';
  title?: string;
  content: string;
  media_url?: string;
  published?: boolean;
}
