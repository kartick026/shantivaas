#!/usr/bin/env node

/**
 * Supabase Migration Script
 * 
 * This script applies all migration files to your Supabase database.
 * 
 * Usage:
 *   node apply-migrations.js
 * 
 * Environment Variables Required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (has admin access)
 * 
 * Note: This script requires the service role key for admin access.
 * Never expose this key in client-side code!
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file or environment variables.');
  process.exit(1);
}

// Initialize Supabase client with service role key (admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get all migration files in order
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically (timestamps ensure correct order)
  
  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file)
  }));
}

// Execute SQL migration
async function applyMigration(filePath, fileName) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 Applying: ${fileName}`);
    
    // Execute SQL using Supabase RPC (we'll use a direct query)
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We need to use the REST API or create a function
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql function doesn't exist, try alternative method
      // For now, we'll provide instructions to use Supabase Dashboard
      throw new Error('Direct SQL execution not available. Please use Supabase Dashboard or CLI.');
    }
    
    console.log(`✅ Success: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${fileName}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Supabase Migration Application');
  console.log(`📍 Project URL: ${SUPABASE_URL}`);
  console.log('\n⚠️  Note: Supabase JS client has limited SQL execution capabilities.');
  console.log('   For best results, use one of these methods:\n');
  console.log('   1. Supabase Dashboard (Recommended):');
  console.log('      - Go to SQL Editor');
  console.log('      - Copy and paste each migration file');
  console.log('      - Run in order\n');
  console.log('   2. Supabase CLI:');
  console.log('      - Install: npm install -g supabase');
  console.log('      - Run: supabase db push\n');
  console.log('   3. Manual execution via psql or database client\n');
  
  const migrations = getMigrationFiles();
  console.log(`\n📋 Found ${migrations.length} migration files:\n`);
  
  migrations.forEach((migration, index) => {
    console.log(`   ${index + 1}. ${migration.name}`);
  });
  
  console.log('\n📝 Migration files are ready to apply.');
  console.log('   Please use the Supabase Dashboard SQL Editor to apply them manually.');
  console.log('   Or use the Supabase CLI: supabase db push\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getMigrationFiles, applyMigration };

