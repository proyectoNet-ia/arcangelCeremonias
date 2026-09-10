-- Migration to support TXT file storage and order consecutive numbers for Ensamblex
ALTER TABLE IF EXISTS public.quotes 
ADD COLUMN IF NOT EXISTS txt_url TEXT,
ADD COLUMN IF NOT EXISTS order_number TEXT;
