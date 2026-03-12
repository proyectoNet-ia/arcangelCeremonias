-- Migration to add size guide to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS size_guide_url TEXT;

-- Update existing rows (optional, just to ensure null is consistent)
-- UPDATE categories SET size_guide_url = NULL WHERE size_guide_url IS NULL;
