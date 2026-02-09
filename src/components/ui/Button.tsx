import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-150 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]
      active:scale-[0.98]
    `;

        const variants = {
            primary: `
        bg-[#F4F4F5] text-[#0A0A0B]
        hover:bg-white
        focus-visible:ring-[#F4F4F5]
      `,
            secondary: `
        bg-[#1A1A1E] text-[#F4F4F5]
        border border-[#27272A]
        hover:bg-[#222226] hover:border-[#3F3F46]
        focus-visible:ring-[#3F3F46]
      `,
            ghost: `
        bg-transparent text-[#A1A1AA]
        hover:bg-[#1A1A1E] hover:text-[#F4F4F5]
        focus-visible:ring-[#3F3F46]
      `,
            danger: `
        bg-[#DC2626] text-white
        hover:bg-[#EF4444]
        focus-visible:ring-[#EF4444]
      `,
        };

        const sizes = {
            sm: 'text-sm px-3 py-1.5 rounded-lg',
            md: 'text-sm px-4 py-2.5 rounded-xl',
            lg: 'text-base px-6 py-3 rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
