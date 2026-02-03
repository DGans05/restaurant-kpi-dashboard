# Supabase Setup Guide

This guide walks you through setting up your Supabase project for the Restaurant KPI Dashboard.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"** button
3. Fill in project details:
   - **Name**: `restaurant-kpi-dashboard` (or your preferred name)
   - **Database Password**: Create a strong password and **save it securely** (you'll need this for database access)
   - **Region**: Select the region closest to your users for best performance
   - **Pricing Plan**: Free tier is sufficient for testing and small deployments
4. Click **"Create new project"**
5. Wait 2-3 minutes for project creation to complete

## Step 2: Get API Credentials

1. In your Supabase dashboard, navigate to **Settings** → **API**
2. You'll see several important values:
   - **Project URL**: Copy this value → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key: Copy this value → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key: Copy this value → This is your `SUPABASE_SERVICE_ROLE_KEY` (for local development only, **never commit to Git or add to Vercel**)

3. Save these values securely. You'll need them for:
   - Local development (`.env.local` file)
   - Vercel deployment (environment variables)

**Example format:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Run Database Migrations

You need to run two SQL migrations to set up your database schema and security policies.

### Migration 1: Initial Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"+ New Query"**
3. Copy the entire contents of `supabase/migrations/20260202000001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for the query to complete successfully
7. You should see a success message

**What this migration creates:**
- `user_role` enum type (admin, manager, viewer)
- `profiles` table (extends Supabase auth.users)
- `restaurants` table
- `user_restaurants` table (many-to-many relationship)
- `kpi_entries` table
- `audit_logs` table
- Indexes for performance
- Row Level Security enabled on all tables
- Triggers for `updated_at` timestamps

### Migration 2: Row Level Security Policies

1. Still in **SQL Editor**, click **"+ New Query"** again
2. Copy the entire contents of `supabase/migrations/20260202000002_rls_policies.sql`
3. Paste into the SQL Editor
4. Click **"Run"**
5. Wait for completion

**What this migration creates:**
- Security policies for `profiles` table
- Security policies for `restaurants` table
- Security policies for `user_restaurants` table
- Security policies for `kpi_entries` table
- Security policies for `audit_logs` table

### Verify Tables Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `restaurants`
   - ✅ `user_restaurants`
   - ✅ `kpi_entries`
   - ✅ `audit_logs`

If any tables are missing, check the SQL Editor for error messages and re-run the migrations.

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Ensure **Email** provider is enabled (should be enabled by default)
3. Go to **Authentication** → **Settings**
4. Under **"Site URL"**, set:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-vercel-domain.vercel.app` (update this after Vercel deployment)

## Step 5: Test Local Connection (Optional)

Before deploying to Vercel, you can test the connection locally:

1. Create `.env.local` file in your project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000/register](http://localhost:3000/register)
5. Try registering a test account
6. If successful, you'll be redirected to `/dashboard`

## Troubleshooting

### Migration Errors

If you see errors when running migrations:

1. **"relation already exists"**: The table/type already exists. You can either:
   - Drop the existing objects and re-run
   - Skip the migration if everything is already set up correctly

2. **"permission denied"**: Make sure you're running migrations in the SQL Editor, not through a restricted connection

3. **Syntax errors**: Double-check that you copied the entire migration file without modifications

### Authentication Not Working

- Verify Email provider is enabled in Authentication → Providers
- Check that Site URL matches your application URL
- Ensure environment variables are set correctly

### Can't See Tables

- Refresh the Table Editor page
- Check SQL Editor for any error messages
- Verify migrations completed successfully (green checkmark)

## Next Steps

After completing Supabase setup:

1. ✅ Copy your credentials to Vercel environment variables (see VERCEL_SETUP.md)
2. ✅ Update Supabase Site URL to your Vercel domain after deployment
3. ✅ Test the deployed application

## Security Notes

- **Never commit** `.env.local` or any file containing `SUPABASE_SERVICE_ROLE_KEY`
- **Never add** `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables
- The `anon` key is safe to use in the browser (it's restricted by Row Level Security policies)
- The `service_role` key bypasses RLS - only use it in secure server-side code
