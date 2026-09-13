import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text = 'Memuat data...', fullScreen = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${sizes[size]} text-primary animate-spin mb-3`} />
      {text && <p className="text-sm font-medium text-textSecondary">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

export function TableSkeleton({ rows = 4, cols = 4 }) {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      <div className="h-9 bg-slate-200/70 rounded-lg"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-slate-100 rounded-md flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
