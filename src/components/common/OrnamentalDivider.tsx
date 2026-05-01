import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiamond } from '@fortawesome/free-solid-svg-icons';

interface OrnamentalDividerProps {
    className?: string;
    light?: boolean;
}

export const OrnamentalDivider: React.FC<OrnamentalDividerProps> = ({ className = '', light = false }) => {
    return (
        <div className={`w-full flex items-center justify-center py-8 ${className}`}>
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '100%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-gold flex-grow max-w-[400px]`}
            />
            
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative flex items-center justify-center w-12 h-8 shrink-0 mx-4"
            >
                {/* Diagonal Diamonds Arrangement */}
                <FontAwesomeIcon 
                    icon={faDiamond} 
                    className="absolute top-0 right-3 text-[6px] text-chocolate/60" 
                />
                <FontAwesomeIcon 
                    icon={faDiamond} 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-gold" 
                />
                <FontAwesomeIcon 
                    icon={faDiamond} 
                    className="absolute bottom-0 left-3 text-[6px] text-chocolate/60" 
                />
            </motion.div>

            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '100%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`h-[1px] bg-gradient-to-l from-transparent via-gold/40 to-gold flex-grow max-w-[400px]`}
            />
        </div>
    );
};
