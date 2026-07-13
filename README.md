# BattleArena – Gaming Tournament Platform

React + Node/Express + Supabase PostgreSQL (via Prisma) + Firebase Authentication.

---

## Project Structure

\`\`\`
gaming-tournament/
├── public/
│   └── images/
│       ├── games/                      # Game card artwork (BGMI, Free Fire, Ludo, etc.)
│       └── tournaments/                # Tournament banner images
│
├── src/                                 # React frontend (Vite)
│   ├── components/
│   │   ├── AdminRoute.jsx              # Guards /admin routes — redirects non-admins
│   │   ├── Footer.jsx
│   │   ├── GameCard.jsx
│   │   ├── Navbar.jsx                  # Shows "Admin" link when user.isAdmin
│   │   └── TournamentCard.jsx          # Reads game info from GamesContext
│   ├── context/
│   │   ├── AuthContext.jsx             # Session, JWT, real wallet balance, refreshWallet()
│   │   └── GamesContext.jsx            # Shared, fetched-once games list
│   ├── data/
│   │   ├── gameMeta.js                 # Per-game image/accent-color lookup (not in DB)
│   │   ├── tournamentImages.js         # Per-tournament banner image lookup (not in DB)
│   │   └── tournaments.js              # Static marketing copy (why-choose-us)
│   ├── layouts/
│   │   └── MainLayout.jsx
│   ├── pages/
│   │   ├── admin/                      # Admin panel — protected by AdminRoute
│   │   │   ├── AdminDashboard.jsx      # Stats: users, tournaments, live, deposits
│   │   │   ├── AdminLayout.jsx         # Sidebar nav shell
│   │   │   ├── AdminTournamentResults.jsx  # Enter ranks/prizes, credits winnings
│   │   │   ├── AdminTournaments.jsx    # Create/edit/delete tournaments
│   │   │   └── AdminWithdrawals.jsx    # Approve/reject payout requests
│   │   ├── GameDetailPage.jsx
│   │   ├── GamesPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ProfilePage.jsx             # Match history via /auth/me/registrations
│   │   ├── TournamentDetailPage.jsx    # Real join flow + status handling
│   │   └── WalletPage.jsx              # Real Razorpay deposit + withdrawal flow
│   ├── services/
│   │   ├── adminService.js             # Admin API calls
│   │   ├── api.js                      # Axios instance + JWT interceptor
│   │   ├── authService.js              # Firebase login exchange
│   │   ├── contentService.js           # Games/tournaments fetch + normalization
│   │   ├── firebase.js                 # Firebase client config
│   │   └── paymentService.js           # Razorpay order creation + checkout + verify
│   ├── App.jsx                         # Routes + context providers (Auth, Games)
│   ├── index.css
│   └── main.jsx
│
├── server/                              # Express + Prisma backend
│   ├── config/
│   │   ├── db.js                       # Prisma client
│   │   ├── firebase.js                 # Firebase Admin SDK
│   │   └── razorpay.js                 # Razorpay client instance
│   ├── controllers/
│   │   ├── adminController.js          # Dashboard stats, tournament CRUD, results, withdrawals
│   │   ├── authController.js           # Login, getMe, updateMe, getMyRegistrations
│   │   ├── gamesController.js
│   │   ├── tournamentsController.js    # List/get/join tournaments
│   │   └── walletController.js         # Real deposit order/verify, withdraw, transactions
│   ├── middleware/
│   │   ├── admin.js                    # requireAdmin — checks isAdmin fresh from DB
│   │   └── auth.js                     # JWT verification (protect)
│   ├── prisma/
│   │   ├── schema.prisma               # User (+isAdmin), Game, Tournament, Wallet, etc.
│   │   └── seed.js                     # Seeds 6 games + 10 tournaments
│   ├── routes/
│   │   ├── admin.js                    # All routes require protect + requireAdmin
│   │   ├── auth.js
│   │   ├── games.js
│   │   ├── tournaments.js
│   │   └── wallet.js
│   ├── utils/
│   │   └── apiResponse.js
│   ├── server.js                       # Express app entry — mounts all routers
│   └── .env                            # DB, Firebase, Razorpay secrets (never commit)
│
├── index.html                           # Includes Razorpay Checkout script
├── tailwind.config.js
├── vite.config.js
├── package.json                         # Frontend deps
└── README.md
\`\`\`


---

## 1. Set up Supabase PostgreSQL

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Connection pooling** string (port 6543) → this is your `DATABASE_URL`
4. Copy the **Connection string** (direct, port 5432) → this is your `DIRECT_URL`
5. In `server/`, copy `.env.example` to `.env` and paste both URLs in

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init   # creates all 7 tables in Supabase
npx prisma db seed                   # populates Games + sample Tournaments
npx prisma studio                    # optional — visually browse your tables
```

