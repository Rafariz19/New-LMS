import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white shadow-sm focus:ring-secondary',
    outline: 'border border-slate-300 bg-surface hover:bg-slate-50 text-textPrimary focus:ring-primary',
    danger: 'bg-error hover:bg-red-600 text-white shadow-sm focus:ring-error',
    ghost: 'text-textSecondary hover:text-textPrimary hover:bg-slate-100 focus:ring-slate-300',
    success: 'bg-success hover:bg-emerald-600 text-white shadow-sm focus:ring-success',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}
