// components/ui/stat-card.tsx
import React from 'react';
import { designTokens } from '@/lib/design-system/tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, description, trend, className = "" }: StatCardProps) {
  return (
    <div className={`${designTokens.statCard.base} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={designTokens.statCard.label}>{label}</p>
          <p className={designTokens.statCard.value}>{value}</p>
          {description && (
            <p className={designTokens.typography.caption + " mt-1"}>{description}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