### The 7 tables created

| Table | Purpose |
|---|---|
| `users` | One row per player — created automatically on first login |
| `games` | Catalog: BGMI, Free Fire, Ludo, etc. |
| `tournaments` | Each tournament — fee, prize, slots, rules, status |
| `registrations` | Join records — who paid to enter which tournament |
| `wallets` | One per user — `depositBalance` (for entry fees) + `winningsBalance` (withdrawable) |
| `transactions` | Ledger of every wallet movement (deposit, entry fee, prize, withdrawal) |
| `withdraw_requests` | Payout requests from winnings to bank/UPI |

---

## 2. Set up Firebase Authentication

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Authentication → Sign-in method** → enable **Google** and **Phone**
3. **Authentication → Settings → Authorized domains** → add `localhost` (and your production domain later)

### Backend credentials (Firebase Admin SDK)
**Project Settings → Service Accounts → Generate New Private Key** (downloads JSON). Copy 3 fields into `server/.env`:
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Frontend credentials (Firebase Web SDK)
**Project Settings → General → Your apps → Web app (`</>`)**. Copy the config into the root `.env`:
```bash
cp .env.example .env   # in project root, not server/
```
Fill in `VITE_FIREBASE_*` values.

> ⚠️ Phone Auth in Firebase requires the project to be on the **Blaze (pay-as-you-go) plan** for production SMS, though it has a free trial quota and works with test phone numbers on Spark too. For development, you can register a test number under **Authentication → Sign-in method → Phone → Phone numbers for testing**.

---

## 3. Authentication Flow (as implemented)

```
User enters mobile number
        ↓
Frontend calls Firebase signInWithPhoneNumber()  → Firebase sends real SMS OTP
        ↓
User enters OTP → Frontend calls confirmationResult.confirm(otp)
        ↓
Firebase verifies OTP, returns a Firebase ID token
        ↓
Frontend POSTs { idToken } → POST /api/auth/firebase-login
        ↓
Backend verifies token via Firebase Admin SDK
        ↓
Backend finds user by firebaseUid, OR creates new User + Wallet row
        ↓
Backend signs its own JWT → returns { token, user, wallet }
        ↓
Frontend stores JWT in localStorage, used for all future API calls
```

Google login follows the same path — `signInWithPopup()` instead of phone OTP — both end up hitting the same `/api/auth/firebase-login` endpoint, since Firebase abstracts the provider difference into one ID token format.

---

## 4. Run everything

### Backend
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev          # → http://localhost:5000
```

### Frontend
```bash
npm install
npm run dev           # → http://localhost:5173
```

Visit `/login`, click **Continue with Google** or enter a mobile number — both create a real row in your Supabase `users` table plus a linked `wallets` row, and issue a JWT stored in `localStorage`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/firebase-login` | – | Exchange Firebase ID token for backend JWT (creates user if new) |
| GET | `/api/auth/me` | ✅ | Get current user + wallet |
| GET | `/api/games` | – | List all games |
| GET | `/api/games/:slug` | – | Game details + its tournaments |
| GET | `/api/tournaments` | – | List tournaments (filter by `?gameId=` slug, `?status=`) |
| GET | `/api/tournaments/:id` | – | Tournament details |
| POST | `/api/tournaments/:id/join` | ✅ | Join — deducts entry fee, creates Registration |
| GET | `/api/wallet/balance` | ✅ | Get deposit + winnings balance |
| POST | `/api/wallet/add` | ✅ | Add money (dev: credits immediately — wire up Razorpay before production) |
| POST | `/api/wallet/withdraw` | ✅ | Request withdrawal from winnings balance |

---

## Next Steps

- [ ] Replace dev-mode instant wallet top-up with real Razorpay/PhonePe order + webhook
- [ ] Admin panel to manage tournaments and process withdraw requests
- [ ] Production Firebase phone auth (Blaze plan, real SMS quota)
- [ ] Rate-limit `/api/auth/firebase-login` and `/api/tournaments/:id/join`

---

## Tech Stack

**Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Firebase Web SDK, react-icons, react-hot-toast
**Backend:** Node.js, Express, Prisma ORM, Supabase PostgreSQL, Firebase Admin SDK, JWT
