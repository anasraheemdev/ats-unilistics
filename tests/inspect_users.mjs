/**
 * Unilistics User & Role Inspector Script
 * 
 * Run with:
 *   node tests/inspect_users.mjs
 * 
 * Or use the full management tool:
 *   node scripts/manage_user.mjs list
 *   node scripts/manage_user.mjs set-role <email> <role> [fullName] [password]
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env from project root
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function inspect() {
  console.log('Connecting to:', env.VITE_SUPABASE_URL);

  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('Error fetching auth users:', authErr.message);
    return;
  }

  console.log(`\nFound ${authData.users.length} user(s) in Supabase Auth:\n`);

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      account_status,
      staff_roles!staff_roles_user_id_fkey(role),
      entitlements!entitlements_user_id_fkey(entitlement_type, status)
    `);

  const profileMap = new Map();
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p);
    }
  }

  for (const u of authData.users) {
    const prof = profileMap.get(u.id);
    const staffRole = prof?.staff_roles?.[0]?.role || prof?.staff_roles?.role;
    const activeEntitlements = (prof?.entitlements || [])
      .filter((e) => e.status === 'active')
      .map((e) => e.entitlement_type);

    let effectiveRole = 'explorer';
    if (staffRole) {
      effectiveRole = staffRole;
    } else if (activeEntitlements.includes('managed_application_case')) {
      effectiveRole = 'managed_student';
    }

    console.log(`Email:          ${u.email}`);
    console.log(`User ID:        ${u.id}`);
    console.log(`Full Name:      ${prof?.full_name || 'N/A'}`);
    console.log(`Effective Role: ${effectiveRole.toUpperCase()}`);
    console.log(`Account Status: ${prof?.account_status || 'active'}`);
    console.log(`Entitlements:   ${activeEntitlements.join(', ') || 'none'}`);
    console.log(`Confirmed:      ${u.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log('---------------------------------------------------------');
  }

  if (authData.users.length === 0) {
    console.log('No users registered yet.');
    console.log('Use "node scripts/manage_user.mjs set-role <email> <role> [name] [password]" to add one.');
  }
}

inspect().catch(console.error);
