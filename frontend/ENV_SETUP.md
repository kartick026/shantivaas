# Environment Setup for Frontend

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Payment Gateway  
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Shantivaas
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Getting Razorpay Credentials (Test Mode)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate Test Keys
4. Copy:
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZ ORPAY_KEY_SECRET`

## Important

- Never commit `.env.local` to Git
- Use environment-specific values
- Keep secrets secure
