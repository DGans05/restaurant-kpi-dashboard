-- ============================================================================
-- Create First User - Manual SQL Approach
-- ============================================================================
-- Run this in Supabase SQL Editor after getting the user_id from Auth dashboard
-- ============================================================================

-- Step 1: Create auth user via Supabase Dashboard UI:
--   Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/auth/users
--   Click: "Add user" → "Create new user"
--   Email: damian.gans@outlook.com
--   Password: (your secure password)
--   Auto Confirm User: ✅ YES
--   Click: "Create user"
--   Copy the User UID from the list

-- Step 2: After creating the user in the dashboard, run this SQL:
-- Replace 'PASTE_USER_ID_HERE' with the actual UUID from Step 1

INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
VALUES (
  'PASTE_USER_ID_HERE',  -- Replace with actual user_id from auth.users
  'rosmalen',
  'owner',
  'Damian Gans'
);

-- Step 3: Verify the user profile was created:
SELECT
  up.user_id,
  up.restaurant_id,
  up.role,
  up.display_name,
  au.email,
  r.name as restaurant_name
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
JOIN restaurants r ON r.id = up.restaurant_id
WHERE up.restaurant_id = 'rosmalen';

-- You should see:
-- user_id: (UUID)
-- restaurant_id: rosmalen
-- role: owner
-- display_name: Damian Gans
-- email: damian.gans@outlook.com
-- restaurant_name: New York Pizza Rosmalen

-- ============================================================================
-- Alternative: Create user entirely via SQL (if you prefer)
-- ============================================================================

-- Note: This requires the pgcrypto extension which should already be enabled
-- Uncomment and modify if you want to create the user entirely via SQL:

/*
-- Generate a new user ID
DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'damian.gans@outlook.com';
  user_password TEXT := 'YOUR_SECURE_PASSWORD_HERE';  -- Replace this!
BEGIN
  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create the user profile
  INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
  VALUES (
    new_user_id,
    'rosmalen',
    'owner',
    'Damian Gans'
  );

  RAISE NOTICE 'User created with ID: %', new_user_id;
END $$;
*/
