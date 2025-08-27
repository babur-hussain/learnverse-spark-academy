-- Create necessary tables for complete e-commerce functionality

-- Add seller_id to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create seller_applications table
CREATE TABLE IF NOT EXISTS public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_address JSONB NOT NULL,
  business_registration_number TEXT,
  business_documents JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
BEGIN
  order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create function to update stock after order
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update main product stock
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Log inventory transaction
  INSERT INTO public.inventory_transactions (
    product_id, 
    type, 
    quantity, 
    previous_stock, 
    new_stock, 
    reference_type, 
    reference_id
  ) VALUES (
    NEW.product_id,
    'out',
    NEW.quantity,
    COALESCE((SELECT stock_quantity FROM public.products WHERE id = NEW.product_id), 0) + NEW.quantity,
    COALESCE((SELECT stock_quantity FROM public.products WHERE id = NEW.product_id), 0),
    'order',
    NEW.order_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
DROP TRIGGER IF EXISTS update_stock_trigger ON public.order_items;
CREATE TRIGGER update_stock_trigger
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Add updated_at trigger to orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;
CREATE POLICY "Sellers can view orders for their products" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    )
  );

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view order items from their orders" ON public.order_items;
CREATE POLICY "Users can view order items from their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = order_items.product_id AND p.seller_id = auth.uid()
    )
  );

-- RLS Policies for seller_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.seller_applications;
CREATE POLICY "Users can view their own applications" ON public.seller_applications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own applications" ON public.seller_applications;
CREATE POLICY "Users can create their own applications" ON public.seller_applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all applications" ON public.seller_applications;
CREATE POLICY "Admins can manage all applications" ON public.seller_applications
  FOR ALL USING (is_admin());

-- RLS Policies for inventory_transactions
DROP POLICY IF EXISTS "Sellers can view their product transactions" ON public.inventory_transactions;
CREATE POLICY "Sellers can view their product transactions" ON public.inventory_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = inventory_transactions.product_id AND p.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.inventory_transactions;
CREATE POLICY "Admins can manage all transactions" ON public.inventory_transactions
  FOR ALL USING (is_admin());

-- Update products table RLS to allow sellers to manage their products
DROP POLICY IF EXISTS "Sellers can manage their own products" ON public.products;
CREATE POLICY "Sellers can manage their own products" ON public.products
  FOR ALL USING (seller_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id ON public.seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON public.seller_applications(status);