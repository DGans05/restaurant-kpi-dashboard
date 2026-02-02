# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: b4841870-efad-4b78-9afa-fb121c44bba5 -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: b5d905f4-e70a-4a90-9894-2cd982587e28 -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: 59a4115b-0978-4229-8ca9-bc5f3c267f4f -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function) or too broad (entire feature).

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

---

## Implementation Steps

### [x] Step: Phase 1.1 - Project Initialization
<!-- chat-id: 8abf0f8f-215e-4851-8977-1c5de364a371 -->
<!-- Spec reference: Section 7.1, 9.2 -->

Initialize Next.js project with required dependencies and configuration.

**Tasks:**
- [x] Create Next.js 14+ project with TypeScript (`npx create-next-app@latest`)
- [x] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `tailwindcss`, `@tanstack/react-query`, `zod`, `react-hook-form`, `recharts`, `next-themes`
- [x] Install shadcn/ui CLI and configure (`npx shadcn-ui@latest init`)
- [x] Configure `tailwind.config.ts` with design tokens (spec section 6.1)
- [x] Set up `app/globals.css` with CSS variables for light/dark mode
- [x] Create `.env.example` with required Supabase variables

**Verification:**
- ✅ `npm run dev` starts without errors
- ✅ Tailwind classes work on test page
- ✅ TypeScript compilation succeeds

### [ ] Step: Phase 1.2 - Supabase Setup
<!-- chat-id: d40d8baf-8b08-49ed-8497-c26ab7dea582 -->
<!-- Spec reference: Section 4.1, 4.2, 9.2 -->

Create Supabase project and configure database schema.

**Tasks:**
- [ ] Create new Supabase project at supabase.com
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Initialize Supabase locally: `supabase init`
- [ ] Create migration file: `supabase/migrations/001_initial_schema.sql`
- [ ] Add tables: `profiles`, `restaurants`, `user_restaurants`, `kpi_entries`, `audit_logs` (spec section 4.1)
- [ ] Add indexes for performance (spec section 4.1)
- [ ] Create migration file: `supabase/migrations/002_rls_policies.sql`
- [ ] Implement RLS policies for all tables (spec section 4.2)
- [ ] Enable RLS on all tables: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
- [ ] Push migrations: `supabase db push`

**Verification:**
- Tables exist in Supabase dashboard
- RLS enabled on all tables
- Can query tables from SQL editor (no errors)

