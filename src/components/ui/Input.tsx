import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[#A1A1AA] mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-xl',
                        'bg-[#1A1A1E]',
                        'border border-[#27272A]',
                        'text-[#F4F4F5]',
                        'placeholder:text-[#52525B]',
                        'transition-all duration-150',
                        'focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8]',
                        error && 'border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]',
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p className={cn(
                        'mt-2 text-sm',
                        error ? 'text-[#F87171]' : 'text-[#71717A]'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
