#!/bin/bash

# Restaurant KPI Dashboard - Quick Deployment Script
# This script prepares your project for deployment

set -e

echo "🚀 Restaurant KPI Dashboard - Deployment Preparation"
echo "=================================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo "✓ npm $(npm --version)"
echo "✓ Git $(git --version)"
echo ""

# Check project structure
echo "✓ Checking project structure..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found"
    exit 1
fi

if [ ! -f "supabase/migrations/20260202000001_initial_schema.sql" ]; then
    echo "❌ Database migrations not found"
    exit 1
fi

echo "✓ Project structure verified"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Build check
echo "🔨 Building project..."
npm run build
if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
else
    echo "❌ Build failed. Fix errors above and try again."
    exit 1
fi
echo ""

# Git check
echo "✓ Checking Git status..."
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized"
    echo "   Initialize with: git init"
    echo "   Then add remote: git remote add origin https://github.com/YOUR-USERNAME/restaurant-kpi-dashboard.git"
    echo "   Then push: git push -u origin main"
else
    echo "✓ Git repository found"
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "not set")
    echo "  Remote: $REMOTE"
fi
echo ""

# Environment variables
echo "⚙️  Environment Configuration"
echo "------------------------"
echo "Development (.env.local):"
echo "  Copy from .env.example and add your Supabase credentials"
echo ""
echo "Production (Vercel):"
echo "  Add these environment variables in Vercel dashboard:"
echo "    - NEXT_PUBLIC_SUPABASE_URL"
echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""

# Summary
echo "=================================================="
echo "✅ Project is ready for deployment!"
echo "=================================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1️⃣  Create Supabase project at supabase.com"
echo "   - Copy API credentials to .env.local"
echo "   - Run migrations via SQL Editor"
echo ""
echo "2️⃣  Push code to GitHub"
echo "   git add ."
echo "   git commit -m 'Initial commit: Restaurant KPI Dashboard'"
echo "   git push"
echo ""
echo "3️⃣  Create Vercel project at vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "4️⃣  Test production deployment"
echo "   - Register test account"
echo "   - Create KPI entries"
echo "   - Verify features working"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
