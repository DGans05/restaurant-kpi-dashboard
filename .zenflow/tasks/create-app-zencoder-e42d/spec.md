# Technical Specification
## Restaurant KPI Dashboard - Simplified Version

**Version:** 1.0  
**Date:** 2026-02-02  
**Status:** Draft  
**Based on:** requirements.md v1.0

---

## 1. Technical Context

### 1.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 14+ | Full-stack React framework with App Router |
| Language | TypeScript | 5+ | Type-safe development |
| Database | Supabase PostgreSQL | - | Managed PostgreSQL with RLS |
| Auth | Supabase Auth | - | Authentication & user management |
| Storage | Supabase Storage | - | CSV file uploads |
| Hosting | Vercel | - | Serverless deployment (free tier) |
| UI Framework | Tailwind CSS | 3+ | Utility-first styling |
| UI Components | shadcn/ui | - | Accessible component library |
| Charts | Recharts | 2+ | React charting library |
| Data Fetching | TanStack Query | 5+ | Server state management |
| Validation | Zod | 3+ | Schema validation |
| Forms | React Hook Form | 7+ | Form management |

### 1.2 Development Environment

```bash
Node.js: v20+
npm: v10+
Git: v2.40+
```

### 1.3 External Services

- **Supabase Project**: PostgreSQL database, Auth, Storage
  - Free tier: 500MB DB, 2GB storage, 50K MAU
- **Vercel Project**: Hosting, serverless functions
  - Free tier: 100GB bandwidth, unlimited deployments

---

## 2. Architecture & Implementation Approach

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Vercel (Free Tier)                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Next.js Application               │ │
│  │                                           │ │
│  │  ┌─────────────┐    ┌─────────────────┐ │ │
│  │  │   App Pages │    │   API Routes    │ │ │
│  │  │  (React)    │    │  (Serverless)   │ │ │
│  │  │             │    │                 │ │ │
│  │  │ - Dashboard │    │ - /api/kpis     │ │ │
│  │  │ - KPI Forms │◄───┤ - /api/users    │ │ │
│  │  │ - Admin     │    │ - /api/audit    │ │ │
│  │  └─────────────┘    └────────┬────────┘ │ │
│  │                              │          │ │
│  └──────────────────────────────┼──────────┘ │
└─────────────────────────────────┼────────────┘
                                  │
                      ┌───────────▼──────────┐
                      │  Supabase (Cloud)    │
                      │                      │
                      │  ┌────────────────┐ │
                      │  │  PostgreSQL    │ │
                      │  │  + RLS         │ │
                      │  └────────────────┘ │
                      │  ┌────────────────┐ │
                      │  │  Auth Service  │ │
                      │  └────────────────┘ │
                      │  ┌────────────────┐ │
                      │  │  Storage       │ │
                      │  │  (CSV files)   │ │
                      │  └────────────────┘ │
                      └─────────────────────┘
