# JSS Career Academy - Login + Payment Version

This version includes:
- Student login/signup flow
- Supabase-ready authentication
- Razorpay payment flow
- Demo mode when keys are not configured
- Locked dashboard after login/payment
- 50 video course structure
- 95% assessment unlock logic

## Deploy on Vercel
Upload all files to GitHub, then redeploy on Vercel.

## Environment Variables in Vercel
Add these later when your accounts are ready:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RAZORPAY_KEY_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

Without these keys, the app runs in demo mode.

## Supabase Database
Open Supabase SQL editor and run `supabase.sql`.
