import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'Belum ada data',
  description = 'Data tidak ditemukan atau belum ditambahkan.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 bg-surface/50 ${className}`}>
      <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400 mb-4 shadow-subtle">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-textPrimary mb-1">{title}</h4>
      <p className="text-sm text-textSecondary max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
