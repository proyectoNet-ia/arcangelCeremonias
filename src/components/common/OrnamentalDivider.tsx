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
        <div className={`w-full flex items-center justify-center gap-4 md:gap-8 ${className}`}>
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '100%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-[1px] md:h-[1.5px] bg-gradient-to-r from-transparent ${light ? 'via-gold/20' : 'via-gold'} to-transparent flex-grow`}
            />
            
            <motion.div 
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 45 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center gap-2 md:gap-3 shrink-0"
            >
                <FontAwesomeIcon icon={faDiamond} className={`text-[6px] md:text-[8px] ${light ? 'text-gold/20' : 'text-gold/30'}`} />
                <FontAwesomeIcon icon={faDiamond} className={`text-[10px] md:text-[14px] ${light ? 'text-gold/40' : 'text-gold'} shadow-sm`} />
                <FontAwesomeIcon icon={faDiamond} className={`text-[6px] md:text-[8px] ${light ? 'text-gold/20' : 'text-gold/30'}`} />
            </motion.div>

            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '100%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-[1px] md:h-[1.5px] bg-gradient-to-l from-transparent ${light ? 'via-gold/20' : 'via-gold'} to-transparent flex-grow`}
            />
        </div>
    );
};
