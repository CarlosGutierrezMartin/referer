import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'rounded-2xl transition-all duration-150';

        const variants = {
            default: `
        bg-[#141416]
        border border-[#27272A]
      `,
            elevated: `
        bg-[#141416]
        border border-[#27272A]
        shadow-lg shadow-black/20
      `,
            outlined: `
        bg-transparent
        border border-[#27272A]
        hover:border-[#3F3F46]
      `,
            ghost: `
        bg-[#1A1A1E]
      `,
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Subcomponents
interface CardSubProps {
    children: ReactNode;
    className?: string;
}

function CardHeader({ children, className }: CardSubProps) {
    return <div className={cn('', className)}>{children}</div>;
}

function CardTitle({ children, className }: CardSubProps) {
    return (
        <h3 className={cn('text-xl font-semibold text-[#F4F4F5] tracking-tight', className)}>
            {children}
        </h3>
    );
}

function CardDescription({ children, className }: CardSubProps) {
    return (
        <p className={cn('text-sm text-[#A1A1AA] mt-1', className)}>
            {children}
        </p>
    );
}

function CardContent({ children, className }: CardSubProps) {
    return <div className={cn('', className)}>{children}</div>;
}

function CardFooter({ children, className }: CardSubProps) {
    return (
        <div className={cn('flex items-center gap-3 pt-4 border-t border-[#27272A]', className)}>
            {children}
        </div>
    );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
