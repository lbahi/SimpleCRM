// components/ui/data-table-wrapper.tsx
import React from 'react';
import { designTokens } from '@/lib/design-system/tokens';

interface DataTableWrapperProps {
  title?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataTableWrapper({ title, headerActions, children, className = "" }: DataTableWrapperProps) {
  return (
    <div className={`${designTokens.card.base} overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          {title && <h3 className={designTokens.typography.sectionTitle}>{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
