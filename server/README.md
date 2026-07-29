# Razorpay Example Server

This small Express server demonstrates creating Razorpay orders for the frontend.

Setup

1. Copy `.env.example` to `.env` and fill `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start server:

```bash
npm run dev
# or
npm start
```

Endpoint

- `POST /api/razorpay/create-order`
  - Request JSON: `{ amount: <number_in_paisa>, currency?: 'INR', receipt?: string }`
  - Response JSON: `{ orderId: 'order_XXX', order: { ... } }`

Use this `VITE_RAZORPAY_ORDER_URL` in the frontend to point to this server, e.g. `http://localhost:4000/api/razorpay/create-order`.
