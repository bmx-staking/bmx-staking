# BMX Staking — Upgraded Front-End

A responsive, polished multi-page BMX Staking UI based on the supplied dashboard design.

## Included
- Responsive dashboard matching the supplied visual direction
- Staking page with simulated staking flow
- Referral page with copyable referral link
- Transfer page with simulated ID-to-ID transfers
- Profile, Support, FAQ, Login, Register and Admin pages
- Wallet connection demo modal
- LocalStorage state for demo balances, staking and transactions
- Mobile sidebar navigation
- GitHub Pages-friendly static files; no build step required

## Important
This is a front-end demo. Balances, rewards, staking and transfers are simulated in the browser and have no monetary value. No deposits, withdrawals, blockchain transactions, private keys or real wallet transactions are handled by this package.

## Deploy on GitHub Pages
1. Upload all files in this folder to your repository root.
2. Keep `index.html` as the entry point.
3. Enable GitHub Pages from the repository's Pages settings.
4. Open the published URL.

The included `index.html` redirects to `dashboard.html`.

## Final balance & transfer setup

- Admin account: **1,000,000,000 BMX** starting balance.
- Regular accounts: **0 BMX** starting balance.
- Website transfer: internal platform simulation only; it updates local website balances/activity.
- No real blockchain tokens are transferred by this static GitHub Pages build.
- Authentication, balances, referrals, and transfer records are browser-local in this prototype.
- Do not use real deposits, withdrawals, seed phrases, or private keys with this build.

## Daily reward schedule

- Website reward cycle: **12:00 AM IST (Asia/Kolkata) every day**.
- Rewards in this build are simulated locally and are not blockchain rewards.
