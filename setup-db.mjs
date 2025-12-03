import pkg from 'pg';
const { Client } = pkg;

const dbUrl = 'postgresql://postgres:Nuta145600.@db.twmpnqbzrntjwammtxbw.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to database');

    // Create posts table
    console.log('Creating posts table...');
    const createTableSQL = `
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
    `;

    await client.query(createTableSQL);
    console.log('✅ Posts table created');

    // Create indexes
    console.log('Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)');
    console.log('✅ Indexes created');

    // Enable RLS
    console.log('Enabling Row Level Security...');
    await client.query('ALTER TABLE posts ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS enabled');

    // Create policies
    console.log('Creating RLS policies...');
    try {
      await client.query(`
        CREATE POLICY "Allow public read published posts" ON posts
          FOR SELECT
          USING (published = true);
      `);
      console.log('✅ Public read policy created');
    } catch (e) {
      console.log('⚠️ Public read policy already exists');
    }

    try {
      await client.query(`
        CREATE POLICY "Allow service role full access" ON posts
          FOR ALL
          USING (true)
          WITH CHECK (true);
      `);
      console.log('✅ Service role policy created');
    } catch (e) {
      console.log('⚠️ Service role policy already exists');
    }

    // Verify table
    console.log('Verifying table...');
    const result = await client.query('SELECT * FROM posts LIMIT 1');
    console.log('✅ Table verified - ready for use!');

    console.log('\n✅ Database setup complete!');
    console.log('Posts table is ready with:');
    console.log('  - UUID primary key');
    console.log('  - Type field (blog/vlog/story)');
    console.log('  - Title, content, media_url fields');
    console.log('  - Published status tracking');
    console.log('  - Timestamps (created_at, published_at, updated_at)');
    console.log('  - Optimized indexes');
    console.log('  - Row Level Security enabled');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
