# Zealy Pay (Demo, No Admin Panel)

A professional Next.js + Tailwind CSS wallet-style app with these pages:

- **Home** — marketing-style landing with CTAs
- **Register** — profile creation, loading, popup, automatic redirect to dashboard
- **Login** — email/password login
- **Dashboard** — ₦150,000 bonus, congratulatory 4-slide onboarding, balance, top buttons (Withdraw, Upgrade, Buy Zealy Code), quick access (Data, Airtime, Pay Bills, Investment), transaction history and Zealy Code gate (**ZLP1054XM**).

> All state is saved to `localStorage` for simplicity. No admin panel. Single Zealy Code: **ZLP1054XM**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

- Push this folder to a new GitHub repo.
- In Vercel: **Add New… → Project → Import from GitHub**.
- Framework Preset: **Next.js**. No special env vars needed.
- Deploy.

## Notes

- Transactions are simulated and stored in the browser.
- You can enhance validation, add real APIs, or connect a database later if needed.
