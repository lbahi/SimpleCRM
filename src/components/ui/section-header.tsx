// components/ui/section-header.tsx
import React from 'react';
import { designTokens } from '@/lib/design-system/tokens';

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, children, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className={designTokens.typography.sectionTitle}>{title}</h2>
        {description && (
          <p className={designTokens.typography.body + " mt-1"}>{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
