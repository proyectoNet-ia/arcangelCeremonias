-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_company TEXT,
    user_phone TEXT NOT NULL,
    user_email TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    pdf_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 11),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Policies for quotes
-- Allow anyone to insert a quote
DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;
CREATE POLICY "Anyone can insert quotes" ON public.quotes
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) to read and update quotes
DROP POLICY IF EXISTS "Admins can view quotes" ON public.quotes;
CREATE POLICY "Admins can view quotes" ON public.quotes
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can update quotes" ON public.quotes;
CREATE POLICY "Admins can update quotes" ON public.quotes
    FOR UPDATE TO authenticated USING (true);

-- Policies for quote_items
DROP POLICY IF EXISTS "Anyone can insert quote items" ON public.quote_items;
CREATE POLICY "Anyone can insert quote items" ON public.quote_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view quote items" ON public.quote_items;
CREATE POLICY "Admins can view quote items" ON public.quote_items
    FOR SELECT TO authenticated USING (true);

-- Create updated_at trigger for quotes
CREATE OR REPLACE FUNCTION update_quotes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE PROCEDURE update_quotes_updated_at_column();

-- Setup Storage for PDFs
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes_pdfs', 'quotes_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for quotes_pdfs bucket
-- Allow public uploads
DROP POLICY IF EXISTS "quotes_pdfs_public_upload" ON storage.objects;
CREATE POLICY "quotes_pdfs_public_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'quotes_pdfs'
    );

-- Allow public read access
DROP POLICY IF EXISTS "quotes_pdfs_public_read" ON storage.objects;
CREATE POLICY "quotes_pdfs_public_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'quotes_pdfs'
    );

-- Allow admins to delete
DROP POLICY IF EXISTS "quotes_pdfs_admin_delete" ON storage.objects;
CREATE POLICY "quotes_pdfs_admin_delete" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'quotes_pdfs'
    );

