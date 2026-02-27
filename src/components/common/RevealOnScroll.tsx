import React from 'react';
import { motion } from 'framer-motion';

interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    distance?: number;
    style?: React.CSSProperties;
}

export const RevealOnScroll = React.forwardRef<HTMLDivElement, RevealOnScrollProps>(({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    duration = 0.8,
    distance = 30,
    style = {}
}, ref) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            className={`relative ${className}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={variants}
            style={style}
        >
            {children}
        </motion.div>
    );
});
