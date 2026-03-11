import React, { createContext, useContext, useEffect, useState } from 'react';
import { configService, SiteConfig } from '@/services/configService';

interface ConfigContextType {
    config: SiteConfig | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType>({
    config: null,
    loading: true,
    refresh: async () => { }
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await configService.getConfig();
            if (data) setConfig(data);
        } catch (error) {
            console.error('Error in ConfigProvider:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (config) {
            const root = document.documentElement;
            if (config.primary_color) root.style.setProperty('--color-primary', config.primary_color);
            if (config.secondary_color) root.style.setProperty('--color-secondary', config.secondary_color);
            if (config.accent_color) root.style.setProperty('--color-accent', config.accent_color);

            // Update Favicon
            if (config.favicon_url) {
                let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = config.favicon_url;
            }

            // Also set derived colors if needed, or just let Tailwind handle it via CSS variables
        }
    }, [config]);

    return (
        <ConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
