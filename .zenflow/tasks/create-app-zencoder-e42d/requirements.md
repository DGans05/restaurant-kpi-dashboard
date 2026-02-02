# Product Requirements Document (PRD)
## Restaurant KPI Dashboard - Simplified Version

**Version:** 1.0  
**Date:** 2026-02-02  
**Status:** Draft

---

## 1. Overview

### 1.1 Purpose
Build a simplified, production-ready restaurant KPI tracking dashboard that is easy to set up, maintain, and extend. The application will run on free hosting (Vercel) with a focus on reducing architectural complexity while maintaining core functionality.

### 1.2 Background
The previous version became too complex for agent development due to:
- Multiple services (Next.js, Express, PostgreSQL, Nginx, Convex)
- Complex auth flow (WorkOS + Custom JWT + Convex integration)
- Docker-based multi-container setup
- Separate frontend/backend codebases

### 1.3 Goals
- **Simplicity**: Single codebase, minimal services, easy local development
- **Free Hosting**: Deploy on Vercel with zero infrastructure costs
- **Extensibility**: Clean architecture that allows adding features incrementally
- **Core Features**: Dashboard with charts, audit logging, import/export

---

## 2. Target Users

### 2.1 User Roles
1. **Admin**: Full system access, user management, audit logs
2. **Manager**: Manage KPIs for assigned restaurant(s)
3. **Viewer**: Read-only access for assigned restaurant(s)

### 2.2 User Personas
- **Restaurant Owner** (Admin): Monitors multiple locations, reviews audit logs
- **Store Manager** (Manager): Tracks daily KPIs, uploads data, exports reports
- **Regional Supervisor** (Viewer): Reviews performance across locations

---

## 3. Core Features (MVP)

### 3.1 Authentication & Authorization
- Email/password registration and login
- Role-based access control (Admin, Manager, Viewer)
- Restaurant assignment per user
- Admins can manage all restaurants; Managers/Viewers see only assigned restaurants

### 3.2 KPI Tracking
- **Daily KPI Entry**: Revenue, labour cost, food cost, order count, date
- **CRUD Operations**: Create, read, update, delete KPI entries
- **Validation**: Ensure costs don't exceed revenue, required fields, date constraints
- **Restaurant Association**: Each KPI entry belongs to a specific restaurant

### 3.3 Dashboard & Analytics
- **KPI Cards**: Display today's key metrics (revenue, labour %, food %, orders)
- **Trend Indicators**: Show percentage change vs previous period
- **Charts**: 
  - Revenue trend (line chart, last 30 days)
  - Labour & Food cost comparison (bar chart)
  - Orders over time (area chart)
- **Date Range Filter**: Toggle between 7/30/90 days
- **Restaurant Filter**: Admins can switch between restaurants

### 3.4 Import/Export
- **CSV Import**: Bulk upload KPI entries (date, revenue, labour_cost, food_cost, orders)
- **CSV Export**: Download KPI data with filters (date range, restaurant)
- **Validation**: Show errors for invalid rows, allow partial import of valid rows

### 3.5 Audit Logging
- **Tracked Actions**: User login, KPI create/update/delete, user management changes
- **Audit Fields**: User ID, action type, timestamp, IP address, resource ID, changes (JSON)
- **Admin Access**: View audit logs with filters (user, action, date range)
- **Retention**: Keep logs indefinitely (no auto-deletion in MVP)

### 3.6 User Management (Admin Only)
- **User CRUD**: Create, list, update, delete users
- **Role Assignment**: Set user role (admin/manager/viewer)
- **Restaurant Assignment**: Assign users to one or more restaurants
- **Status Management**: Activate/deactivate users

### 3.7 Restaurant Management (Admin Only)
- **Restaurant CRUD**: Add, list, update restaurants
- **Fields**: Name, location, timezone, active status
- **Soft Delete**: Mark as inactive rather than hard delete

---

