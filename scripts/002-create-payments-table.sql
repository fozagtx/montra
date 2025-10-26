-- Create payments table to track all payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(255) UNIQUE NOT NULL,
  buyer_address VARCHAR(255) NOT NULL,
  amount_usdc DECIMAL(18, 6) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  buyer_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payments_product_id ON payments(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view payments (for transparency)
CREATE POLICY "Payments are viewable by everyone" 
  ON payments FOR SELECT 
  USING (true);

-- Policy: Anyone can insert payments (buyers need to record their purchase)
CREATE POLICY "Anyone can insert payments" 
  ON payments FOR INSERT 
  WITH CHECK (true);
