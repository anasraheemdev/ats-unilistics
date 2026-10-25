import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to Supabase at:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('\n--- 1. Auth Users ---');
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error listing auth users:', usersErr.message);
  } else {
    console.log(`Found ${users.users.length} auth users:`);
    for (const u of users.users) {
      console.log(` - ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`);
    }
  }

  console.log('\n--- 2. Public Tables Inspection ---');
  const tablesToCheck = ['profiles', 'staff_roles', 'user_roles', 'entitlements', 'user_entitlements', 'access_requests', 'student_cases'];
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(5);
    if (error) {
      console.log(`Table "${table}": NOT ACCESSIBLE (${error.message})`);
    } else {
      console.log(`Table "${table}": EXISTS (${data.length} sample rows)`);
      if (data.length > 0) {
        console.log('Sample row:', JSON.stringify(data[0]));
      }
    }
  }
}

main().catch(console.error);