```

### 2.2 Design Patterns

1. **Server Components First**: Use React Server Components (RSC) for data fetching where possible
2. **API Routes for Mutations**: POST/PUT/DELETE operations via `/app/api/*` routes
3. **Supabase Client Pattern**: 
   - Server-side: `createServerClient` with cookie handling
   - Client-side: `createBrowserClient` for real-time features
4. **RLS-First Authorization**: Database-level security via Row Level Security policies
5. **Type Safety**: Supabase generates TypeScript types from database schema
6. **Form Validation**: Zod schemas reused on client and server
7. **Error Boundaries**: React error boundaries for graceful failure handling

### 2.3 Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Sign Up/Login
     ▼
┌─────────────────┐
│  Supabase Auth  │
│  (Magic Link/   │
│   Email+Pass)   │
└────┬────────────┘
     │
     │ 2. Set Session Cookie
     ▼
┌─────────────────┐
│  Next.js        │
│  Middleware     │ ◄─── 3. Verify on each request
└────┬────────────┘
     │
     │ 4. Attach user to request
     ▼
┌─────────────────┐
│  Protected      │
│  Pages/API      │
└─────────────────┘
```

### 2.4 Authorization Strategy

**Row Level Security (RLS) Policies in Supabase:**

```sql
-- Example: Managers can only see their assigned restaurants' KPIs
CREATE POLICY "kpi_select_policy" ON kpi_entries
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_restaurants 
      WHERE restaurant_id = kpi_entries.restaurant_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Policy Strategy:**
- **Admins**: Bypass restrictions (see all data)
- **Managers**: See only assigned restaurants' data
- **Viewers**: Same as managers but read-only (no INSERT/UPDATE/DELETE policies)

---

## 3. Source Code Structure

```
restaurant-kpi-dashboard/
├── .env.local                  # Local environment variables
├── .env.example                # Template for environment setup
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── README.md                   # Setup and usage guide
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (theme provider, query provider)
│   ├── page.tsx                # Landing page (redirect to /dashboard)
│   ├── globals.css             # Global styles (Tailwind, CSS variables)
│   │
│   ├── (auth)/                 # Auth route group (centered layout)
│   │   ├── login/
│   │   │   └── page.tsx        # Login form
│   │   └── register/
│   │       └── page.tsx        # Registration form
│   │
│   ├── (dashboard)/            # Protected route group (sidebar layout)
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Main dashboard (KPI cards + charts)
│   │   ├── kpis/
│   │   │   ├── page.tsx        # KPI list table
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Create KPI form
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit KPI form
│   │   ├── import/
│   │   │   └── page.tsx        # CSV import UI
│   │   ├── export/
│   │   │   └── page.tsx        # CSV export UI
│   │   └── admin/              # Admin-only routes
│   │       ├── users/
│   │       │   └── page.tsx    # User management
│   │       ├── restaurants/
│   │       │   └── page.tsx    # Restaurant management
│   │       └── audit-logs/
│   │           └── page.tsx    # Audit log viewer
│   │
│   └── api/                    # API routes (serverless functions)
│       ├── kpis/
│       │   ├── route.ts        # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts    # GET (single), PUT (update), DELETE
│       ├── users/
│       │   └── route.ts        # User CRUD (admin only)
│       ├── restaurants/
│       │   └── route.ts        # Restaurant CRUD (admin only)
│       ├── audit-logs/
│       │   └── route.ts        # GET audit logs (admin only)
│       ├── import/
│       │   └── route.ts        # POST CSV import
│       └── export/
│           └── route.ts        # GET CSV export
│
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Top header (restaurant selector, user menu)
│   │   └── ThemeToggle.tsx     # Dark mode toggle
│   ├── kpis/
│   │   ├── KPICard.tsx         # Dashboard metric card
│   │   ├── KPIChart.tsx        # Chart wrapper (Recharts)
│   │   ├── KPITable.tsx        # KPI data table
│   │   └── KPIForm.tsx         # Create/edit form
│   ├── admin/
│   │   ├── UserTable.tsx       # User management table
│   │   ├── RestaurantTable.tsx # Restaurant management table
│   │   └── AuditLogTable.tsx   # Audit log display
│   └── providers/
│       ├── QueryProvider.tsx   # TanStack Query provider
│       └── ThemeProvider.tsx   # next-themes provider
│
├── lib/                        # Utility libraries
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client (RSC)
│   │   ├── middleware.ts       # Middleware Supabase client
│   │   └── types.ts            # Generated types from database
│   ├── validations/
│   │   ├── kpi.schema.ts       # Zod schemas for KPI
│   │   ├── user.schema.ts      # Zod schemas for user
│   │   └── auth.schema.ts      # Zod schemas for auth
│   ├── hooks/
│   │   ├── useKPIs.ts          # TanStack Query hooks for KPIs
│   │   ├── useUsers.ts         # TanStack Query hooks for users
│   │   └── useAuth.ts          # Auth state hook
│   ├── utils/
│   │   ├── cn.ts               # Tailwind class merging
│   │   ├── date.ts             # Date formatting utilities
│   │   ├── csv.ts              # CSV parsing/generation
│   │   └── audit.ts            # Audit logging helper
│   └── constants/
│       ├── roles.ts            # User role definitions
│       └── config.ts           # App configuration
│
├── supabase/                   # Supabase migrations & config
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── config.toml             # Supabase CLI config
│
└── middleware.ts               # Next.js middleware (auth check)
```

---

## 4. Data Model

### 4.1 Database Schema

**Managed by Supabase Auth:**
```sql
-- auth.users table (managed by Supabase)
-- Contains: id (uuid), email, encrypted_password, email_confirmed_at, etc.
```

**Custom Tables:**

```sql
-- User profile extension
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Restaurant assignment (many-to-many)
CREATE TABLE user_restaurants (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, restaurant_id)
);

-- KPI entries
CREATE TABLE kpi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(10,2) NOT NULL CHECK (revenue >= 0),
  labour_cost DECIMAL(10,2) NOT NULL CHECK (labour_cost >= 0),
  food_cost DECIMAL(10,2) NOT NULL CHECK (food_cost >= 0),
  order_count INTEGER NOT NULL CHECK (order_count >= 0),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (restaurant_id, date),
  CHECK (labour_cost + food_cost <= revenue)
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'login', 'kpi_create', 'kpi_update', 'kpi_delete', 'user_create', etc.
  resource_type TEXT, -- 'kpi_entry', 'user', 'restaurant'
  resource_id UUID,
  changes JSONB, -- { "before": {...}, "after": {...} }
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_kpi_entries_restaurant_date ON kpi_entries(restaurant_id, date DESC);
CREATE INDEX idx_kpi_entries_date ON kpi_entries(date DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_user_restaurants_user ON user_restaurants(user_id);
CREATE INDEX idx_user_restaurants_restaurant ON user_restaurants(restaurant_id);
```

### 4.2 Row Level Security (RLS) Policies

**Profiles:**
```sql
-- Users can read their own profile, admins can read all
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can insert/update/delete profiles
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

**Restaurants:**
```sql
-- Users can see restaurants they're assigned to, admins see all
CREATE POLICY "restaurants_select" ON restaurants FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM user_restaurants WHERE user_id = auth.uid() AND restaurant_id = restaurants.id)
);

-- Only admins can manage restaurants
CREATE POLICY "restaurants_admin_only" ON restaurants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

**KPI Entries:**
```sql
-- Users can see KPIs for their assigned restaurants, admins see all
CREATE POLICY "kpi_entries_select" ON kpi_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM user_restaurants WHERE user_id = auth.uid() AND restaurant_id = kpi_entries.restaurant_id)
);

-- Managers and admins can insert KPIs for assigned restaurants
CREATE POLICY "kpi_entries_insert" ON kpi_entries FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN user_restaurants ur ON ur.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
      AND (p.role = 'admin' OR ur.restaurant_id = kpi_entries.restaurant_id)
  )
);

-- Managers and admins can update/delete their restaurants' KPIs
CREATE POLICY "kpi_entries_update" ON kpi_entries FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN user_restaurants ur ON ur.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
      AND (p.role = 'admin' OR ur.restaurant_id = kpi_entries.restaurant_id)
  )
);

CREATE POLICY "kpi_entries_delete" ON kpi_entries FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN user_restaurants ur ON ur.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
      AND (p.role = 'admin' OR ur.restaurant_id = kpi_entries.restaurant_id)
  )
);
```

**Audit Logs:**
```sql
-- Only admins can read audit logs
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- All authenticated users can insert audit logs (system creates these)
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
```

### 4.3 TypeScript Types (Generated)

```typescript
// lib/supabase/types.ts (auto-generated by Supabase CLI)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'manager' | 'viewer';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      // ... other tables
    };
  };
};
```

---

## 5. API Endpoints

### 5.1 Authentication (Supabase Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/v1/signup` | Register new user (Supabase) |
| POST | `/auth/v1/token?grant_type=password` | Login (Supabase) |
| POST | `/auth/v1/logout` | Logout (Supabase) |
| GET | `/auth/v1/user` | Get current user (Supabase) |

**Note:** These are Supabase's built-in endpoints, called via Supabase client.

### 5.2 Custom API Routes

**KPI Endpoints:**
```typescript
// app/api/kpis/route.ts
GET    /api/kpis?restaurant_id=uuid&from=date&to=date&page=1&limit=20
POST   /api/kpis
  Body: { restaurant_id, date, revenue, labour_cost, food_cost, order_count }

// app/api/kpis/[id]/route.ts
GET    /api/kpis/:id
PUT    /api/kpis/:id
  Body: { date?, revenue?, labour_cost?, food_cost?, order_count? }
DELETE /api/kpis/:id
```

**User Endpoints (Admin Only):**
```typescript
// app/api/users/route.ts
GET    /api/users?role=manager&page=1&limit=20
POST   /api/users
  Body: { email, full_name, role, restaurant_ids: uuid[] }

// app/api/users/[id]/route.ts
PUT    /api/users/:id
  Body: { full_name?, role?, restaurant_ids?, is_active? }
DELETE /api/users/:id (soft delete: is_active = false)
```

**Restaurant Endpoints (Admin Only):**
```typescript
// app/api/restaurants/route.ts
GET    /api/restaurants?active=true
POST   /api/restaurants
  Body: { name, location, timezone }

// app/api/restaurants/[id]/route.ts
PUT    /api/restaurants/:id
  Body: { name?, location?, timezone?, is_active? }
DELETE /api/restaurants/:id (soft delete)
```

**Import/Export:**
```typescript
// app/api/import/route.ts
POST   /api/import
  Body: FormData with CSV file
  Returns: { success: number, errors: Array<{ row, message }> }

// app/api/export/route.ts
GET    /api/export?restaurant_id=uuid&from=date&to=date
  Returns: CSV file download
```

**Audit Logs (Admin Only):**
```typescript
// app/api/audit-logs/route.ts
GET    /api/audit-logs?user_id=uuid&action=kpi_create&from=date&to=date&page=1
```

### 5.3 API Response Format

**Success:**
```json
{
  "data": { /* resource or array */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "revenue", "message": "Must be positive" }
    ]
  }
}
```

---

## 6. UI Components & Screens

### 6.1 Design System (shadcn/ui + Tailwind)

**Color Palette (CSS Variables):**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### 6.2 Key Components

**KPICard:**
```tsx
<KPICard
  title="Total Revenue"
  value="$12,345"
  change={+5.2}
  icon={<DollarSignIcon />}
