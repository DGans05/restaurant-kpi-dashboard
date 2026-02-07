/**
 * Configuration for NYP store restaurants
 * Maps our internal restaurant IDs to their NYP store credentials
 */

export interface NypRestaurantConfig {
  restaurantId: string;  // Our internal ID (e.g., "rosmalen")
  nypUsername: string;   // Environment variable name for username
  nypPassword: string;   // Environment variable name for password
}

/**
 * List of restaurants with NYP store access
 * Add more restaurants here as needed
 */
export const NYP_RESTAURANT_CONFIGS: NypRestaurantConfig[] = [
  {
    restaurantId: 'rosmalen',
    nypUsername: 'NYP_STORE_USERNAME_ROSMALEN',
    nypPassword: 'NYP_STORE_PASSWORD_ROSMALEN',
  },
  // Add more restaurants here:
  // {
  //   restaurantId: 'amsterdam',
  //   nypUsername: 'NYP_STORE_USERNAME_AMSTERDAM',
  //   nypPassword: 'NYP_STORE_PASSWORD_AMSTERDAM',
  // },
];
