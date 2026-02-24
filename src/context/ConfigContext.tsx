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

    return (
        <ConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
