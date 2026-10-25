#!/usr/bin/env node

/**
 * Unilistics Supabase User & Role Management Script
 * 
 * Usage:
 *   node scripts/manage_user.mjs list
 *   node scripts/manage_user.mjs set-role <email> <role> [fullName] [password]
 *   node scripts/manage_user.mjs delete-user <email>
 * 
 * Available Roles:
 *   - super_admin     : Full system control, role provisioning, audit logging
 *   - admin           : Admissions operations, catalogue management, access approvals
 *   - counsellor      : Assigned student cases desk, document review queue
 *   - managed_student : Dedicated case room, applications, documents, tasks
 *   - explorer        : Public university catalogue browsing & bookmarks
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env file
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found in current directory.');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        env[k] = v;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const VALID_ROLES = ['super_admin', 'admin', 'counsellor', 'managed_student', 'explorer'];

async function listUsers() {
  console.log(`\n===============================================================`);
  console.log(` Unilistics Supabase Platform User Registry`);
  console.log(` Connected to: ${supabaseUrl}`);
  console.log(`===============================================================\n`);

  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('Error fetching auth users:', authErr.message);
    return;
  }

  if (!authData.users || authData.users.length === 0) {
    console.log('No users found in Supabase Auth.\n');
    console.log('To add a user, run:');
    console.log('  node scripts/manage_user.mjs set-role <email> <role> [fullName] [password]\n');
    return;
  }

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

  console.log(`Found ${authData.users.length} registered user(s):\n`);

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

    console.log(`• Email:          ${u.email}`);
    console.log(`  User ID:        ${u.id}`);
    console.log(`  Full Name:      ${prof?.full_name || u.user_metadata?.full_name || 'N/A'}`);
    console.log(`  Effective Role: ${effectiveRole.toUpperCase()}`);
    console.log(`  Account Status: ${prof?.account_status || 'active'}`);
    console.log(`  Entitlements:   ${activeEntitlements.join(', ') || 'none'}`);
    console.log(`  Confirmed At:   ${u.email_confirmed_at || 'Not confirmed'}`);
    console.log(`  Created At:     ${u.created_at}`);
    console.log('---------------------------------------------------------------');
  }
}

async function setRole(email, role, fullName, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanRole = role.trim().toLowerCase();

  if (!VALID_ROLES.includes(cleanRole)) {
    console.error(`Invalid role "${cleanRole}". Allowed roles are: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  console.log(`\nApplying role "${cleanRole}" for: ${cleanEmail}...`);

  // 1. Find or create user in Supabase Auth
  let userId = null;
  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`  ✓ Found existing auth account (ID: ${userId})`);

    // Update password if provided
    const updatePayload = { email_confirm: true };
    if (password) {
      updatePayload.password = password;
    }
    if (fullName) {
      updatePayload.user_metadata = { ...existingUser.user_metadata, full_name: fullName };
    }
    await supabase.auth.admin.updateUserById(userId, updatePayload);
  } else {
    // Create new user in auth
    const defaultPassword = password || 'Unilistics2026!';
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName || cleanEmail.split('@')[0] },
    });

    if (createErr) {
      console.error('Failed to create auth user:', createErr.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`  ✓ Created new auth account (ID: ${userId})`);
    console.log(`  ✓ Password configured: ${defaultPassword}`);
  }

  const displayName = fullName || existingUser?.user_metadata?.full_name || cleanEmail.split('@')[0];

  // 2. Ensure Profile exists in public.profiles
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: cleanEmail,
    full_name: displayName,
    account_status: 'active',
    updated_at: new Date().toISOString(),
  });

  if (profErr) {
    console.error('Error upserting profile:', profErr.message);
    process.exit(1);
  }
  console.log(`  ✓ Upserted profile with status "active"`);

  // 3. Assign role-specific tables
  if (cleanRole === 'super_admin' || cleanRole === 'admin' || cleanRole === 'counsellor') {
    // Staff roles
    const { error: staffErr } = await supabase.from('staff_roles').upsert({
      user_id: userId,
      role: cleanRole,
    });
    if (staffErr) {
      console.error('Error assigning staff role:', staffErr.message);
      process.exit(1);
    }
    console.log(`  ✓ Configured staff_roles table with role "${cleanRole}"`);

    // Ensure explorer_catalogue entitlement
    await supabase.from('entitlements').upsert(
      {
        user_id: userId,
        entitlement_type: 'explorer_catalogue',
        status: 'active',
      },
      { onConflict: 'user_id,entitlement_type' }
    );
  } else if (cleanRole === 'managed_student') {
    // Managed student: remove from staff_roles if present
    await supabase.from('staff_roles').delete().eq('user_id', userId);

    // Add managed_application_case and explorer_catalogue entitlements
    await supabase.from('entitlements').upsert(
      {
        user_id: userId,
        entitlement_type: 'managed_application_case',
        status: 'active',
      },
      { onConflict: 'user_id,entitlement_type' }
    );

    await supabase.from('entitlements').upsert(
      {
        user_id: userId,
        entitlement_type: 'explorer_catalogue',
        status: 'active',
      },
      { onConflict: 'user_id,entitlement_type' }
    );
    console.log(`  ✓ Granted "managed_application_case" and "explorer_catalogue" entitlements`);

    // Ensure student_case exists so student dashboard has a case room
    const { data: existingCase } = await supabase
      .from('student_cases')
      .select('id')
      .eq('student_id', userId)
      .maybeSingle();

    if (!existingCase) {
      await supabase.from('student_cases').insert({
        student_id: userId,
        target_country: 'germany',
        target_degree: 'masters',
        target_intake_season: 'winter',
        target_intake_year: 2026,
        current_stage: 'profile_creation',
        stage_status: 'in_progress',
        next_required_action: 'Complete document upload checklist',
        responsible_party: 'student',
      });
      console.log(`  ✓ Initialized student case room in student_cases table`);
    }
  } else if (cleanRole === 'explorer') {
    // Explorer: remove from staff_roles and revoke managed case
    await supabase.from('staff_roles').delete().eq('user_id', userId);
    await supabase
      .from('entitlements')
      .delete()
      .eq('user_id', userId)
      .eq('entitlement_type', 'managed_application_case');

    await supabase.from('entitlements').upsert(
      {
        user_id: userId,
        entitlement_type: 'explorer_catalogue',
        status: 'active',
      },
      { onConflict: 'user_id,entitlement_type' }
    );
    console.log(`  ✓ Configured as verified explorer with "explorer_catalogue" entitlement`);
  }

  console.log(`\nSUCCESS: User ${cleanEmail} is now assigned as "${cleanRole.toUpperCase()}".`);
  console.log(`They can now sign in at http://localhost:5175/sign-in using their email & password.\n`);
}

async function deleteUser(email) {
  const cleanEmail = email.trim().toLowerCase();
  const { data: userList } = await supabase.auth.admin.listUsers();
  const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

  if (!user) {
    console.log(`User "${cleanEmail}" not found.`);
    return;
  }

  console.log(`Deleting user ${cleanEmail} (${user.id})...`);
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Failed to delete user:', error.message);
  } else {
    console.log(`User ${cleanEmail} deleted successfully.`);
  }
}

// Main execution
const [,, command, ...args] = process.argv;

if (!command || command === 'help') {
  console.log(`
Unilistics Supabase User Role Management CLI

Commands:
  node scripts/manage_user.mjs list
      List all registered users, effective roles, and entitlements

  node scripts/manage_user.mjs set-role <email> <role> [fullName] [password]
      Assign or create a user with a specific role
      Roles: admin, super_admin, counsellor, managed_student, explorer

      Examples:
        node scripts/manage_user.mjs set-role admin@unilistics.com admin "Admin Officer" "MyPass123!"
        node scripts/manage_user.mjs set-role counsellor@unilistics.com counsellor "Lead Counsellor"
        node scripts/manage_user.mjs set-role student@test.pk managed_student "Ahmad Ali"

  node scripts/manage_user.mjs delete-user <email>
      Delete an existing user from Supabase Auth and cascade delete profile
`);
  listUsers().catch(console.error);
} else if (command === 'list') {
  listUsers().catch(console.error);
} else if (command === 'set-role') {
  const [email, role, fullName, password] = args;
  if (!email || !role) {
    console.error('Usage: node scripts/manage_user.mjs set-role <email> <role> [fullName] [password]');
    process.exit(1);
  }
  setRole(email, role, fullName, password).catch(console.error);
} else if (command === 'delete-user') {
  const [email] = args;
  if (!email) {
    console.error('Usage: node scripts/manage_user.mjs delete-user <email>');
    process.exit(1);
  }
  deleteUser(email).catch(console.error);
} else {
  console.error(`Unknown command "${command}". Run "node scripts/manage_user.mjs help" for usage.`);
}
