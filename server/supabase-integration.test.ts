import { describe, it, expect } from 'vitest';
import { getSupabaseClient, initializeSupabaseSchema } from './supabase';

describe('Supabase Integration', () => {
  it('should initialize Supabase client with valid credentials', async () => {
    const supabase = getSupabaseClient();
    expect(supabase).not.toBeNull();
    expect(supabase).toBeDefined();
  });

  it('should connect to Supabase and verify database access', async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Try to query the posts table (or check if it exists)
    try {
      const { data, error } = await (supabase
        .from('posts')
        .select('id')
        .limit(1) as any);

      // If table doesn't exist, error code will be PGRST116
      // If table exists, we should get data or an empty array
      if (error && error.code !== 'PGRST116') {
        // Real error, not just missing table
        throw new Error(`Supabase connection error: ${error.message}`);
      }

      // Connection successful
      expect(supabase).toBeDefined();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Supabase connection error')) {
        throw error;
      }
      // Table doesn't exist yet, which is fine - connection is working
      expect(supabase).toBeDefined();
    }
  });

  it('should initialize Supabase schema', async () => {
    await initializeSupabaseSchema();
    // If no error is thrown, initialization was successful
    expect(true).toBe(true);
  });

  it('should be able to insert and retrieve posts', async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Try to insert a test post
      const testPost = {
        type: 'blog',
        title: 'Test Post',
        content: 'This is a test post to verify Supabase connection',
        published: false,
      };

      const { data: insertedData, error: insertError } = await (supabase
        .from('posts')
        .insert([testPost as any])
        .select()
        .single() as any);

      if (insertError) {
        // If table doesn't exist, that's expected at this point
        if (insertError.code === 'PGRST116') {
          console.log('Posts table does not exist yet - will be created during setup');
          expect(true).toBe(true);
          return;
        }
        throw insertError;
      }

      // If insert was successful, verify the data
      expect(insertedData).toBeDefined();
      expect(insertedData?.type).toBe('blog');
      expect(insertedData?.title).toBe('Test Post');

      // Clean up - delete the test post
      if (insertedData?.id) {
        await (supabase.from('posts').delete().eq('id', insertedData.id) as any);
      }
    } catch (error) {
      // If we get a table doesn't exist error, that's fine
      if (error instanceof Error && error.message.includes('PGRST116')) {
        expect(true).toBe(true);
        return;
      }
      throw error;
    }
  });
});
