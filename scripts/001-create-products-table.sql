-- Create products table to store digital products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Added user_id to associate products with authenticated users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  product_url TEXT NOT NULL,
  payment_address VARCHAR(255) NOT NULL,
  price_usdc DECIMAL(18, 6) NOT NULL,
  creator_name VARCHAR(255),
  creator_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
-- Added index on user_id for filtering user's products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all products
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

-- Policy: Users can insert their own products
CREATE POLICY "Users can insert their own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own products
CREATE POLICY "Users can update their own products" 
  ON products FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own products
CREATE POLICY "Users can delete their own products" 
  ON products FOR DELETE 
  USING (auth.uid() = user_id);
