# Supabase Authentication Setup Guide

This guide provides the steps to configure Google and GitHub authentication for your CodeHive application. The application code is already set up to work with Supabase; you just need to configure the credentials in your Supabase project dashboard.

## Prerequisites

1.  You have a Supabase project created.
2.  You have already set your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the `.env` file.

---

## Step 1: Configure OAuth Providers

You will need to get a **Client ID** and **Client Secret** from both Google and GitHub.

### A. Configuring GitHub OAuth

1.  **Go to GitHub and Create an OAuth App:**
    *   Navigate to **Settings** > **Developer settings** > **OAuth Apps**.
    *   Click **"New OAuth App"**.
    *   **Application name:** `CodeHive` (or your preferred name).
    *   **Homepage URL:** Your application's URL (e.g., `http://localhost:9002` for local development or your production URL).
    *   **Authorization callback URL:** This is the most important part. Paste your Supabase callback URL here. It looks like this:
        ```
        https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
        ```
        *(Replace `<YOUR_PROJECT_REF>` with your actual Supabase project reference ID from your project's URL)*.

2.  **Get Your GitHub Credentials:**
    *   After creating the app, you will see the **Client ID**.
    *   Click **"Generate a new client secret"** to get your **Client Secret**. Copy it immediately, as you won't be able to see it again.

3.  **Add Credentials to Supabase:**
    *   In your Supabase project dashboard, go to **Authentication** > **Providers**.
    *   Find **GitHub** and expand it.
    *   Make sure **"Enable GitHub provider"** is turned on.
    *   Paste the **Client ID** and **Client Secret** you got from GitHub into the respective fields.
    *   Click **Save**.

---

### B. Configuring Google OAuth

1.  **Go to Google Cloud Console:**
    *   Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Go to **APIs & Services** > **Credentials**.
    *   Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**.
    *   **Application type:** Select **"Web application"**.
    *   **Name:** `CodeHive Web Client` (or a name you prefer).

2.  **Configure Redirect URIs:**
    *   Under **"Authorized redirect URIs"**, click **"+ ADD URI"**.
    *   Paste your Supabase callback URL here:
        ```
        https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
        ```
    *   Click **Create**.

3.  **Get Your Google Credentials:**
    *   A dialog will appear showing your **Client ID** and **Client Secret**. Copy both of these.

4.  **Add Credentials to Supabase:**
    *   In your Supabase project dashboard, go to **Authentication** > **Providers**.
    *   Find **Google** and expand it.
    *   Make sure **"Enable Google provider"** is turned on.
    *   Paste the **Client ID** and **Client Secret** you got from Google Cloud into the respective fields.
    *   Click **Save**.

---

## Step 2: Test the Login

Your application is now fully configured. Run the app and try signing in with both Google and GitHub. It should redirect you to the provider, ask for authorization, and then redirect you back to your application's dashboard page upon a successful login.
