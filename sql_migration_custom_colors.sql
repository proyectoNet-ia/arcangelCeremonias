-- Migration to add dynamic color configuration in site_config
ALTER TABLE IF EXISTS public.site_config 
ADD COLUMN IF NOT EXISTS ensamblex_colors JSONB DEFAULT NULL;
