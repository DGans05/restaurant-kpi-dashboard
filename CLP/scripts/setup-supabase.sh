#!/bin/bash

# Supabase Setup Script for Restaurant KPI Dashboard
# This script helps you set up Supabase and upload your data

set -e  # Exit on error

echo "===================================================================="
echo "🚀 Supabase Setup for Restaurant KPI Dashboard"
echo "===================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase CLI is installed ($(supabase --version))"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo ""
    echo "Opening browser for login..."
    echo "Please log in to your Supabase account in the browser."
    echo ""
    supabase login
    echo ""
fi

echo -e "${GREEN}✓${NC} Logged in to Supabase"
echo ""

# List existing projects
echo "📋 Your existing Supabase projects:"
echo ""
supabase projects list
echo ""

# Ask if they want to create a new project or use existing
echo "Do you want to:"
echo "  1) Create a NEW Supabase project"
echo "  2) Use an EXISTING project"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    # Create new project
    echo ""
    echo "Creating a new Supabase project..."
    echo ""
    read -p "Enter project name (e.g., restaurant-kpi-dashboard): " project_name
    read -p "Enter database password (min 12 chars): " -s db_password
    echo ""
    read -p "Enter region (e.g., us-east-1, eu-west-1): " region

    echo ""
    echo "Creating project '$project_name' in region '$region'..."

    project_ref=$(supabase projects create "$project_name" --db-password "$db_password" --region "$region" --org-id default 2>&1 | grep -o 'Created project.*' | awk '{print $3}')

    if [ -z "$project_ref" ]; then
        echo -e "${RED}❌ Failed to create project${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Project created: $project_ref"
else
    # Use existing project
    echo ""
    read -p "Enter project reference ID: " project_ref
fi

echo ""
echo "Getting project credentials..."

# Get project API URL and anon key
api_url=$(supabase projects api-keys --project-ref "$project_ref" 2>&1 | grep "API URL:" | awk '{print $3}')
anon_key=$(supabase projects api-keys --project-ref "$project_ref" 2>&1 | grep "anon key:" | awk '{print $3}')

if [ -z "$api_url" ] || [ -z "$anon_key" ]; then
    echo -e "${RED}❌ Failed to get project credentials${NC}"
    echo "Please get them manually from: https://supabase.com/dashboard/project/$project_ref/settings/api"
    exit 1
fi

echo -e "${GREEN}✓${NC} Got project credentials"
echo ""

# Create .env.local file
echo "Creating .env.local file..."
cat > .env.local << EOF
# Supabase Configuration
# Project: $project_ref
NEXT_PUBLIC_SUPABASE_URL=$api_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key
EOF

echo -e "${GREEN}✓${NC} Created .env.local"
echo ""

# Run SQL migration
echo "Running SQL migration..."
echo "Opening Supabase SQL Editor..."
echo ""

migration_file="lib/supabase/migrations/001_initial_schema.sql"

if [ -f "$migration_file" ]; then
    echo "Would you like to:"
    echo "  1) Automatically run the migration (recommended)"
    echo "  2) Open SQL Editor manually"
    echo ""
    read -p "Enter choice (1 or 2): " migration_choice

    if [ "$migration_choice" == "1" ]; then
        echo ""
        echo "Running migration..."

        # Use Supabase CLI to run the migration
        supabase db push --project-ref "$project_ref" --password "$db_password" < "$migration_file" 2>&1

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Migration completed successfully"
        else
            echo -e "${YELLOW}⚠️  Automatic migration failed${NC}"
            echo "Opening SQL Editor to run migration manually..."
            open "https://supabase.com/dashboard/project/$project_ref/sql/new"
            echo ""
            echo "Copy and paste the contents of: $migration_file"
            read -p "Press Enter when you've run the migration..."
        fi
    else
        open "https://supabase.com/dashboard/project/$project_ref/sql/new"
        echo ""
        echo "SQL Editor opened. Copy and paste the contents of:"
        echo "  $migration_file"
        echo ""
        read -p "Press Enter when you've run the migration..."
    fi
else
    echo -e "${RED}❌ Migration file not found: $migration_file${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} Database schema created"
echo ""

# Seed the database
echo "Seeding database with data..."
echo ""

npm run seed:supabase

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Database seeded successfully"
else
    echo ""
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi

echo ""
echo "===================================================================="
echo -e "${GREEN}🎉 Supabase Setup Complete!${NC}"
echo "===================================================================="
echo ""
echo "Project Details:"
echo "  📍 Project ID: $project_ref"
echo "  🌐 API URL: $api_url"
echo "  🔑 Credentials: Stored in .env.local"
echo ""
echo "Next Steps:"
echo "  1. Test locally: npm run build && npm run start"
echo "  2. Deploy to Vercel with environment variables"
echo "  3. View your data: https://supabase.com/dashboard/project/$project_ref/editor"
echo ""
echo "===================================================================="
