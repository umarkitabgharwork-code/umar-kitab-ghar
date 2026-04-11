-- Custom upload-list orders: distinguish from standard / course orders in admin and API
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type text;
