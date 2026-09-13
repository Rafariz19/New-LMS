import React from 'react';

export function Card({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <div
      className={`bg-surface rounded-xl border border-slate-200/80 shadow-card ${
        hoverEffect ? 'hover:shadow-floating hover:border-slate-300 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-textPrimary tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-textSecondary mt-1 ${className}`}>{children}</p>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`p-4 sm:p-6 bg-slate-50/60 rounded-b-xl border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
}

export default Card;
