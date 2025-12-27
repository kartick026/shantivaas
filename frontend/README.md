# Shantivaas Frontend

Next.js 15 frontend for the Shantivaas rental management platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase project set up with migrations applied
- Database credentials from Supabase dashboard

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Razorpay (for payments - Phase 4)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Shantivaas
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── login/                    # Login page (email/OTP)
│   ├── auth/
│   │   ├── callback/             # Auth callback handler
│   │   ├── verify-otp/           # OTP verification
│   │   └── signout/              # Logout route
│   ├── dashboard/                # Role-based redirect
│   ├── admin/
│   │   └── dashboard/            # Admin dashboard
│   └── tenant/
│       └── dashboard/            # Tenant dashboard (coming soon)
├── lib/
│   ├── supabase/                 # Supabase client utilities
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── types/
│   │   └── database.types.ts     # TypeScript types from schema
│   └── utils.ts                  # Helper functions
└── middleware.ts                 # Next.js middleware
```

## 🔐 Authentication

### Admin Login
- Method: **Email Magic Link**
- Use: Admin dashboard access
- Flow: Enter email → Check inbox → Click link → Logged in

### Tenant Login
- Method: **Phone OTP**
- Use: Tenant dashboard access
- Flow: Enter phone (+91...) → Receive SMS → Enter 6-digit code → Logged in

## 🎨 Features Implemented

### Phase 2 - Auth & Roles ✅

- [x] Next.js 15 with App Router
- [x] Supabase SSR integration
- [x] Email authentication (magic link)
- [x] Phone authentication (OTP)
- [x] Protected routes middleware
- [x] Role-based dashboard routing
- [x] Admin dashboard (stats, rooms, complaints)
- [x] TypeScript type safety
- [x] Tailwind CSS styling

## 📊 Admin Dashboard

Current features:
- **Financial Stats**: Total expected, collected, pending, overdue
- **Room Status**: Occupancy levels per room
- **Recent Complaints**: Latest 5 complaints with status
- **Quick Actions**: Manage tenants, mark payments, view complaints

Data sources:
- `monthly_collection_summary` view
- `room_status` view
- Real-time database queries

## 🔧 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth (SSR)
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **Utilities**: date-fns, clsx, tailwind-merge

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

### Google Cloud Run

See deployment guide in `/docs/deployment/`

## 📝 Next Steps

### Phase 3 - Core Features

- [ ] Tenant dashboard
- [ ] Tenant management (CRUD)
- [ ] Room management
- [ ] Floor/Building management
- [ ] Rent cycle visualization

### Phase 4 - Payments

- [ ] Razorpay integration
- [ ] Online payment flow
- [ ] Manual payment marking
- [ ] Payment history
- [ ] Receipt generation

### Phase 5 - Notifications

- [ ] In-app notification bell
- [ ] WhatsApp/SMS integration
- [ ] Reminder scheduling
- [ ] Email notifications

## 🐛 Troubleshooting

### "Invalid session" error
- Check `.env.local` has correct Supabase credentials
- Ensure middleware.ts is not excluded in next.config

### Database connection fails
- Verify Supabase project is running
- Check RLS policies are enabled
- Ensure migrations are applied

### OTP not received
- Check phone number format: +91XXXXXXXXXX
- Verify Supabase Auth is configured for SMS
- Check Supabase project has SMS provider enabled

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔒 Security Notes

- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side variables only
- Keep service role key server-side only
- RLS policies protect database access

---

**Status**: Phase 2 Complete ✅ | Phase 3 In Progress 🚧

Last Updated: 2025-12-27