/>
```

**KPIChart:**
```tsx
<KPIChart
  type="line" | "bar" | "area"
  data={[{ date: '2026-01-01', value: 1234 }, ...]}
  xKey="date"
  yKey="value"
/>
```

**KPITable:**
```tsx
<KPITable
  data={kpiEntries}
  onEdit={(id) => router.push(`/kpis/${id}/edit`)}
  onDelete={(id) => deleteKPI(id)}
/>
```

**Sidebar:**
```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    <SidebarLink href="/dashboard" icon={<HomeIcon />}>
      Overview
    </SidebarLink>
  </SidebarSection>
  <SidebarSection title="KPIs">
    <SidebarLink href="/kpis">KPI List</SidebarLink>
    <SidebarLink href="/kpis/new">Add Entry</SidebarLink>
  </SidebarSection>
</Sidebar>
```

### 6.3 Screen Layouts

**Dashboard:**
```
┌─────────────────────────────────────────┐
│ [Restaurant Selector] [User Menu] [🌙]  │ ← Header
├─────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│
│ │Revenue│ │Labour%│ │Food % │ │Orders ││ ← KPI Cards
│ │$12,345│ │  28%  │ │  32%  │ │  456  ││
│ │ +5.2% │ │ -2.1% │ │ +1.3% │ │ +8.7% ││
│ └───────┘ └───────┘ └───────┘ └───────┘│
├─────────────────────────────────────────┤
│ [7 Days] [30 Days] [90 Days]            │ ← Date Filter
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │    Revenue Trend (Line Chart)       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Labour vs Food Cost (Bar Chart)     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**KPI Form:**
```
┌─────────────────────────────────────────┐
│ Add KPI Entry                           │
├─────────────────────────────────────────┤
│ Restaurant: [Downtown Hub ▼]           │
│ Date:       [2026-02-02   📅]          │
│ Revenue:    [$12,345.00     ]          │
│ Labour Cost:[$3,450.00      ]          │
│ Food Cost:  [$3,900.00      ]          │
│ Orders:     [456            ]          │
│                                         │
│ Labour %: 28%  Food %: 32%              │
│                                         │
│ [Cancel] [Save Entry]                   │
└─────────────────────────────────────────┘
```

