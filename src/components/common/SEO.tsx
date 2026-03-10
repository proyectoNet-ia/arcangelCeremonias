import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    article?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, article }) => {
    const { pathname } = useLocation();

    // Configuración base (Personaliza según el dominio real)
    const siteName = "Arcángel Ceremonias";
    const defaultDescription = "Piezas artesanales de alta calidad para ceremonias religiosas: bautizos, comuniones, confirmaciones y más. Tradición y elegancia en cada detalle.";
    const baseUrl = window.location.origin;
    const defaultImage = `${baseUrl}/og-image.jpg`; // Asegúrate de que esta imagen exista en public/

    useEffect(() => {
        // 1. Título
        const seoTitle = title ? `${title} | ${siteName}` : siteName;
        document.title = seoTitle;

        // 2. Meta Descripción
        const seoDescription = description || defaultDescription;
        updateMetaTag('description', seoDescription);
        updateMetaTag('og:description', seoDescription);
        updateMetaTag('twitter:description', seoDescription);

        // 3. OpenGraph / Twitter Title
        updateMetaTag('og:title', seoTitle);
        updateMetaTag('twitter:title', seoTitle);

        // 4. URL
        const canonicalUrl = `${baseUrl}${pathname}`;
        updateMetaTag('og:url', canonicalUrl);

        // 5. Tipo
        updateMetaTag('og:type', article ? 'article' : 'website');

        // 6. Imagen
        const seoImage = image || defaultImage;
        updateMetaTag('og:image', seoImage);
        updateMetaTag('twitter:image', seoImage);
        updateMetaTag('twitter:card', 'summary_large_image');

    }, [title, description, image, article, pathname, baseUrl]);

    // Función auxiliar para actualizar meta tags
    const updateMetaTag = (name: string, content: string) => {
        if (!content) return;

        // Buscar por name o property (Facebook usa property, Twitter usa name)
        let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

        if (!element) {
            element = document.createElement('meta');
            if (name.startsWith('og:')) {
                element.setAttribute('property', name);
            } else {
                element.setAttribute('name', name);
            }
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    };

    return null; // Componente invisible
};
