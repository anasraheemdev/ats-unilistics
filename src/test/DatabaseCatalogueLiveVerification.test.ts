import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Catalogue Live Verification', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env: Record<string, string> = {};
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        env[key.trim()] = rest.join('=').trim();
      }
    }

    if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials missing in .env');
    }

    supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  });

  it('has loaded all universities into Supabase Postgres database', async () => {
    const { count, error } = await supabase.from('universities').select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(count).toBeGreaterThanOrEqual(512);
  });

  it('has loaded all degree programs into Supabase Postgres database', async () => {
    const { count, error } = await supabase.from('programs').select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(count).toBeGreaterThanOrEqual(4816);
  });

  it('has configured exactly 50 institutions in public.preview_allowlist', async () => {
    const { count, error } = await supabase.from('preview_allowlist').select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(count).toBe(50);
  });

  it('has populated degree program intakes for deadlines tracking', async () => {
    const { count, error } = await supabase.from('intakes').select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(count).toBeGreaterThanOrEqual(5000);
  });

  it('has populated verified national scholarships for Germany, France, Italy, and Romania', async () => {
    const { count, error } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(count).toBeGreaterThanOrEqual(11);
  });

  it('browses universities with country filter via browse_universities RPC', async () => {
    const { data: deRes, error } = await supabase.rpc('browse_universities', {
      p_country: 'de',
      p_page: 1,
      p_page_size: 10,
    });
    expect(error).toBeNull();
    expect(deRes.total_count).toBeGreaterThan(0);
    expect(deRes.items.length).toBeGreaterThan(0);
  });

  it('browses programs with degree level and country filter via browse_programs RPC', async () => {
    const { data: progRes, error } = await supabase.rpc('browse_programs', {
      p_country: 'de',
      p_degree_level: 'masters',
      p_page: 1,
      p_page_size: 10,
    });
    expect(error).toBeNull();
    expect(progRes.total_count).toBeGreaterThan(0);
    expect(progRes.items.length).toBeGreaterThan(0);
    expect(progRes.items[0]).toHaveProperty('program_name');
    expect(progRes.items[0]).toHaveProperty('university_name');
  });
});
