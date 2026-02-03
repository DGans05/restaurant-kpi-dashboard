# Vercel Deployment Guide

This guide walks you through deploying the Restaurant KPI Dashboard to Vercel.

## Prerequisites

Before starting, ensure you have:
- ✅ Code pushed to GitHub (see GitHub setup)
- ✅ Supabase project created and migrations run (see SUPABASE_SETUP.md)
- ✅ Supabase API credentials ready

## Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
   - If you don't have an account, sign up (free tier available)
   - Connect your GitHub account when prompted

2. Click **"Add New..."** → **"Project"**

3. **Import your repository:**
   - Search for `restaurant-kpi-dashboard` (or your repository name)
   - Click **"Import"** next to your repository

4. **Configure project settings:**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default - leave as is)
   - **Build Command**: `npm run build` (default - leave as is)
   - **Output Directory**: `.next` (default - leave as is)
   - **Install Command**: `npm install` (default - leave as is)

5. **Environment Variables** (we'll set these in the next step - skip for now)

6. Click **"Deploy"**

7. Wait 2-3 minutes for the build to complete
   - You can watch the build logs in real-time
   - The first deployment may take longer

8. Once complete, you'll see:
   - ✅ Deployment successful message
   - Your deployment URL: `https://restaurant-kpi-dashboard-xxxxx.vercel.app`

## Step 2: Configure Environment Variables

**Important**: The app won't work correctly until environment variables are set.

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**

2. Add the following variables for **Production**, **Preview**, and **Development** environments:

   | Key | Value | Environment | Notes |
   |-----|-------|-------------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | All | From Supabase Settings > API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | All | From Supabase Settings > API |
   | `ARTIFORGE_API_URL` | Your Artiforge URL | All | Optional - only if using Artiforge MCP |
   | `ARTIFORGE_API_KEY` | Your Artiforge key | All | Optional - mark as **Secret** if using |

3. **To add each variable:**
   - Click **"Add New"**
   - Enter the **Key** name
   - Enter the **Value**
   - Select environments: **Production**, **Preview**, **Development**
   - For `ARTIFORGE_API_KEY`, toggle **"Encrypted"** or mark as secret
   - Click **"Save"**

4. **⚠️ Important**: 
   - **DO NOT** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
   - This key should only be used in local `.env.local` files
   - Adding it to Vercel would be a security risk

5. After adding all variables, Vercel will automatically trigger a redeploy
   - Wait for the redeployment to complete (1-2 minutes)

## Step 3: Update Supabase Site URL

After your Vercel deployment is complete:

1. Copy your Vercel deployment URL (e.g., `https://restaurant-kpi-dashboard-xxxxx.vercel.app`)

2. Go to your Supabase dashboard → **Authentication** → **Settings**

3. Under **"Site URL"**, update to your Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```

4. Click **"Save"**

5. **Optional**: Add your Vercel URL to **"Redirect URLs"**:
   - Click **"Add URL"**
   - Add: `https://your-project-name.vercel.app/**`
   - This allows authentication redirects to work properly

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. You should see the Restaurant KPI Dashboard homepage
3. Try navigating to `/register` to test authentication
4. Check browser console (F12) for any errors

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Domains** in Vercel
2. Click **"Add"** and enter your domain
3. Follow DNS configuration instructions:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add A records as instructed
4. Wait 10-30 minutes for DNS propagation and SSL certificate
5. Update Supabase Site URL to your custom domain

## Deployment Settings

### Automatic Deployments

By default, Vercel will:
- ✅ Deploy automatically on every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Deploy from the connected GitHub repository

### Manual Deployments

To deploy manually:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on any previous deployment
3. Or use Vercel CLI: `vercel --prod`

## Monitoring & Logs

### View Deployment Logs

1. Go to **Deployments** tab
2. Click on any deployment
3. Click **"View Build Logs"** to see build output
4. Click **"View Function Logs"** to see runtime logs

### View Real-time Logs

1. Go to your project dashboard
2. Click **"Logs"** tab
3. See real-time logs from your application

### Performance Monitoring

1. Go to **Analytics** tab (available on paid plans)
2. View performance metrics, page views, and user analytics

## Troubleshooting

### Build Failed

**Error**: Build fails with TypeScript or ESLint errors

**Solution**:
1. Check build logs in Vercel dashboard
2. Fix errors locally: `npm run build`
3. Push fixes to GitHub
4. Vercel will auto-redeploy

### Environment Variables Not Working

**Error**: App shows "Unable to connect to database"

**Solution**:
1. Verify environment variables are set correctly in Vercel
2. Check that variables are added to **Production** environment
3. Ensure variable names match exactly (case-sensitive)
4. Redeploy after adding variables

### Authentication Not Working

**Error**: Can't register/login on production

**Solution**:
1. Verify Supabase Site URL is set to your Vercel domain
2. Check that redirect URLs include your Vercel domain
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
4. Check browser console for specific error messages

### 404 Errors on Routes

**Error**: Pages return 404 on production but work locally

**Solution**:
1. Verify file paths are lowercase (Vercel is case-sensitive)
2. Check that dynamic routes use `[param]` syntax, not `{param}`
3. Ensure `middleware.ts` is in the root directory
4. Check Vercel logs for middleware errors

### CSS Not Loading

**Error**: Unstyled page, no Tailwind CSS

**Solution**:
1. Verify `tailwind.config.ts` exists
2. Check that `globals.css` is imported in `app/layout.tsx`
3. Rebuild locally: `npm run build`
4. Push changes to GitHub

## Rollback Deployment

If something goes wrong:

1. Go to **Deployments** tab
2. Find a previous successful deployment
3. Click **"..."** menu → **"Promote to Production"**
4. Your app will rollback in ~1 minute

## Next Steps

After successful deployment:

1. ✅ Test all features (see POST_DEPLOYMENT_TESTING.md)
2. ✅ Create test accounts
3. ✅ Set up admin user in Supabase
4. ✅ Monitor logs for the first few days
5. ✅ Configure custom domain (optional)

## Vercel CLI (Optional)

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Vercel Discord](https://vercel.com/discord)