## 4. Non-Functional Requirements

### 4.1 Technology Stack
- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (free tier)
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **State Management**: React hooks + TanStack Query
- **Validation**: Zod

### 4.2 Performance
- Page load time < 2 seconds
- Chart rendering < 500ms
- API response time < 1 second (p95)

### 4.3 Security
- Row Level Security (RLS) in Supabase
- Secure password hashing (Supabase Auth)
- HTTPS only (Vercel default)
- No sensitive data in client-side code

### 4.4 Scalability
- Support up to 50 restaurants
- Support up to 100 users
- Store 2+ years of daily KPI data per restaurant

---

## 5. Technical Assumptions

### 5.1 Architecture Decisions
1. **Single Next.js App**: API routes handle backend logic, no separate Express server
2. **Supabase for Everything**: Database, auth, file storage (CSV uploads), RLS for authorization
3. **Server Components**: Use Next.js server components for data fetching where possible
4. **API Routes**: Use Next.js API routes (`app/api/`) for mutations and complex queries
5. **File-based Routing**: Leverage Next.js App Router convention

### 5.2 Database Schema
- **users**: Managed by Supabase Auth, extended with custom profile table
- **restaurants**: Name, location, timezone, is_active
- **kpi_entries**: restaurant_id, date, revenue, labour_cost, food_cost, orders
- **audit_logs**: user_id, action, resource_type, resource_id, changes, ip, timestamp
- **user_restaurants**: Many-to-many relationship (users ↔ restaurants)

### 5.3 Simplified vs Original
| Aspect | Original | Simplified |
|--------|----------|-----------|
| Services | 5 (Next, Express, PostgreSQL, Nginx, Convex) | 2 (Next.js, Supabase) |
| Auth | WorkOS + Custom JWT + Convex | Supabase Auth |
| Authorization | Custom middleware in Express | Supabase RLS |
| Deployment | Docker Compose | Vercel + Supabase Cloud |
| API Layer | Separate Express backend | Next.js API routes |
| File Storage | Local filesystem | Supabase Storage |

---

## 6. User Flows

### 6.1 First-Time Setup
1. Admin signs up (first user becomes admin)
2. Admin creates restaurants
3. Admin creates manager/viewer accounts
4. Admin assigns users to restaurants

### 6.2 Daily KPI Entry (Manager)
1. Manager logs in
2. Navigates to "Add KPI Entry"
3. Selects date (defaults to today)
4. Enters revenue, labour cost, food cost, orders
5. Submits (triggers audit log)
6. Success message, redirects to dashboard

### 6.3 Dashboard Review (Admin)
1. Admin logs in, sees dashboard overview
2. Selects restaurant from dropdown (or "All Restaurants")
3. Views KPI cards and charts
4. Changes date range (7/30/90 days)
5. Clicks "Export" to download CSV

### 6.4 Bulk Import (Manager)
1. Manager navigates to "Import KPIs"
2. Downloads CSV template
3. Fills in data offline
4. Uploads CSV file
5. System validates and shows preview with errors
6. Manager confirms import
7. Valid rows inserted, error summary displayed

---

## 7. UI/UX Requirements

### 7.1 Design Principles
- **Clean & Modern**: Card-based layout, ample whitespace
- **Responsive**: Mobile-first, works on tablets/phones
- **Accessible**: WCAG 2.1 AA compliance, keyboard navigation
- **Dark Mode**: Support system preference + manual toggle

### 7.2 Key Screens
1. **Login/Register**: Centered form, minimal branding
2. **Dashboard**: KPI cards at top, charts below, filters in header
3. **KPI List**: Table view with pagination, search, filters
4. **KPI Form**: Simple vertical form with validation messages
5. **Import/Export**: Upload area, preview table, error feedback
6. **User Management**: Table with role/restaurant columns, inline edit
7. **Audit Logs**: Filterable table with expandable JSON changes

