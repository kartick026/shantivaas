# Razorpay Integration Setup

The payment integration code is complete. To make it work, follow these steps:

## 1. Install Dependency
Run this command in the `frontend` directory:
```bash
npm install razorpay
```

## 2. Configure Environment Variables
Add your Razorpay credentials to `frontend/.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=your_secret_string
```

> You can get these keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) in Test Mode. The Webhook Secret is defined by you when you create the webhook in Razorpay settings.

## 3. How it Works
1.  **Tenant Dashboard**: A "Pay Now" button appears for unpaid rent cycles.
2.  **Order Creation**: Clicking it calls `/api/razorpay/order` to create an order.
3.  **Checkout**: The Razorpay modal opens (styled with your Lime Green brand color).
4.  **Verification**: After payment, the signature is sent to `/api/razorpay/verify`.
5.  **Record**: If verified, the payment is saved to the `payments` table.
6.  **Automation**: The database trigger automatically updates the Rent Cycle status to `paid`.

## 4. Testing
- Use Razorpay [Test Card Details](https://razorpay.com/docs/payments/payments/test-card-details/) to make a transaction.
- Check the **Tenant Dashboard** to see the status change to "Paid".
- Check the **Admin Dashboard > Payments** to see the new record.

## 5. Webhook Setup (Optional but Recommended)
Webhooks ensure the database is updated even if the user closes the browser immediately after payment.

1.  **Expose Localhost**: Use a tool like [ngrok](https://ngrok.com/) to expose your local server:
    ```bash
    ngrok http 3000
    ```
2.  **Add Webhook in Razorpay**:
    -   Go to **Settings > Webhooks**.
    -   Add New Webhook.
    -   **Webhook URL**: `https://<your-ngrok-url>/api/webhooks/razorpay`
    -   **Secret**: A random string (e.g., `shantitest123`). Add this to your `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
    -   **Active Events**: Select `payment.captured`.
