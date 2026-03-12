import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClass = "relative overflow-hidden bg-chocolate/5 animate-pulse";
    const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'h-3 rounded' : 'rounded-none';

    return (
        <div className={`${baseClass} ${variantClass} ${className}`}>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
    );
};

export const ProductSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-3 px-1">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2 opacity-60" />
            <Skeleton variant="text" className="w-1/4 pt-2" />
        </div>
    </div>
);

export const ProductDetailSkeleton = () => (
    <div className="min-h-screen bg-cream">
        <div className="h-20 bg-white border-b border-gold/10" />
        <div className="pt-24 md:pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-12 xl:col-span-7">
                <Skeleton className="w-full h-[500px] md:h-[800px] lg:h-[950px]" />
            </div>
            <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                <div className="space-y-4">
                    <Skeleton variant="text" className="w-1/4" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-[2px] w-16" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-4 pt-8">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    </div>
);