---

## 7. Delivery Phases

### Phase 1: Foundation (Week 1)
**Goal:** Working Next.js app with Supabase auth

**Tasks:**
1. Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui
2. Create Supabase project, get credentials
3. Set up database schema (tables, indexes)
4. Implement RLS policies
5. Configure Supabase clients (server, browser, middleware)
6. Implement auth pages (login, register)
7. Create protected route middleware
8. Build layout with sidebar and header

**Verification:**
- `npm run build` succeeds
- Can register, login, logout
- Protected routes redirect to login
- Sidebar navigation works

---

### Phase 2: Core KPI Features (Week 2)
**Goal:** CRUD operations for KPIs

**Tasks:**
1. Create Zod schemas for KPI validation
2. Implement `/api/kpis` endpoints (list, create)
3. Implement `/api/kpis/[id]` endpoints (get, update, delete)
4. Build KPI form component with validation
5. Build KPI table component
6. Create KPI list page
7. Create KPI new/edit pages
8. Add audit logging to KPI mutations

**Verification:**
- Can create, edit, delete KPI entries
- Validation errors display correctly
- RLS prevents unauthorized access (test with viewer role)
- Audit logs capture actions

---

### Phase 3: Dashboard & Analytics (Week 3)
**Goal:** Visual KPI dashboard with charts

