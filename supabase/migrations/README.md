# Van Basket - Database Administration & Migration Guide

This directory contains the database migration scripts and administration tools for **Van Basket**.

## 🚀 Quick Setup Instructions (Production-Ready Database)

### Step 1: Initialize Database Schema
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy the entire contents of [`01_production_schema.sql`](file:///c:/Users/Vishal/Desktop/Van%20Basket/supabase/migrations/01_production_schema.sql).
4. Click **Run**. This sets up all tables, indexes, triggers, Row Level Security (RLS) policies, initial product catalog, and helper functions.

---

### Step 2: Reset Database / Wiping Test Data
Whenever you want to wipe test data (test orders, test users, test queries, etc.) and reset to a clean production state:
1. Open **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of [`02_reset_database.sql`](file:///c:/Users/Vishal/Desktop/Van%20Basket/supabase/migrations/02_reset_database.sql).
3. Click **Run**.
   - **Wiped**: All test orders, order items, payments, contact queries, user addresses, password reset tokens, and test non-admin user accounts (`auth.users` & `profiles`).
   - **Preserved**: Retains active product catalog, coupons, and all Admin profiles.

---

## 🔐 Creating New Admin Accounts Directly from Supabase Dashboard

You can manually add a new Administrator at any time directly using the SQL Editor in Supabase without needing code:

```sql
SELECT public.create_new_admin(
    'newadmin@vanbasket.com',      -- Admin Email Address
    'YourSecurePassword123!',       -- Admin Password
    'New Admin Name',               -- Admin Full Name
    '+919876543210'                -- Phone Number (Optional)
);
```

### How `create_new_admin` Works:
- Uses PostgreSQL `pgcrypto` (`gen_salt('bf')`) to securely hash the password using standard bcrypt format matching Supabase Auth.
- Automatically creates the user entry in `auth.users` with confirmed email status.
- Automatically creates/upserts the profile row in `public.profiles` with `role = 'admin'`.

---

## 🛡️ Role-Based Access Control Summary
- **User Signup**: Any user signing up via the website automatically gets `role = 'user'`.
- **Admin Isolation**: Admin email addresses are blocked from regular user signups.
- **Login Enforcement**:
  - `user` accounts attempting to log into `/admin` are denied and redirected.
  - `admin` accounts attempting to log in via customer `/login` are blocked with an explicit notice.
