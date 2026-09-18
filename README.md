# BMX Staking — Professional UI Upgrade

This package is a polished, responsive front-end prototype for a BMX staking dashboard.

## Included
- Professional responsive dashboard
- Wallet connection modal (preview only)
- Staking flow
- Referral dashboard
- Transfer flow
- Profile, support, FAQ, login and register pages
- Local browser state for the preview balance/activity
- Mobile navigation
- Clear preview disclosure

## Important
The 1,000,000,000 BMX starting balance is **not a real blockchain token balance**. It is stored in browser `localStorage` for previewnstration.

No private keys, seed phrases, deposits, withdrawals, or real blockchain transactions are used.

To make this production-ready, the front end must be connected to a real token contract/program and wallet adapter, with on-chain balance reads and a secure/audited staking implementation.

## GitHub Pages
Upload the files to your repository and enable GitHub Pages. No build step is required.


## Current platform status

This release is styled as a production-quality platform preview. The interface is presentation-ready, but blockchain functionality has not been connected yet. BMX balances, staking rewards, transfers, referrals, and activity shown by the frontend are simulated and have no monetary value. No real deposits, withdrawals, private keys, or blockchain transactions are performed.

## Referral tracking

Each registered browser user receives a unique referral code and shareable registration URL. When a new registration uses that URL, the referrer relationship is recorded and displayed on the Referrals page.

This is **browser-local simulation tracking**. It does not provide a shared server/database, real account system, real referral payouts, or blockchain rewards. For production use, referral relationships should be stored in a secure backend/database with proper authentication and anti-abuse controls.