**Tasks:**
1. Install and configure Recharts
2. Build KPICard component
3. Build KPIChart component (line, bar, area)
4. Implement dashboard page with KPI cards
5. Add revenue trend chart
6. Add labour/food cost comparison chart
7. Add date range filter (7/30/90 days)
8. Add restaurant selector (admin only)
9. Implement data aggregation logic

**Verification:**
- Dashboard loads with real data
- Charts render correctly
- Date filters update charts
- Restaurant filter works for admins

---

### Phase 4: Import/Export & Admin (Week 4)
**Goal:** CSV features and admin panel

**Tasks:**
1. Implement CSV parsing utility
2. Build `/api/import` endpoint with validation
3. Build `/api/export` endpoint
4. Create import page with file upload
5. Create export page with filters
6. Implement user management API (`/api/users`)
7. Build user management table (admin page)
8. Implement restaurant management API
9. Build restaurant management page
10. Build audit log viewer page

**Verification:**
- Can upload CSV and import KPIs
- Invalid rows show clear errors
- Can export filtered KPI data
- Admins can manage users and restaurants
- Audit logs display with filters

---

### Phase 5: Polish & Deployment (Week 5)
**Goal:** Production-ready deployment

**Tasks:**
1. Implement dark mode with next-themes
2. Add loading states and skeletons
3. Add error boundaries
4. Implement responsive design (mobile/tablet)
5. Add form accessibility (ARIA labels, keyboard nav)
6. Write `.env.example` and README
7. Test all user roles and permissions
8. Deploy to Vercel
9. Run Supabase migrations in production
10. Seed demo data
11. Create demo user accounts

**Verification:**
- Dark mode works throughout app
- Responsive on mobile (< 768px)
- No TypeScript errors
- Vercel deployment succeeds
- Demo login works
- All features functional in production

---

## 8. Verification Approach

### 8.1 Build Checks

```bash
# Type checking
npm run build

# Linting (if configured)
npm run lint

# Run locally
npm run dev
```

