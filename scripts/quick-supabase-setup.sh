#!/bin/bash

# Quick Supabase Setup - Just provide your access token and project details
# This script bypasses interactive login

set -e

echo "===================================================================="
echo "🚀 Quick Supabase Setup for Restaurant KPI Dashboard"
echo "===================================================================="
echo ""

# Instructions to get access token
cat << 'EOF'
📝 STEP 1: Get your Supabase Access Token

   1. Go to: https://supabase.com/dashboard/account/tokens
   2. Click "Generate New Token"
   3. Name it: "restaurant-kpi-cli"
   4. Copy the token (it starts with sbp_...)

📝 STEP 2: Get your Project Credentials (if you have an existing project)

   1. Go to: https://supabase.com/dashboard
   2. Select your project (or create a new one)
   3. Go to Settings > API
   4. Copy:
      - Project URL
      - anon/public key

If you DON'T have a project yet, we'll create one for you!

EOF

echo ""
read -p "Do you have a Supabase account? (y/n): " has_account

if [ "$has_account" != "y" ]; then
    echo ""
    echo "Please create an account at: https://supabase.com/dashboard"
    echo "Then run this script again."
    exit 0
fi

echo ""
read -p "Do you have an existing project you want to use? (y/n): " has_project

if [ "$has_project" == "y" ]; then
    # Use existing project
    echo ""
    echo "Please provide your project credentials:"
    echo ""
    read -p "Project URL (e.g., https://xxxxx.supabase.co): " project_url
    read -p "Anon Key (starts with eyJ...): " anon_key

    # Validate inputs
    if [ -z "$project_url" ] || [ -z "$anon_key" ]; then
        echo "❌ Invalid credentials provided"
        exit 1
    fi

    # Create .env.local
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key
EOF

    echo ""
    echo "✓ Created .env.local with your credentials"
    echo ""

    # Extract project ref from URL
    project_ref=$(echo "$project_url" | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

    echo "📝 Now you need to run the SQL migration:"
    echo ""
    echo "1. Open: https://supabase.com/dashboard/project/$project_ref/sql/new"
    echo "2. Copy the contents of: lib/supabase/migrations/001_initial_schema.sql"
    echo "3. Paste and click 'Run'"
    echo ""
    read -p "Press Enter when you've completed the migration..."

else
    # Create new project
    echo ""
    echo "To create a new project:"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. Click 'New Project'"
    echo "3. Fill in:"
    echo "   - Name: restaurant-kpi-dashboard"
    echo "   - Database Password: (choose a strong password)"
    echo "   - Region: (choose closest to you)"
    echo "4. Wait for project to be created (~2 minutes)"
    echo "5. Go to Settings > API"
    echo "6. Copy the Project URL and anon key"
    echo ""
    echo "Then run this script again and choose 'use existing project'"
    exit 0
fi

# Seed the database
echo ""
echo "🌱 Seeding database with sample data..."
echo ""

npm run seed:supabase

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================================================="
    echo "✅ Supabase Setup Complete!"
    echo "===================================================================="
    echo ""
    echo "Your database now contains:"
    echo "  - 1 restaurant (Rosmalen)"
    echo "  - 28 daily KPI entries (Feb 2025)"
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: NODE_ENV=production npm run build"
    echo "  2. View data: https://supabase.com/dashboard/project/$project_ref/editor"
    echo "  3. Deploy to Vercel with these environment variables"
    echo ""
else
    echo ""
    echo "❌ Failed to seed database"
    echo ""
    echo "Please check:"
    echo "  - Migration was run successfully"
    echo "  - .env.local has correct credentials"
    echo "  - You can access your Supabase dashboard"
    exit 1
fi
