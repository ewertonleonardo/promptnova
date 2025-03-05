import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500': variant === 'secondary',
          'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500': variant === 'outline',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-5 py-2.5 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}