import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { configService, SiteConfig } from '@/services/configService';
import { EnsamblexColor, DEFAULT_OFFICIAL_COLORS, getDynamicColorMap, getEnsamblexColorCode } from '@/constants/ensamblexColors';

interface ConfigContextType {
    config: SiteConfig | null;
    loading: boolean;
    refresh: () => Promise<void>;
    colors: EnsamblexColor[];
    colorMap: Record<string, string>;
    getColorHex: (colorName?: string) => string;
    getColorCode: (colorName?: string) => string;
}

const ConfigContext = createContext<ConfigContextType>({
    config: null,
    loading: true,
    refresh: async () => { },
    colors: DEFAULT_OFFICIAL_COLORS,
    colorMap: getDynamicColorMap(),
    getColorHex: () => '#5B84B1',
    getColorCode: () => 'BC'
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            if (!config) setLoading(true);
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

    const colors = useMemo<EnsamblexColor[]>(() => {
        return config?.ensamblex_colors && config.ensamblex_colors.length > 0 
            ? config.ensamblex_colors 
            : DEFAULT_OFFICIAL_COLORS;
    }, [config?.ensamblex_colors]);

    const colorMap = useMemo(() => {
        return getDynamicColorMap(colors);
    }, [colors]);

    const getColorHex = (colorName?: string): string => {
        if (!colorName) return '#E5E7EB';
        const clean = colorName.toLowerCase().trim();
        return colorMap[clean] || '#5B84B1';
    };

    const getColorCode = (colorName?: string): string => {
        return getEnsamblexColorCode(colorName, colors);
    };

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
        }
    }, [config]);

    return (
        <ConfigContext.Provider value={{
            config,
            loading,
            refresh: fetchConfig,
            colors,
            colorMap,
            getColorHex,
            getColorCode
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
