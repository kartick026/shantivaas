# Shantivaas - Smart Living, Simple Management

Production-ready cloud-based Rental & PG Management Web Application.

## 🎯 Project Vision

Shantivaas is a professional rental management platform for multi-floor residential buildings (PGs / bachelor housing). It manages buildings, floors, rooms, tenants, rent payments (online & offline), automated dues, reminders, and reports.

## ✨ Key Features

### For Admins
- 🏢 Complete building, floor, and room management
- 👥 Tenant assignment and rent tracking
- 💰 Online payment acceptance via Razorpay
- 📝 Manual payment marking (cash/bank/UPI)
- 📊 Floor-wise and room-wise rent status
- 🔔 Automated reminders and escalations
- 🛠️ Complaint management system
- 📈 Monthly financial reports
- 🔍 Complete audit trail

### For Tenants
- 🔐 Secure OTP-based login
- 🏠 View room and rent details
- 💳 Pay rent online (UPI/Cards/NetBanking)
- 📜 View payment history
- 📱 Receive payment reminders
- 🔧 Raise maintenance complaints
- 🧾 Download payment receipts

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Supabase Realtime
- **UI Components**: Shadcn/ui

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (OTP/Email)
- **Storage**: Supabase Storage (receipts, ID proofs)
- **Serverless**: Supabase Edge Functions
- **Realtime**: Supabase Realtime Subscriptions

### Payments
- **Gateway**: Razorpay
- **Methods**: UPI, Cards, NetBanking, Wallets
- **Verification**: Webhook signature validation

### Notifications
- **In-app**: Supabase Realtime
- **WhatsApp**: WhatsApp Business API
- **SMS**: Twilio/MSG91
- **Email**: Supabase Email (backup)

### Hosting
- **Platform**: Google Cloud
- **Container**: Cloud Run (frontend)
- **Cron Jobs**: Cloud Scheduler
- **Monitoring**: Cloud Logging

## 📁 Project Structure

```
shantivaas/
├── supabase/                 # Database & backend
│   ├── migrations/           # SQL migrations
│   └── README.md            # Database documentation
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── docs/                    # Documentation
│   ├── api/                 # API documentation
│   ├── design/              # Design specs
│   └── deployment/          # Deployment guides
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Razorpay account (for payments)
- Google Cloud account (for deployment)

### 1. Database Setup

```bash
cd supabase
# Follow instructions in supabase/README.md
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### 3. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Notifications
WHATSAPP_API_KEY=your_whatsapp_key
SMS_API_KEY=your_sms_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📋 Development Phases

### ✅ Phase 1: Database Schema (COMPLETED)
- [x] Design complete entity-relationship model
- [x] Create 14 migration files
- [x] Implement Row Level Security (RLS)
- [x] Create helper views and functions
- [x] Add seed data for testing

### 🎯 Phase 2: Auth & Roles (NEXT)
- [ ] Supabase Auth setup
- [ ] OTP authentication for tenants
- [ ] Email authentication for admins
- [ ] Role-based access control
- [ ] RLS policy testing

### Phase 3: Core Rent Logic
- [ ] Rent cycle generation (Edge Function)
- [ ] Room allocation system
- [ ] Payment aggregation logic
- [ ] Room clearance calculation

### Phase 4: Payments
- [ ] Razorpay integration
- [ ] Webhook verification
- [ ] Manual payment interface
- [ ] Receipt generation
- [ ] Payment history

### Phase 5: Notifications & Automation
- [ ] In-app notification system
- [ ] WhatsApp/SMS integration
- [ ] Automated reminder scheduling
- [ ] Daily due checks (cron)
- [ ] Monthly rent generation (cron)

### Phase 6: Dashboards & UX
- [ ] Admin dashboard
- [ ] Tenant dashboard
- [ ] Floor/room management UI
- [ ] Complaint system UI
- [ ] Responsive design

### Phase 7: Production
- [ ] Monthly reports
- [ ] Backup strategy
- [ ] Logging & monitoring
- [ ] Google Cloud deployment
- [ ] Security audit

## 🔒 Security Features

- ✅ Row Level Security (RLS) at database level
- ✅ JWT-based authentication
- ✅ Webhook signature verification
- ✅ Complete audit trail
- ✅ Environment variable protection
- ✅ HTTPS enforcement
- ✅ Input validation and sanitization

## 📊 Business Rules

### Rent Management
- Total room rent = sum of individual tenant rents
- Room marked "CLEAR" when all payments received
- Admin can modify individual rent (logged)
- Multi-month dues supported

### Payments
- Online payments: immutable, webhook-verified
- Manual payments: admin-marked, editable
- Partial payments supported
- All changes logged in audit trail

### Notifications
- Reminders stop immediately after payment
- Only unpaid tenants receive reminders
- Escalation after X days overdue
- Multi-channel delivery (app, email, SMS, WhatsApp)

## 🧪 Testing

```bash
# Run database tests
cd supabase
# Use SQL queries in README.md

# Run frontend tests
cd frontend
npm test

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Database Schema](./supabase/README.md)
- [API Documentation](./docs/api/) (Coming soon)
- [Deployment Guide](./docs/deployment/) (Coming soon)
- [User Manual](./docs/user-manual/) (Coming soon)

## 🤝 Contributing

This is a production project. Contact the project maintainer before making changes.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For questions or issues:
- Email: support@shantivaas.com
- Documentation: [docs/](./docs/)

---

**Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🚧

Last Updated: 2025-12-27