### [ ] Step: Phase 1.3 - Supabase Client Configuration
<!-- Spec reference: Section 3.1, lib/supabase/* -->

Set up Supabase client utilities for server/browser/middleware.

**Tasks:**
- [ ] Create `lib/supabase/client.ts` - browser client using `createBrowserClient`
- [ ] Create `lib/supabase/server.ts` - server client using `createServerClient` with cookie handling
- [ ] Create `lib/supabase/middleware.ts` - middleware client for auth refresh
- [ ] Generate TypeScript types: `supabase gen types typescript --local > lib/supabase/types.ts`
- [ ] Create `lib/constants/roles.ts` with role enum: `admin`, `manager`, `viewer`
- [ ] Add Supabase env vars to `.env.local`

**Verification:**
- TypeScript types generated without errors
- Can import clients in components/pages without errors
- `npm run build` succeeds

### [ ] Step: Phase 1.4 - Authentication Pages
<!-- Spec reference: Section 6.2, app/(auth)/* -->

Implement login and registration pages using Supabase Auth.

**Tasks:**
- [ ] Create shadcn/ui components: `button`, `input`, `card`, `label`, `form`
- [ ] Create Zod schemas in `lib/validations/auth.schema.ts` (email, password validation)
- [ ] Create `app/(auth)/login/page.tsx` with login form using react-hook-form + Zod
- [ ] Create `app/(auth)/register/page.tsx` with registration form
- [ ] Implement login logic: call `supabase.auth.signInWithPassword()`
- [ ] Implement register logic: call `supabase.auth.signUp()` + create profile in `profiles` table
- [ ] Add error handling and display validation errors
- [ ] Style with Tailwind (centered layout, card-based design)

**Verification:**
- Can register new user (check Supabase dashboard for user in auth.users)
- Can login with registered credentials
- Validation errors display correctly
- Form is keyboard-accessible

### [ ] Step: Phase 1.5 - Auth Middleware & Protected Routes
<!-- Spec reference: middleware.ts, Section 3.3 -->

Implement authentication middleware and protected route handling.

**Tasks:**
- [ ] Create `middleware.ts` at project root
- [ ] Implement auth check using Supabase middleware client
- [ ] Refresh session on each request
- [ ] Redirect to `/login` if unauthenticated (exclude public routes: `/login`, `/register`)
- [ ] Create `lib/hooks/useAuth.ts` to get current user session
- [ ] Create server action or utility to get server-side user in RSC

**Verification:**
- Logged-out users redirected to `/login` when accessing protected routes
- Logged-in users can access protected routes
- Session persists on page refresh
- Logout clears session and redirects to login

### [ ] Step: Phase 1.6 - Layout & Navigation
<!-- Spec reference: Section 6.2, components/layout/* -->

Build dashboard layout with sidebar, header, and navigation.

**Tasks:**
- [ ] Create shadcn/ui components: `sidebar`, `dropdown-menu`, `avatar`, `separator`
- [ ] Create `components/layout/Sidebar.tsx` with navigation links
- [ ] Add sidebar sections: Dashboard, KPIs (List, Add Entry), Admin (Users, Restaurants, Audit Logs)
- [ ] Conditionally show Admin section based on user role
- [ ] Create `components/layout/Header.tsx` with user menu (logout, theme toggle placeholder)
- [ ] Create `app/(dashboard)/layout.tsx` with sidebar + header structure
- [ ] Make sidebar collapsible on mobile (< 768px)
- [ ] Style with Tailwind (card-based, modern design)

**Verification:**
- Sidebar navigation works (click links, URLs change)
- Mobile sidebar collapses/expands
- Logout button works
- Admin links only visible to admin users
- `npm run build` succeeds

### [ ] Step: Phase 2.1 - KPI Validation Schemas
<!-- Spec reference: lib/validations/kpi.schema.ts, Section 5.2 -->

Create Zod schemas for KPI data validation.

**Tasks:**
- [ ] Create `lib/validations/kpi.schema.ts`
- [ ] Define `kpiEntrySchema` with fields: restaurant_id (uuid), date, revenue (positive decimal), labour_cost (positive decimal), food_cost (positive decimal), order_count (positive integer)
- [ ] Add validation: `labour_cost + food_cost <= revenue`
- [ ] Export TypeScript types: `KPIEntryInput`, `KPIEntryUpdate`

**Verification:**
- Schema validates valid KPI data
- Schema rejects invalid data (negative revenue, costs > revenue)
- TypeScript types exported correctly

### [ ] Step: Phase 2.2 - KPI API Routes (List & Create)
<!-- Spec reference: app/api/kpis/route.ts, Section 5.2 -->

Implement GET and POST endpoints for KPI entries.

**Tasks:**
- [ ] Create `app/api/kpis/route.ts`
- [ ] Implement `GET` handler: query `kpi_entries` from Supabase with filters (restaurant_id, from/to dates, pagination)
- [ ] Return paginated response with meta (page, limit, total)
- [ ] Implement `POST` handler: validate body with Zod, insert into `kpi_entries`
- [ ] Call audit logging helper after create (use `lib/utils/audit.ts`)
- [ ] Handle errors and return consistent error format (spec section 5.3)
- [ ] Use server Supabase client for auth context

**Verification:**
- `GET /api/kpis` returns KPI list (empty initially)
- `POST /api/kpis` creates entry and returns 201
- Validation errors return 400 with details
- RLS prevents unauthorized access (test with viewer role)
- Audit log created for `kpi_create` action

### [ ] Step: Phase 2.3 - KPI API Routes (Single Entry)
<!-- Spec reference: app/api/kpis/[id]/route.ts, Section 5.2 -->

Implement GET, PUT, DELETE endpoints for single KPI entry.

**Tasks:**
- [ ] Create `app/api/kpis/[id]/route.ts`
- [ ] Implement `GET` handler: fetch single entry by ID
- [ ] Implement `PUT` handler: validate partial update with Zod, update entry
- [ ] Implement `DELETE` handler: soft delete entry
- [ ] Add audit logging for update (`kpi_update`) and delete (`kpi_delete`)
- [ ] Return 404 if entry not found
- [ ] Store before/after state in audit log `changes` field (JSON)

**Verification:**
- `GET /api/kpis/:id` returns single entry
- `PUT /api/kpis/:id` updates entry
- `DELETE /api/kpis/:id` deletes entry
- Audit logs capture changes with before/after data
- Non-owner cannot update/delete (RLS test)

### [ ] Step: Phase 2.4 - Audit Logging Utility
<!-- Spec reference: lib/utils/audit.ts, Section 4.1 audit_logs -->

Create helper function for audit logging.

**Tasks:**
- [ ] Create `lib/utils/audit.ts`
- [ ] Export `createAuditLog()` function with params: action, resource_type, resource_id, changes, ip_address
- [ ] Get user_id from Supabase auth context
- [ ] Insert audit log into `audit_logs` table
- [ ] Handle IP extraction from request headers (X-Forwarded-For, X-Real-IP)

**Verification:**
- Audit log inserted with correct fields
- User ID captured correctly
- IP address extracted from headers

### [ ] Step: Phase 2.5 - KPI Form Component
<!-- Spec reference: components/kpis/KPIForm.tsx, Section 6.2 -->

Build reusable KPI entry form with validation.

**Tasks:**
- [ ] Create shadcn/ui components: `select`, `datepicker` (using react-day-picker)
- [ ] Create `components/kpis/KPIForm.tsx`
- [ ] Use react-hook-form with Zod schema integration
- [ ] Add fields: Restaurant dropdown, Date picker, Revenue, Labour Cost, Food Cost, Orders
- [ ] Display calculated percentages (labour %, food %) below inputs
- [ ] Show validation errors inline
- [ ] Handle form submission (call POST or PUT API)
- [ ] Show success/error toast notifications

**Verification:**
- Form validates on submit
- Validation errors display inline
- Calculated percentages update on input change
- Submission calls correct API endpoint
- Success toast shows on successful submit

### [ ] Step: Phase 2.6 - KPI Pages (New & Edit)
<!-- Spec reference: app/(dashboard)/kpis/new/page.tsx, app/(dashboard)/kpis/[id]/edit/page.tsx -->

Create pages for adding and editing KPI entries.

**Tasks:**
- [ ] Create `app/(dashboard)/kpis/new/page.tsx`
- [ ] Render `KPIForm` component with empty initial values
- [ ] Fetch user's restaurants for dropdown (from Supabase with RLS)
- [ ] Handle form submit: call `POST /api/kpis`, redirect to `/kpis` on success
- [ ] Create `app/(dashboard)/kpis/[id]/edit/page.tsx`
- [ ] Fetch existing KPI entry by ID (server component)
- [ ] Render `KPIForm` with pre-filled values
- [ ] Handle form submit: call `PUT /api/kpis/:id`, redirect on success

**Verification:**
- `/kpis/new` shows empty form
- Can create KPI entry
- `/kpis/:id/edit` shows pre-filled form
- Can update existing entry
- Redirects work correctly

### [ ] Step: Phase 2.7 - KPI Table Component
<!-- Spec reference: components/kpis/KPITable.tsx, Section 6.2 -->

Build table component to list KPI entries.

**Tasks:**
- [ ] Create shadcn/ui components: `table`, `badge`, `pagination`
- [ ] Create `components/kpis/KPITable.tsx`
- [ ] Display columns: Date, Restaurant, Revenue, Labour %, Food %, Orders, Actions (Edit, Delete)
- [ ] Format currency and percentages using `lib/utils/date.ts` helpers
- [ ] Add row actions: Edit (navigate to edit page), Delete (confirm dialog then call API)
- [ ] Handle pagination (prev/next buttons)
- [ ] Show empty state when no data

**Verification:**
- Table displays KPI entries
- Edit button navigates to edit page
- Delete button shows confirm dialog and deletes entry
- Pagination works
- Empty state displays when no entries

### [ ] Step: Phase 2.8 - KPI List Page
<!-- Spec reference: app/(dashboard)/kpis/page.tsx -->

Create main KPI list page with table and filters.

**Tasks:**
- [ ] Create `app/(dashboard)/kpis/page.tsx`
- [ ] Fetch KPI entries using TanStack Query (`lib/hooks/useKPIs.ts`)
- [ ] Add filters: Date range (from/to), Restaurant dropdown (admin only)
- [ ] Render `KPITable` component with fetched data
- [ ] Add "Add Entry" button (navigate to `/kpis/new`)
- [ ] Implement search/filter logic (debounced)
- [ ] Show loading skeleton while fetching

**Verification:**
- Page loads and displays KPI entries
- Filters update table data
- Loading state shows during fetch
- Add Entry button navigates correctly
- `npm run lint` passes

### [ ] Step: Phase 3.1 - Dashboard KPI Cards
<!-- Spec reference: components/kpis/KPICard.tsx, Section 6.2 -->

Build metric card components for dashboard.

**Tasks:**
- [ ] Create `components/kpis/KPICard.tsx`
- [ ] Accept props: title, value, change (percentage), icon
- [ ] Display trend indicator (↑ green, ↓ red) based on change value
- [ ] Style with Tailwind (card with shadow, hover effect)
- [ ] Support dark mode via CSS variables

**Verification:**
- Card displays correctly with test data
- Trend indicator shows correct color/icon
- Hover effect works
- Dark mode styles apply

### [ ] Step: Phase 3.2 - Chart Component
<!-- Spec reference: components/kpis/KPIChart.tsx, Section 6.2 -->

Build reusable chart wrapper using Recharts.

**Tasks:**
- [ ] Install Recharts: `npm install recharts`
- [ ] Create `components/kpis/KPIChart.tsx`
- [ ] Support chart types: `line`, `bar`, `area`
- [ ] Accept props: type, data, xKey, yKey, color
- [ ] Configure responsive container
- [ ] Add tooltip, legend, axis labels
- [ ] Use CSS variables for colors (dark mode support)

**Verification:**
- Line chart renders with test data
- Bar chart renders correctly
- Area chart renders correctly
- Tooltip displays on hover
- Charts responsive on mobile

### [ ] Step: Phase 3.3 - Dashboard Data Aggregation
<!-- Spec reference: app/(dashboard)/dashboard/page.tsx, Section 7.3 -->

Implement data aggregation logic for dashboard.

**Tasks:**
- [ ] Create `lib/hooks/useDashboardData.ts` with TanStack Query
- [ ] Fetch KPI entries for selected date range (default 30 days)
- [ ] Calculate totals: sum(revenue), sum(labour_cost), sum(food_cost), sum(order_count)
- [ ] Calculate percentages: labour % = labour_cost / revenue, food % = food_cost / revenue
- [ ] Calculate trends: compare current period vs previous period (% change)
- [ ] Aggregate data for charts (group by date)
- [ ] Support restaurant filter (admin can select specific restaurant or "All")

**Verification:**
- Aggregation calculates correct totals
- Trends calculated correctly (positive/negative)
- Chart data grouped by date
- Restaurant filter works for admin

### [ ] Step: Phase 3.4 - Dashboard Page
<!-- Spec reference: app/(dashboard)/dashboard/page.tsx, Section 6.3 -->

Build main dashboard page with KPI cards and charts.

**Tasks:**
- [ ] Create `app/(dashboard)/dashboard/page.tsx`
- [ ] Add restaurant selector dropdown (admin only, in Header component)
- [ ] Add date range filter: 7/30/90 days tabs
- [ ] Fetch aggregated data using `useDashboardData()` hook
- [ ] Render 4 KPI cards: Revenue, Labour %, Food %, Orders (with trend indicators)
- [ ] Render Revenue Trend line chart (last 30 days)
- [ ] Render Labour vs Food Cost bar chart (grouped by date)
- [ ] Render Orders area chart (last 30 days)
- [ ] Add loading skeletons during data fetch

**Verification:**
- Dashboard loads with real data
- KPI cards show correct values and trends
- Charts render without errors
- Date filter updates all cards/charts
- Restaurant selector filters data (admin only)
- Loading states display correctly

### [ ] Step: Phase 3.5 - Restaurant Selector (Admin)
<!-- Spec reference: components/layout/Header.tsx -->

Add restaurant selector to header for admin users.

**Tasks:**
- [ ] Modify `components/layout/Header.tsx`
- [ ] Add restaurant dropdown (shadcn/ui `select`)
- [ ] Fetch user's role and restaurants from Supabase
- [ ] Show dropdown only for admin users
- [ ] Add "All Restaurants" option for admins
- [ ] Store selected restaurant in Zustand store or URL query param
- [ ] Update dashboard queries to filter by selected restaurant

**Verification:**
- Restaurant selector visible for admin
- Hidden for manager/viewer
- Selecting restaurant updates dashboard data
- "All Restaurants" option works
- Selection persists on page navigation

### [ ] Step: Phase 4.1 - CSV Utilities
<!-- Spec reference: lib/utils/csv.ts -->

Create CSV parsing and generation utilities.

**Tasks:**
- [ ] Create `lib/utils/csv.ts`
- [ ] Implement `parseCSV()` function: parse CSV string to array of objects
- [ ] Implement `generateCSV()` function: convert array of objects to CSV string
- [ ] Validate CSV headers match expected format (date, revenue, labour_cost, food_cost, order_count)
- [ ] Handle common CSV issues (quotes, commas in values, line breaks)
- [ ] Use Papa Parse library: `npm install papaparse @types/papaparse`

**Verification:**
- Parse valid CSV correctly
- Generate valid CSV from data
- Handle edge cases (quotes, commas)
- Invalid CSV headers detected

### [ ] Step: Phase 4.2 - Import API Route
<!-- Spec reference: app/api/import/route.ts, Section 5.2 -->

Implement CSV import endpoint.

**Tasks:**
- [ ] Create `app/api/import/route.ts`
- [ ] Implement `POST` handler: accept FormData with CSV file
- [ ] Validate file size (< 5MB) and type (.csv)
- [ ] Parse CSV using `parseCSV()` utility
- [ ] Validate each row with Zod schema
- [ ] Insert valid rows into `kpi_entries` table (bulk insert)
- [ ] Return success count and array of errors (row number + message)
- [ ] Create audit log for import action

**Verification:**
- Valid CSV imports successfully
- Invalid rows return errors with row numbers
- Partial import works (valid rows inserted, invalid skipped)
- File size limit enforced
- Audit log created for import

### [ ] Step: Phase 4.3 - Export API Route
<!-- Spec reference: app/api/export/route.ts, Section 5.2 -->

Implement CSV export endpoint.

**Tasks:**
- [ ] Create `app/api/export/route.ts`
- [ ] Implement `GET` handler: accept query params (restaurant_id, from, to dates)
- [ ] Fetch KPI entries from Supabase with filters
- [ ] Convert data to CSV using `generateCSV()` utility
- [ ] Set response headers for file download: `Content-Type: text/csv`, `Content-Disposition: attachment; filename=kpi-export.csv`
- [ ] Return CSV file

**Verification:**
- Export generates valid CSV file
- Filters work correctly (date range, restaurant)
- File downloads in browser
- CSV can be opened in Excel/Google Sheets

### [ ] Step: Phase 4.4 - Import/Export Pages
<!-- Spec reference: app/(dashboard)/import/page.tsx, app/(dashboard)/export/page.tsx -->

Create UI pages for CSV import and export.

**Tasks:**
- [ ] Create `app/(dashboard)/import/page.tsx`
- [ ] Add file upload input (shadcn/ui or custom)
- [ ] Show CSV template download link
- [ ] Display upload progress and validation results
- [ ] Show error table (row number, field, message) for invalid rows
- [ ] Show success message with count of imported rows
- [ ] Create `app/(dashboard)/export/page.tsx`
- [ ] Add filters: Date range picker, Restaurant selector
- [ ] Add "Export" button to trigger download
- [ ] Show loading state during export

**Verification:**
- Can upload CSV file
- Validation errors display in table
- Success message shows imported count
- CSV template downloads correctly
- Export filters work
- Export downloads CSV file

### [ ] Step: Phase 4.5 - User Management API
<!-- Spec reference: app/api/users/route.ts, Section 5.2 -->

Implement user CRUD API endpoints (admin only).

**Tasks:**
- [ ] Create Zod schemas in `lib/validations/user.schema.ts`
- [ ] Create `app/api/users/route.ts`
- [ ] Implement `GET` handler: list users with pagination and filters (role)
- [ ] Implement `POST` handler: create user (insert into auth.users via Supabase Admin API + profiles table)
- [ ] Insert user-restaurant assignments in `user_restaurants` table
- [ ] Create `app/api/users/[id]/route.ts`
- [ ] Implement `PUT` handler: update user profile and restaurant assignments
- [ ] Implement `DELETE` handler: soft delete (set is_active = false)
- [ ] Add audit logging for all user actions
- [ ] Verify user is admin before allowing operations (check role)

**Verification:**
- Admin can list users
- Admin can create user with restaurant assignments
- Admin can update user role and assignments
- Admin can deactivate user
- Non-admin gets 403 error
- Audit logs created for user actions

### [ ] Step: Phase 4.6 - Restaurant Management API
<!-- Spec reference: app/api/restaurants/route.ts, Section 5.2 -->

Implement restaurant CRUD API endpoints (admin only).

**Tasks:**
- [ ] Create Zod schemas in `lib/validations/restaurant.schema.ts`
- [ ] Create `app/api/restaurants/route.ts`
- [ ] Implement `GET` handler: list restaurants with filters (is_active)
- [ ] Implement `POST` handler: create restaurant
- [ ] Create `app/api/restaurants/[id]/route.ts`
- [ ] Implement `PUT` handler: update restaurant
- [ ] Implement `DELETE` handler: soft delete (set is_active = false)
- [ ] Add audit logging for restaurant actions
- [ ] Verify user is admin before allowing operations

**Verification:**
- Admin can list restaurants
- Admin can create restaurant
- Admin can update restaurant
- Admin can deactivate restaurant
- Non-admin gets 403 error
- Audit logs created

### [ ] Step: Phase 4.7 - Audit Log API
<!-- Spec reference: app/api/audit-logs/route.ts, Section 5.2 -->

Implement audit log viewing endpoint (admin only).

**Tasks:**
- [ ] Create `app/api/audit-logs/route.ts`
- [ ] Implement `GET` handler: fetch audit logs with filters (user_id, action, date range)
- [ ] Support pagination (page, limit)
- [ ] Order by created_at DESC
- [ ] Join with profiles to include user email
- [ ] Verify user is admin before allowing access

**Verification:**
- Admin can fetch audit logs
- Filters work correctly
- Pagination works
- User email included in response
- Non-admin gets 403 error

### [ ] Step: Phase 4.8 - User Management Page
<!-- Spec reference: app/(dashboard)/admin/users/page.tsx -->

Build admin page for user management.

**Tasks:**
- [ ] Create `components/admin/UserTable.tsx`
- [ ] Display columns: Email, Full Name, Role, Restaurants (comma-separated), Status (Active/Inactive), Actions (Edit, Delete)
- [ ] Add create user dialog (form with email, name, role, restaurant multi-select)
- [ ] Add edit user dialog (same form, pre-filled)
- [ ] Add delete confirmation dialog
- [ ] Create `app/(dashboard)/admin/users/page.tsx`
- [ ] Fetch users using TanStack Query (`lib/hooks/useUsers.ts`)
- [ ] Render `UserTable` component
- [ ] Handle form submissions (create, update, delete API calls)
- [ ] Protect route (redirect if not admin)

**Verification:**
- Admin can view user list
- Can create user with restaurant assignments
- Can edit user role and assignments
- Can deactivate user
- Non-admin redirected from page
- Form validation works

### [ ] Step: Phase 4.9 - Restaurant Management Page
<!-- Spec reference: app/(dashboard)/admin/restaurants/page.tsx -->

Build admin page for restaurant management.

**Tasks:**
- [ ] Create `components/admin/RestaurantTable.tsx`
- [ ] Display columns: Name, Location, Timezone, Status, Actions (Edit, Delete)
- [ ] Add create restaurant dialog
- [ ] Add edit restaurant dialog
- [ ] Add delete confirmation
- [ ] Create `app/(dashboard)/admin/restaurants/page.tsx`
- [ ] Fetch restaurants using TanStack Query
- [ ] Render `RestaurantTable` component
- [ ] Handle CRUD operations
- [ ] Protect route (admin only)

**Verification:**
- Admin can view restaurant list
- Can create restaurant
- Can edit restaurant
- Can deactivate restaurant
- Non-admin redirected

### [ ] Step: Phase 4.10 - Audit Log Viewer Page
<!-- Spec reference: app/(dashboard)/admin/audit-logs/page.tsx -->

Build admin page for viewing audit logs.

**Tasks:**
- [ ] Create `components/admin/AuditLogTable.tsx`
- [ ] Display columns: Timestamp, User, Action, Resource Type, Resource ID, Changes (expandable JSON)
- [ ] Add filters: User dropdown, Action dropdown, Date range
- [ ] Add pagination
- [ ] Format timestamps (relative time, e.g., "2 hours ago")
- [ ] Create expandable row to show changes JSON (before/after diff)
- [ ] Create `app/(dashboard)/admin/audit-logs/page.tsx`
- [ ] Fetch audit logs using TanStack Query
- [ ] Render `AuditLogTable` with filters
- [ ] Protect route (admin only)

**Verification:**
- Admin can view audit logs
- Filters work correctly
- Pagination works
- Changes JSON displays correctly
- Timestamps formatted correctly
- Non-admin redirected

### [ ] Step: Phase 5.1 - Dark Mode Implementation
<!-- Spec reference: Section 6.1, components/layout/ThemeToggle.tsx -->

Implement dark mode toggle using next-themes.

**Tasks:**
- [ ] Install next-themes: `npm install next-themes`
- [ ] Create `components/providers/ThemeProvider.tsx` (wrap app with ThemeProvider)
- [ ] Update `app/layout.tsx` to include ThemeProvider
- [ ] Create `components/layout/ThemeToggle.tsx` (sun/moon icon toggle)
- [ ] Add ThemeToggle to Header component
- [ ] Verify all components use CSS variables (not hardcoded colors)
- [ ] Test dark mode on all pages

**Verification:**
- Theme toggle switches between light/dark
- All pages respect dark mode
- Theme persists on page refresh
- System preference detected on first load
- No hardcoded colors break dark mode

### [ ] Step: Phase 5.2 - Loading States & Skeletons
<!-- Spec reference: Section 8.2 -->

Add loading states and skeleton loaders throughout app.

**Tasks:**
- [ ] Create `components/ui/skeleton.tsx` (shadcn/ui)
- [ ] Add loading skeletons to dashboard page (KPI cards, charts)
- [ ] Add loading skeletons to KPI list page (table rows)
- [ ] Add loading skeletons to admin pages (tables)
- [ ] Add loading spinner to form submit buttons (disabled during submission)
- [ ] Add suspense boundaries for server components
- [ ] Create `app/loading.tsx` for route transitions

**Verification:**
- Loading skeletons display during data fetch
- Form buttons show loading state during submit
- Route transitions show loading indicator
- No layout shift when data loads

### [ ] Step: Phase 5.3 - Error Handling & Boundaries
<!-- Spec reference: Section 7 -->

Implement error boundaries and user-friendly error messages.

**Tasks:**
- [ ] Create `app/error.tsx` for route-level errors
- [ ] Create `app/global-error.tsx` for global errors
- [ ] Add try-catch blocks in API routes with consistent error format
- [ ] Create toast notification component (shadcn/ui `toast`)
- [ ] Display toast on API errors (network errors, validation errors, auth errors)
- [ ] Add 404 page (`app/not-found.tsx`)
- [ ] Handle Supabase errors gracefully (e.g., RLS violations)

**Verification:**
- Error boundary catches errors and shows fallback UI
- API errors return consistent format
- Toasts display error messages
- 404 page shows for invalid routes
- Network errors handled gracefully

### [ ] Step: Phase 5.4 - Responsive Design
<!-- Spec reference: Section 8.2 -->

Ensure all pages are responsive on mobile and tablet.

**Tasks:**
- [ ] Test all pages on mobile viewport (< 768px)
- [ ] Make sidebar collapsible on mobile (hamburger menu)
- [ ] Adjust table columns on mobile (hide less important columns, stack data)
- [ ] Make charts responsive (use ResponsiveContainer from Recharts)
- [ ] Adjust form layouts on mobile (full-width inputs)
- [ ] Test dashboard on tablet (768px - 1024px)
- [ ] Fix any layout overflow issues

**Verification:**
- All pages usable on mobile (iPhone SE, iPhone 12)
- Sidebar toggles on mobile
- Tables scrollable/readable on mobile
- Charts render correctly on mobile
- Forms usable on mobile
- No horizontal scroll on any page

### [ ] Step: Phase 5.5 - Accessibility (A11y)
<!-- Spec reference: Section 7.1 -->

Improve accessibility to meet WCAG 2.1 AA standards.

**Tasks:**
- [ ] Add ARIA labels to all form inputs
- [ ] Ensure all interactive elements keyboard-navigable (tab order)
- [ ] Add focus indicators (visible outline on tab)
- [ ] Add screen reader text for icon-only buttons
- [ ] Ensure color contrast meets WCAG AA (use contrast checker)
- [ ] Add skip-to-content link for keyboard users
- [ ] Test with keyboard navigation (no mouse)
- [ ] Run Lighthouse accessibility audit

**Verification:**
- All forms keyboard-navigable
- Focus indicators visible
- Lighthouse accessibility score > 90
- Screen reader announces page changes
- Color contrast meets WCAG AA

### [ ] Step: Phase 5.6 - Documentation
<!-- Spec reference: README.md, .env.example -->

Write comprehensive setup and usage documentation.

**Tasks:**
- [ ] Update `.env.example` with all required variables and comments
- [ ] Write `README.md` with:
  - [ ] Project overview
  - [ ] Features list
  - [ ] Tech stack
  - [ ] Prerequisites
  - [ ] Local setup steps (< 10 steps)
  - [ ] Supabase setup guide
  - [ ] Environment variables guide
  - [ ] Running the app
  - [ ] Building for production
  - [ ] Deployment to Vercel guide
  - [ ] Default admin account info
  - [ ] Troubleshooting section

**Verification:**
- README.md complete and accurate
- .env.example has all required variables
- Setup steps clear and concise
- Can follow README to set up project from scratch

### [ ] Step: Phase 5.7 - Database Seeding
<!-- Spec reference: supabase/migrations/003_seed_data.sql -->

Create seed data for testing and demo.

**Tasks:**
- [ ] Create `supabase/migrations/003_seed_data.sql`
- [ ] Add seed admin user (email: admin@example.com, password: changeme123)
- [ ] Add 2 manager users
- [ ] Add 1 viewer user
- [ ] Add 3 restaurants
- [ ] Assign users to restaurants
- [ ] Add 90 days of sample KPI entries for each restaurant (realistic data)
- [ ] Push migration: `supabase db push`

**Verification:**
- Seed data inserted successfully
- Can login with seed admin account
- Dashboard shows seed KPI data
- Charts render with seed data
- All user roles work correctly

### [ ] Step: Phase 5.8 - Testing & Quality Checks
<!-- Spec reference: Section 8 -->

Run comprehensive tests and quality checks.

**Tasks:**
- [ ] Run `npm run build` - ensure no TypeScript errors
- [ ] Run `npm run lint` - fix all linting errors
- [ ] Test all user roles (admin, manager, viewer) - verify permissions
- [ ] Test all CRUD operations (KPIs, users, restaurants)
- [ ] Test CSV import/export with various files
- [ ] Test dashboard with different date ranges
- [ ] Test RLS policies (attempt unauthorized access)
- [ ] Test form validation (invalid inputs)
- [ ] Test responsive design on multiple devices
- [ ] Test dark mode on all pages
- [ ] Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- [ ] Document test results in plan.md

**Verification:**
- Zero TypeScript errors
- Zero lint errors
- All features working as expected
- RLS prevents unauthorized access
- Lighthouse scores > 80 (all categories)

### [ ] Step: Phase 5.9 - Vercel Deployment
<!-- Spec reference: Section 9, 10 -->

Deploy application to Vercel.

**Tasks:**
- [ ] Create Vercel account and link project
- [ ] Configure environment variables in Vercel dashboard (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Push code to GitHub repository
- [ ] Connect Vercel to GitHub repo
- [ ] Deploy to production
- [ ] Verify deployment succeeded
- [ ] Test production app (login, dashboard, CRUD operations)
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel analytics (optional)

**Verification:**
- Deployment successful
- Production app accessible at Vercel URL
- All features work in production
- Environment variables configured correctly
- HTTPS enabled (Vercel default)

### [ ] Step: Phase 5.10 - Final Review & Documentation
<!-- Spec reference: All sections -->

Final review and project cleanup.

**Tasks:**
- [ ] Review all code for consistency
- [ ] Remove console.logs and debug code
- [ ] Remove unused dependencies
- [ ] Verify all TODOs in code are resolved
- [ ] Update README with production URL
- [ ] Create demo video or screenshots (optional)
- [ ] Tag release version in Git: `v1.0.0`
- [ ] Celebrate! 🎉

**Verification:**
- No console errors in production
- No unused dependencies
- README up-to-date with production info
- Git repository clean and organized
- Project ready for handoff
