# Restaurant KPI Dashboard

A modern, full-stack web application for tracking and analyzing restaurant Key Performance Indicators (KPIs). Built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Features

✅ **Authentication & Authorization**
- Email/password authentication with Supabase Auth
- Role-based access control (Admin, Manager, Viewer)
- Protected routes and server-side auth checks

✅ **KPI Management**
- Create, read, update, and delete KPI entries
- Real-time cost percentage calculations
- Bulk import/export via CSV
- Pagination and filtering

✅ **Analytics Dashboard**
- 30-day revenue trends with Recharts
- Cost breakdown visualization
- KPI summary cards with trend indicators
- Previous period comparison

✅ **Admin Features**
- User management (create, edit, delete)
- Audit logging of all system changes
- Role assignment and management
- CSV data import with validation

✅ **Data Management**
- CSV import with real-time validation
- CSV export with calculated metrics
- Error reporting and recovery
- Batch operation support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Charting**: Recharts
- **Forms**: React Hook Form + Zod
- **Data**: TanStack Query, PapaParse (CSV)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd restaurant-kpi-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
```

4. **Set up the database**

Create the database migrations in Supabase:
```bash
# In Supabase dashboard: SQL Editor
# Run migrations from supabase/migrations/
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
├── (dashboard)/            # Protected dashboard pages
│   ├── dashboard/         # Main dashboard
│   ├── kpis/              # KPI management
│   ├── data/              # Import/export
│   └── admin/             # Admin features
├── api/                   # API routes
│   ├── kpis/
│   ├── restaurants/
│   ├── users/
│   └── audit-logs/
└── layout.tsx

components/
├── ui/                    # Shadcn UI components
├── layout/                # Layout components
├── kpis/                  # KPI-specific components
├── dashboard/             # Dashboard components
├── admin/                 # Admin components
├── import-export/         # Import/export UI
└── skeletons/             # Loading skeletons

lib/
├── supabase/              # Supabase clients
├── validations/           # Zod schemas
├── utils/                 # Utility functions
└── hooks/                 # Custom hooks
```

## Key Features Explained

### Authentication Flow
- Users visit `/` → redirected to `/dashboard` → redirected to `/login` if unauthenticated
- Role-based access: Admin > Manager > Viewer
- Session persisted with Supabase cookies

### KPI Tracking
- Create daily KPI entries with revenue, labour cost, food cost, and order count
- Automatic validation ensures costs don't exceed revenue
- View historical data with pagination and filtering
- Edit or delete entries (soft delete with audit logging)

### Dashboard Analytics
- Summary cards showing key metrics
- 30-day revenue trend chart
- Cost vs profit breakdown
- Previous period comparison with trend indicators

### CSV Import/Export
- Import multiple KPI entries in bulk
- Validate data with detailed error reporting
- Export filtered data for reporting
- Automatic audit logging of bulk operations

### User Management (Admin Only)
- Create users with roles (admin, manager, viewer)
- Edit user details
- Delete users and related data
- Audit log tracks all changes

## API Routes

### KPIs
- `GET /api/kpis` - List KPIs (with pagination, filtering)
- `POST /api/kpis` - Create KPI
- `GET /api/kpis/[id]` - Get single KPI
- `PUT /api/kpis/[id]` - Update KPI
- `DELETE /api/kpis/[id]` - Delete KPI (soft delete)
- `POST /api/kpis/import` - Bulk import from CSV
- `GET /api/kpis/export` - Export to CSV

### Restaurants
- `GET /api/restaurants` - List restaurants
- `POST /api/restaurants` - Create restaurant (admin only)
- `PUT /api/restaurants/[id]` - Update restaurant
- `DELETE /api/restaurants/[id]` - Delete restaurant

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/[id]` - Update user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Audit Logs
- `GET /api/audit-logs` - List audit logs (admin/manager only)

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure environment variables
- Deploy

3. **Set environment variables in Vercel**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Deploy**
```bash
vercel deploy --prod
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
npm start
```

### Database Migrations
Migrations are stored in `supabase/migrations/` and can be run via the Supabase dashboard or CLI.

## Security Considerations

- All API routes check user authentication and authorization
- Row Level Security (RLS) policies enforced at database level
- CSRF protection via Next.js built-in features
- Audit logging tracks all data modifications
- Passwords never stored (using Supabase Auth)
- Session tokens expire automatically

## Troubleshooting

### Authentication Issues
- Clear browser cookies and try again
- Check Supabase service status
- Verify environment variables are correct

### Data Not Loading
- Check browser console for errors
- Verify user has permission to view data
- Check Supabase RLS policies

### CSV Import Errors
- Verify CSV format matches specification
- Check for special characters in text fields
- Ensure dates are in YYYY-MM-DD format
- Review error details in import result

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the documentation
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Contact support@example.com

## Roadmap

- [ ] Advanced analytics and reporting
- [ ] Custom dashboard widgets
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Data archival and cleanup
- [ ] Webhook integrations
- [ ] Multi-language support
