-- ============================================================================
-- Migration 013: Delivery orders table
-- ============================================================================
-- Stores individual delivery orders parsed from NYP Service Report Excel files.
-- Used for "Longest Wait Times" modal on the dashboard.
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
  date DATE NOT NULL,
  order_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  waiting_time_mins NUMERIC(6,1) NOT NULL,
  order_placed TIMESTAMPTZ,
  completed TIMESTAMPTZ,
  driver_name TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT delivery_orders_unique UNIQUE (restaurant_id, order_number, date)
);

-- Enable RLS
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;

-- Index for fast top-N queries per restaurant per month
CREATE INDEX idx_delivery_orders_restaurant_date_wait
  ON delivery_orders (restaurant_id, date, waiting_time_mins DESC);

-- SELECT: users can read delivery orders for their restaurants
CREATE POLICY "Users can view delivery_orders for their restaurants"
  ON delivery_orders FOR SELECT
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- INSERT: users can insert delivery orders for their restaurants
CREATE POLICY "Users can insert delivery_orders for their restaurants"
  ON delivery_orders FOR INSERT
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- UPDATE: users can update delivery orders for their restaurants
CREATE POLICY "Users can update their delivery_orders"
  ON delivery_orders FOR UPDATE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  )
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- DELETE: users can delete delivery orders for their restaurants
CREATE POLICY "Users can delete their delivery_orders"
  ON delivery_orders FOR DELETE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );
