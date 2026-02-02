# Restaurant KPI Dashboard

A modern web application for tracking and analyzing restaurant Key Performance Indicators (KPIs) including revenue, labour costs, food costs, and order counts.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 3+
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Hosting**: Vercel (free tier)

## Prerequisites

- Node.js 20+ and npm 10+
- Git 2.40+
- A Supabase account (free tier available)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-kpi-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Status

✅ Phase 1.1 - Project Initialization Complete
- Next.js 14+ with TypeScript configured
- Tailwind CSS with design tokens set up
- shadcn/ui configuration ready
- All dependencies installed
- Build and dev server verified

## Next Steps

- Phase 1.2: Set up Supabase database schema
- Phase 1.3: Configure Supabase client utilities
- Phase 1.4: Implement authentication pages

## License

MIT
