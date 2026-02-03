# Deployment Quick Start

This is a quick reference guide for deploying the Restaurant KPI Dashboard. For detailed instructions, see the individual guides.

## Quick Deployment Steps

### 1. Prerequisites ✅
- [x] Node.js 20+ and npm 10+ installed
- [x] Git configured
- [x] Code builds successfully (`npm run build`)
- [x] GitHub repository ready

### 2. Supabase Setup (15 minutes)

**See**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

1. Create project at [supabase.com](https://supabase.com)
2. Get API credentials (Settings → API)
3. Run migrations:
   - Copy `supabase/migrations/20260202000001_initial_schema.sql` → SQL Editor → Run
   - Copy `supabase/migrations/20260202000002_rls_policies.sql` → SQL Editor → Run
4. Enable Email authentication
5. Set Site URL to `http://localhost:3000` (update after Vercel deployment)

### 3. GitHub Push (2 minutes)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 4. Vercel Deployment (10 minutes)

**See**: [VERCEL_SETUP.md](VERCEL_SETUP.md) for detailed instructions

1. Go to [vercel.com](https://vercel.com) → Import GitHub repository
2. Deploy (auto-detects Next.js)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ARTIFORGE_API_URL` (optional)
   - `ARTIFORGE_API_KEY` (optional)
4. Wait for redeploy

### 5. Update Supabase Site URL (1 minute)

1. Copy Vercel deployment URL
2. Supabase → Authentication → Settings
3. Update Site URL to your Vercel domain

### 6. Test Deployment (20 minutes)

**See**: [POST_DEPLOYMENT_TESTING.md](POST_DEPLOYMENT_TESTING.md) for full checklist

- [ ] Frontend loads
- [ ] Register test account
- [ ] Login works
- [ ] Dashboard displays
- [ ] Create KPI entry
- [ ] Edit KPI entry
- [ ] Import/Export CSV

## Environment Variables Summary

### Required for Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional for Vercel:
```
ARTIFORGE_API_URL=https://api.artiforge.example
ARTIFORGE_API_KEY=your-key-here
```

### Local Development Only (.env.local):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Never add `SUPABASE_SERVICE_ROLE_KEY` to Vercel!**

## Files Reference

- **Main Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Supabase Setup**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Vercel Setup**: [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Testing**: [POST_DEPLOYMENT_TESTING.md](POST_DEPLOYMENT_TESTING.md)

## Troubleshooting

### Build Fails
- Run `npm run build` locally to see errors
- Fix TypeScript/ESLint errors
- Push fixes to GitHub

### Database Connection Issues
- Verify environment variables in Vercel
- Check Supabase project is not paused
- Verify migrations ran successfully

### Authentication Not Working
- Check Supabase Site URL matches Vercel domain
- Verify Email provider is enabled
- Check environment variables are correct

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
