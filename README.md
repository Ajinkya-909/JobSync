# JobSync - Comprehensive Job Board Platform

A full-stack, role-based job board and employment management platform built with modern web technologies. JobSync connects job seekers (employees) with businesses, facilitates job applications, and provides administrative oversight for the entire ecosystem.

## Overview

JobSync is a complete job marketplace platform that enables three distinct user roles to interact seamlessly:

- **Employees**: Search, apply for jobs, manage applications, and build professional profiles
- **Businesses**: Post job listings, review applications, manage profiles, and track applicants
- **Admins**: Oversee the platform, manage users, approve businesses, and monitor analytics

## Key Features

### For Employees

- User authentication with email/password
- Create and manage professional profiles
- Browse and search available jobs with advanced filters
- Apply to jobs with one-click applications
- View application status and history
- Save favorite jobs for later
- Access personalized job recommendations

### For Businesses

- Business profile creation and management
- Application approval process (requires admin review)
- Post and manage job listings
- View and filter applicants
- Review detailed applicant profiles
- Track job application responses
- Monitor job post limits and manage quota

### For Admins

- Complete platform oversight and analytics
- Approve/reject business registrations
- Manage user accounts (employees and businesses)
- Monitor job postings and removals
- View platform-wide analytics and metrics
- User management and role assignments

## Technology Stack

### Frontend

- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality, accessible component library
- **React Router** - Client-side routing
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation
- **React Query** - Server state management

### Backend & Database

- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time authentication
  - Real-time database subscriptions
  - Storage for user uploads

## Project Structure

```
src/
├── pages/              # Route page components
│   ├── Home.tsx       # Landing page
│   ├── Auth.tsx       # Authentication page
│   ├── Dashboard.tsx  # Role-based dashboard router
│   ├── Jobs.tsx       # Job listing page
│   ├── JobDetail.tsx  # Individual job details
│   ├── CreateJob.tsx  # Job creation form
│   ├── MyApplications.tsx # User applications
│   ├── SavedJobs.tsx  # Bookmarked jobs
│   ├── BusinessDashboard.tsx # Business overview
│   ├── EmployeeDashboard.tsx # Employee overview
│   ├── ApplicantDetail.tsx # View applicant profile
│   └── admin/         # Admin-only pages
│       ├── AdminDashboard.tsx
│       ├── AdminBusinesses.tsx
│       ├── AdminJobs.tsx
│       ├── AdminEmployees.tsx
│       └── AdminAnalytics.tsx
├── components/        # Reusable UI components
│   ├── Layout.tsx     # Main app layout
│   ├── Sidebar.tsx    # Navigation sidebar
│   ├── ProtectedRoute.tsx # Route guards
│   └── ui/            # shadcn/ui components
├── contexts/          # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   └── supabase.ts    # Supabase client
└── types/             # TypeScript type definitions
    └── database.ts    # Database schema types
```

## User Types & Roles

### Employee

- Default role for new users
- Can search and apply for jobs
- Build and manage professional profiles
- Track application status

### Business

- Requires application approval by admin
- Can post job openings
- Review and manage applicants
- Access business analytics

### Admin

- Full platform access
- Can approve/reject business applications
- View all users and analytics
- Manage platform settings

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account for database/auth

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd JobSync

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Supabase credentials to .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Development Commands

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Database Schema

The application uses PostgreSQL with Supabase and includes the following main tables:

- **users** - User accounts and authentication
- **profiles** - User profile information
- **businesses** - Business account details
- **business_applications** - Business approval workflow
- **jobs** - Job postings
- **job_applications** - Job application tracking
- **saved_jobs** - User job bookmarks

See `current_schema.sql` for the complete schema.

## Authentication Flow

1. Users sign up or log in via email/password
2. Supabase handles authentication and sessions
3. User role is assigned on registration (defaults to "employee")
4. Protected routes check user authentication and role
5. Business users must be approved by admin before full access

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Environment Variables

```
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anonymous key
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is open source and available under the MIT License.

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