### 8.2 Manual Testing Checklist

**Authentication:**
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Protected routes redirect when not logged in

**Role-Based Access:**
- [ ] Admin sees all restaurants
- [ ] Manager sees only assigned restaurant
- [ ] Viewer cannot edit/delete KPIs
- [ ] Admin can access user management
- [ ] Non-admins cannot access admin pages

**KPI CRUD:**
- [ ] Can create KPI entry
- [ ] Form validation shows errors
- [ ] Cannot submit labour + food > revenue
- [ ] Can edit existing entry
- [ ] Can delete entry
- [ ] Deleted entry triggers audit log

**Dashboard:**
- [ ] KPI cards show correct calculations
- [ ] Trend indicators (↑↓) display correctly
- [ ] Charts load without errors
- [ ] Date filter updates data
- [ ] Restaurant selector filters data (admin)

**Import/Export:**
- [ ] CSV template downloads correctly
- [ ] Valid CSV imports successfully
- [ ] Invalid CSV shows row-level errors
- [ ] Export generates valid CSV
- [ ] Export respects filters

**Admin Features:**
- [ ] Can create/edit/delete users
- [ ] Can assign restaurants to users
- [ ] Can create/edit restaurants
- [ ] Audit logs show all actions
- [ ] Audit log filters work

**UI/UX:**
- [ ] Dark mode toggle works
- [ ] Mobile sidebar collapses
- [ ] Forms are keyboard-navigable
- [ ] Loading states display during API calls
- [ ] Error messages are user-friendly

### 8.3 Performance Checks

- Dashboard loads in < 2 seconds
- Chart rendering < 500ms
- No unnecessary re-renders (React DevTools)
- Images/assets optimized
- API responses < 1 second

### 8.4 Security Checks

- [ ] RLS policies prevent unauthorized data access
- [ ] API routes verify user permissions
- [ ] No sensitive data in browser console
- [ ] HTTPS enforced (Vercel default)
- [ ] No hardcoded credentials in code

---

## 9. Environment Configuration

### 9.1 Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
NEXT_PUBLIC_APP_NAME="Restaurant KPI Dashboard"
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

### 9.2 Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref xxxxx

# Push migrations
supabase db push

# Generate types
supabase gen types typescript --local > lib/supabase/types.ts
```

---

## 10. Migration from Original Architecture

### 10.1 Differences Summary

| Aspect | Original | New |
|--------|----------|-----|
| Backend | Express.js | Next.js API Routes |
| Database | Self-hosted PostgreSQL | Supabase PostgreSQL |
| Auth | WorkOS + Custom JWT | Supabase Auth |
| Authorization | Middleware | RLS Policies |
| Deployment | Docker Compose | Vercel |
| File Storage | Local filesystem | Supabase Storage |
| Real-time | N/A | Supabase Realtime (future) |

### 10.2 Code Not Ported

- Express middleware (`backend/src/middleware/*`)
- Repository pattern (`backend/src/repositories/*`)
- Nginx configuration
- Docker files
- Convex integration

### 10.3 New Capabilities

- Database-level authorization (RLS)
- Serverless API routes
- Automatic TypeScript types from DB
- Built-in file storage
- Potential for real-time features (Supabase Realtime)

---

## 11. Known Limitations & Future Work

### 11.1 Free Tier Limits

**Supabase:**
- 500MB database (estimated 2+ years of KPI data)
- 2GB file storage (CSV files)
- 50K monthly active users

**Vercel:**
- 100GB bandwidth/month
- 100 hours serverless execution

### 11.2 Future Enhancements

1. **Real-time Dashboard**: Use Supabase Realtime subscriptions
2. **Mobile App**: React Native with shared Supabase client
3. **Advanced Analytics**: Forecasting, anomaly detection
4. **Notifications**: Email alerts when KPIs exceed thresholds
5. **Multi-tenancy**: Support multiple organizations
6. **POS Integration**: Automated data ingestion
7. **Scheduled Reports**: Weekly/monthly email reports

---

**End of Technical Specification**
