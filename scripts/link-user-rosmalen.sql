-- Link user to Rosmalen restaurant
INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
VALUES (
  '9d4b271e-ab6b-4379-bff5-e8db899756e1',
  'rosmalen',
  'owner',
  'Damian Gans'
);

-- Verify the user profile was created
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
WHERE up.user_id = '9d4b271e-ab6b-4379-bff5-e8db899756e1';