### 7.3 Navigation
- **Sidebar**: Collapsible, icons + labels, sections for Dashboard/KPIs/Admin
- **Header**: Restaurant selector (admin), user menu, theme toggle
- **Breadcrumbs**: Show current location

---

## 8. Success Metrics

### 8.1 Development Success
- ✅ Single developer can set up locally in < 10 minutes
- ✅ Deploy to production in < 5 minutes
- ✅ Add new feature without modifying core auth/db logic

### 8.2 User Success
- ✅ Manager can add daily KPI in < 1 minute
- ✅ Admin can review dashboard and understand trends at a glance
- ✅ Audit trail provides complete action history

---

## 9. Out of Scope (Future Versions)

- Mobile app
- Real-time notifications
- Advanced analytics (forecasting, ML)
- Multi-tenant SaaS with org isolation
- Integrations with POS systems
- Automated data ingestion
- Custom report builder
- Email reports/alerts
- KPI target alerts

---

## 10. Dependencies & Risks

### 10.1 External Dependencies
- **Vercel**: Free tier limits (100GB bandwidth, 100GB hours)
- **Supabase**: Free tier limits (500MB database, 2GB file storage, 50K monthly active users)

### 10.2 Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase free tier exceeded | Service degradation | Monitor usage, upgrade plan if needed ($25/month) |
| Vercel bandwidth limit hit | Site unavailable | Optimize assets, consider Vercel Pro ($20/month) |
| RLS complexity for agents | Development slowdown | Provide clear RLS policy templates, examples |
| Next.js API routes less familiar | Longer dev time | Reference official Next.js docs, use TypeScript |

---

## 11. Acceptance Criteria

### 11.1 Feature Completeness
- [ ] All 3 user roles working with proper permissions
- [ ] CRUD operations for KPIs, users, restaurants
- [ ] Dashboard shows charts with real data
- [ ] CSV import validates and handles errors gracefully
- [ ] CSV export includes filters and generates valid file
- [ ] Audit logs capture all specified actions

### 11.2 Quality
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] All forms have client-side validation
- [ ] RLS policies prevent unauthorized access
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode works throughout app

### 11.3 Deployment
- [ ] `.env.example` file with all required variables documented
- [ ] README with setup instructions (< 10 steps)
- [ ] Deployed to Vercel with working demo
- [ ] Supabase migrations committed to repo

---

## 12. Open Questions & Decisions

### 12.1 Decisions Made
1. **Stack**: Next.js + Supabase (approved)
2. **Hosting**: Vercel (approved)
3. **MVP Features**: Dashboard, audit, import/export (approved)
4. **Complexity**: Simplified architecture (approved)

### 12.2 Assumptions (User Did Not Specify)
1. **First User Admin**: First registered user automatically becomes admin
2. **Restaurant Creation**: Admins create restaurants manually (no CSV import for restaurants in MVP)
3. **Timezone Handling**: Store restaurant timezone but display times in user's local timezone
4. **KPI Date Range**: Default to 30 days on dashboard
5. **Pagination**: 20 items per page for tables
6. **File Upload Limit**: 5MB max for CSV imports
7. **Currency**: No currency selection, assume single currency (USD)

---

## 13. Implementation Phases

### Phase 1: Foundation
- Next.js project setup with TypeScript
- Supabase project creation
- Database schema and RLS policies
- Basic auth (login/register)
- Layout and navigation

### Phase 2: Core Features
- KPI CRUD operations
- Dashboard with cards
- Restaurant management
- User role enforcement

### Phase 3: Analytics & Data
- Charts implementation (Recharts)
- Date range filters
- CSV import/export
- Audit logging

### Phase 4: Admin & Polish
- User management UI
- Audit log viewer
- Responsive design refinements
- Dark mode
- Error handling & validation

### Phase 5: Deployment
- Environment variable configuration
- Vercel deployment
- Documentation (README, setup guide)
- Demo data seeding

---

**End of PRD**
