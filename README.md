# fluter cash

Mobile-first savings and rewards app interface, powered by Neon Auth.

## Authentication
- Email and password sign-up / sign-in
- Google OAuth sign-in
- Session restoration and sign-out
- Password reset email flow
- Email verification enforced by the Neon Auth project configuration

## Development
```bash
npm install
VITE_NEON_AUTH_URL="https://ep-aged-shape-bdxo6onc.neonauth.c-8.us-east-2.aws.neon.tech/neondb/auth" npm run dev
```

## Deployment
GitHub Actions builds the Vite app and deploys `dist/` to GitHub Pages. Add a repository Actions secret named `VITE_NEON_AUTH_URL` with the Neon Auth URL.

## Important demo limitations
The wallet balance, savings actions, rewards, and transaction history are still front-end demo data. No real money movement, bank linking, KYC, or regulated financial services are connected. Do not treat the displayed balance as funds.
