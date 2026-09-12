# LLY Bank

A banking REST API built on the [NIBSS sandbox](https://nibssbyphoenix.onrender.com). It handles account creation with KYC (BVN/NIN) verification, JWT authentication, intrabank and interbank transfers, balance retrieval, and transaction status lookups.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (`jsonwebtoken`) with bcrypt password hashing

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

The server starts with `node --watch` for auto-reload during development.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | yes | Server port |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret for signing tokens (min 32 chars) |
| `NIBSS_API_KEY` | yes | NIBSS sandbox API key |
| `NIBSS_API_SECRET` | yes | NIBSS sandbox API secret |
| `BANK_CODE` | yes | Bank code |
| `BANK_NAME` | yes | Bank name |
| `ADMIN_EMAIL` | no | Email that receives the `admin` role at login |

## API Reference

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header, obtained from `POST /auth/login`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | no | Health check |
| `POST` | `/api/accounts` | no | Create an account (KYC via BVN or NIN) |
| `POST` | `/api/auth/login` | no | Login, returns a JWT |
| `GET` | `/api/accounts/balance` | customer | Get account balance |
| `POST` | `/api/transfers` | customer | Initiate a transfer |
| `GET` | `/api/transactions/:id` | customer | Get transaction status |
| `POST` | `/api/admin/bvn` | admin | Insert a BVN record |
| `POST` | `/api/admin/nin` | admin | Insert a NIN record |

### Create Account

```http
POST /api/accounts
Content-Type: application/json

{
  "email": "user@example.com",
  "dob": "2000-01-01",
  "bvn": "22212345678",
  "password": "secret"
}
```

`bvn` and `nin` are both optional, but exactly one must be provided. The KYC record is verified against NIBSS, and the account is created on both NIBSS and locally.

### Initiate Transfer

```http
POST /api/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "1087207670",
  "amount": 80000
}
```

The sender's account number is derived from the JWT, so you can only transfer from your own account. The recipient is verified via name enquiry before the transfer is initiated.

```json
{
  "message": "Transfer successful",
  "transaction": {
    "referenceId": "TX1776340463722",
    "amount": 80000,
    "sender": "1084071287",
    "recipient": "1087207670",
    "recipientName": "JANE DOE"
  },
  "status": "SUCCESS"
}
```

## Project Structure

```
api/
├── app.js              # express app
├── server.js           # entry point
├── clients/            # external API clients (nibss)
├── config/             # env + nibss config
├── controllers/        # request handlers
├── middleware/         # auth, validators, error handler
├── models/             # mongoose models
├── routes/             # route definitions
├── services/           # business logic
└── utils/              # jwt, errors
```

## Roles

Accounts with the email matching `ADMIN_EMAIL` are issued an `admin` role token at login; everyone else gets `customer`. Admin-only routes reject customer tokens.
