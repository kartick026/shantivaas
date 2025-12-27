#!/bin/bash

# Supabase Migration Script (CLI)
# 
# This script applies all migrations using Supabase CLI
# 
# Prerequisites:
#   1. Install Supabase CLI: npm install -g supabase
#   2. Login: supabase login
#   3. Link project: supabase link --project-ref YOUR_PROJECT_REF
# 
# Usage:
#   chmod +x apply-migrations-cli.sh
#   ./apply-migrations-cli.sh

set -e

echo "🚀 Applying Supabase Migrations via CLI"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Warning: Project not linked"
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
    echo "   Or initialize: supabase init"
    exit 1
fi

echo "✅ Supabase CLI found"
echo "📋 Applying migrations..."
echo ""

# Apply all migrations
supabase db push

echo ""
echo "✅ Migrations applied successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify tables in Supabase Dashboard"
echo "   2. Check RLS policies are enabled"
echo "   3. Test with sample data"

