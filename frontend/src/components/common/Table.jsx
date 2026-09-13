import React from 'react';
import { TableSkeleton } from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'Tidak ada data untuk ditampilkan.',
  keyExtractor = (item, idx) => item.id || idx,
  className = '',
}) {
  if (isLoading) {
    return <TableSkeleton rows={4} cols={columns.length || 4} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="Tidak ada data" description={emptyMessage} />;
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200/80 bg-surface shadow-subtle ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 text-xs font-semibold text-textSecondary uppercase tracking-wider ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {data.map((item, rowIdx) => (
            <tr
              key={keyExtractor(item, rowIdx)}
              className="hover:bg-slate-50/80 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.render ? col.render(item, rowIdx) : item[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
