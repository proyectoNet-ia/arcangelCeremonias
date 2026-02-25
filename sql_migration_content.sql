-- Migración: Añadir campos de página "Nosotros" a site_config
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS about_title      TEXT DEFAULT 'Más de 30 años de tradición',
  ADD COLUMN IF NOT EXISTS about_subtitle   TEXT DEFAULT 'Nuestra Historia',
  ADD COLUMN IF NOT EXISTS about_quote      TEXT DEFAULT 'Nuestra misión es ser líderes en la fabricación y manufactura de productos ceremoniales para las nuevas generaciones.',
  ADD COLUMN IF NOT EXISTS about_body_1     TEXT DEFAULT 'Con más de tres décadas en el ramo textil, en Arcángel Ceremonias nos dedicamos a satisfacer las necesidades de nuestros clientes con la más alta calidad y un precio justo.',
  ADD COLUMN IF NOT EXISTS about_body_2     TEXT DEFAULT 'Creemos firmemente en el comercio justo y en la vocación de servir a nuestros clientes con valores fundamentales: calidad, honradez, amabilidad y especial atención a los detalles.',
  ADD COLUMN IF NOT EXISTS about_body_3     TEXT DEFAULT 'Cada pieza que sale de nuestro taller lleva consigo el compromiso de honrar los momentos más importantes de las familias, vistiendo de elegancia y significado cada ceremonia.',
  ADD COLUMN IF NOT EXISTS about_image_url  TEXT DEFAULT '/catalog/portrait-child-getting-ready-their-first-communion.jpg',
  ADD COLUMN IF NOT EXISTS about_stat_1_value TEXT DEFAULT '30+',
  ADD COLUMN IF NOT EXISTS about_stat_1_label TEXT DEFAULT 'Años de Experiencia',
  ADD COLUMN IF NOT EXISTS about_stat_2_value TEXT DEFAULT '500k+',
  ADD COLUMN IF NOT EXISTS about_stat_2_label TEXT DEFAULT 'Prendas Creadas',
  ADD COLUMN IF NOT EXISTS about_stat_3_value TEXT DEFAULT '150+',
  ADD COLUMN IF NOT EXISTS about_stat_3_label TEXT DEFAULT 'Puntos de Venta',
  ADD COLUMN IF NOT EXISTS about_stat_4_value TEXT DEFAULT '100%',
  ADD COLUMN IF NOT EXISTS about_stat_4_label TEXT DEFAULT 'Calidad Artesanal';

-- También para el banner secundario de Home (CTA Mayoreo)
ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS cta_banner_title       TEXT DEFAULT 'Venta al por mayor',
  ADD COLUMN IF NOT EXISTS cta_banner_subtitle     TEXT DEFAULT '& Boutiques',
  ADD COLUMN IF NOT EXISTS cta_banner_tag          TEXT DEFAULT 'Socios Comerciales',
  ADD COLUMN IF NOT EXISTS cta_banner_body         TEXT DEFAULT 'Abastecemos a las mejores boutiques de México con diseños exclusivos y calidad artesanal. Solicita nuestro catálogo de precios para negocios.',
  ADD COLUMN IF NOT EXISTS cta_banner_btn1_label   TEXT DEFAULT 'Catálogo Mayoreo',
  ADD COLUMN IF NOT EXISTS cta_banner_btn2_label   TEXT DEFAULT 'Línea de Negocios';

SELECT column_name FROM information_schema.columns
WHERE table_name = 'site_config' ORDER BY ordinal_position;
