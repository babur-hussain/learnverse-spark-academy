
-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brands table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  brand_id UUID REFERENCES public.brands(id),
  category_id UUID REFERENCES public.product_categories(id),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height, unit}
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_digital BOOLEAN NOT NULL DEFAULT false,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  features TEXT[],
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create product images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product variants table (for size, color variations)
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  attributes JSONB, -- {color: "red", size: "large"}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping cart table
CREATE TABLE public.shopping_cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  notes TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB, -- Store product details at time of order
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);

-- Create addresses table
CREATE TABLE public.user_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'shipping', -- shipping, billing
  name TEXT NOT NULL,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory tracking table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_type TEXT, -- 'order', 'return', 'adjustment', 'restock'
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Product categories policies
CREATE POLICY "Everyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL USING (is_admin());

-- Brands policies
CREATE POLICY "Everyone can view active brands" ON public.brands
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage brands" ON public.brands
  FOR ALL USING (is_admin());

-- Products policies
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (is_admin());

-- Product images policies
CREATE POLICY "Everyone can view product images" ON public.product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_images.product_id 
      AND products.is_active = true
    )
  );

CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL USING (is_admin());

-- Product variants policies
CREATE POLICY "Everyone can view active variants" ON public.product_variants
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.is_active = true
    )
  );

CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL USING (is_admin());

-- Shopping cart policies
CREATE POLICY "Users can manage their own cart" ON public.shopping_cart
  FOR ALL USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (is_admin());

-- Product reviews policies
CREATE POLICY "Everyone can view approved reviews" ON public.product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews for their purchases" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews" ON public.product_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (is_admin());

-- User addresses policies
CREATE POLICY "Users can manage their own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Inventory transactions policies
CREATE POLICY "Admins can view inventory transactions" ON public.inventory_transactions
  FOR SELECT USING (is_admin());

CREATE POLICY "System can create inventory transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_products_stock ON public.products(stock_quantity);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_shopping_cart_user ON public.shopping_cart(user_id);
CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON public.product_reviews(user_id);
CREATE INDEX idx_user_addresses_user ON public.user_addresses(user_id);
CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions(product_id);

-- Create functions for order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
BEGIN
  order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update main product stock
  IF NEW.variant_id IS NULL THEN
    UPDATE public.products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  ELSE
    -- Update variant stock
    UPDATE public.product_variants 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.variant_id;
  END IF;
  
  -- Log inventory transaction
  INSERT INTO public.inventory_transactions (
    product_id, 
    variant_id, 
    type, 
    quantity, 
    previous_stock, 
    new_stock, 
    reference_type, 
    reference_id
  ) VALUES (
    NEW.product_id,
    NEW.variant_id,
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

CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Create function to calculate product ratings
CREATE OR REPLACE FUNCTION calculate_product_rating(product_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT ROUND(AVG(rating)::DECIMAL, 2) INTO avg_rating
  FROM public.product_reviews 
  WHERE product_id = product_uuid AND is_approved = true;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get product with ratings and reviews count
CREATE OR REPLACE FUNCTION get_products_with_stats()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  original_price DECIMAL,
  currency TEXT,
  stock_quantity INTEGER,
  is_active BOOLEAN,
  is_featured BOOLEAN,
  category_name TEXT,
  brand_name TEXT,
  primary_image_url TEXT,
  rating DECIMAL,
  review_count BIGINT,
  features TEXT[],
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.currency,
    p.stock_quantity,
    p.is_active,
    p.is_featured,
    pc.name as category_name,
    b.name as brand_name,
    pi.image_url as primary_image_url,
    calculate_product_rating(p.id) as rating,
    COUNT(pr.id) as review_count,
    p.features,
    p.tags
  FROM public.products p
  LEFT JOIN public.product_categories pc ON p.category_id = pc.id
  LEFT JOIN public.brands b ON p.brand_id = b.id
  LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
  LEFT JOIN public.product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
  WHERE p.is_active = true
  GROUP BY p.id, pc.name, b.name, pi.image_url
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO public.product_categories (name, description, slug, icon, order_index) VALUES
('Notebooks & Journals', 'High-quality notebooks and journals for writing and note-taking', 'notebooks-journals', 'Book', 1),
('Pens & Pencils', 'Writing instruments including pens, pencils, and markers', 'pens-pencils', 'PenTool', 2),
('Calculators', 'Scientific and basic calculators for students and professionals', 'calculators', 'Calculator', 3),
('Art Supplies', 'Creative supplies for drawing, painting, and crafting', 'art-supplies', 'Palette', 4),
('Office Supplies', 'Essential office items and organizational tools', 'office-supplies', 'Briefcase', 5),
('School Essentials', 'Back-to-school supplies and student essentials', 'school-essentials', 'GraduationCap', 6);

INSERT INTO public.brands (name, description) VALUES
('Moleskine', 'Premium notebooks and planners'),
('Parker', 'Luxury writing instruments'),
('Pilot', 'Quality pens and markers'),
('Faber-Castell', 'Professional art supplies'),
('Staedtler', 'Engineering and writing tools'),
('Casio', 'Electronic calculators and accessories'),
('Post-it', 'Sticky notes and office supplies'),
('Rhodia', 'French-made notebooks and pads');
