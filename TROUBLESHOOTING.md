# Troubleshooting Guide

## Login Issues: "Failed to fetch" or "Error sending confirmation email"

If you see these errors when trying to log in, it is likely an issue with the **Email SMTP Configuration** in Supabase, not your code.

### Diagnosis
- You are using `smtp.gmail.com`.
- Gmail blocks third-party apps by default unless you use an **App Password**.
- If Supabase cannot connect to Gmail, it times out, and your frontend shows "Failed to fetch".

### Solution 1: Use Supabase Default Email (Easiest)
For development, you don't need custom SMTP.
1.  Go to **Supabase Dashboard > Authentication > Email**.
2.  **Disable** "Enable Custom SMTP".
3.  Supabase will use its built-in service (limit: 3 emails per hour).
4.  Try logging in again.

### Solution 2: Fix Gmail SMTP (Recommended)
1.  **Enable 2-Step Verification**:
    -   In your Google Account Security page, find "How you sign in to Google".
    -   Turn ON **2-Step Verification**. (Required for App Passwords).
2.  **Generate App Password**:
    -   **Easiest way**: Type "App passwords" in the **search bar** at the top of the page.
    -   If not found, go to *2-Step Verification* > scroll to the bottom > *App passwords*.
3.  **Create Password**:
    -   Select App: "Other (Custom name)" -> Name it "Supabase".
    -   Click **Generate**.
4.  **Update Supabase**:
    -   Copy the 16-character code.
    -   Paste it into Supabase Dashboard > Authentication > Email > SMTP Settings > **Password**.
    -   **CRITICAL**: Ensure the **Sender Email** (at the top of the Email Settings page) matches your **SMTP Username** (your gmail address). Gmail strictly enforces this.


### Solution 3: Check Environment Variables

Visit the debug page to verify your Supabase configuration:
- `http://localhost:3000/debug` (if using port 3000)
- `http://localhost:3001/debug` (if using port 3001)

The debug page will show:
- Your `NEXT_PUBLIC_SUPABASE_URL` (to verify it's set correctly)
- Connection status to Supabase
- Any error details if connection fails

**Note**: The debug page is accessible without login (bypasses authentication).
