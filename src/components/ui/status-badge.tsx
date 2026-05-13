// components/ui/status-badge.tsx
import React from 'react';
import { designTokens } from '@/lib/design-system/tokens';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  // Map common status names to token keys
  let key: keyof typeof designTokens.badges = 'inactive';
  if (s === 'new') key = 'new';
  else if (s === 'no_respond' || s === 'no respond') key = 'no_respond';
  else if (s === 'contacted') key = 'contacted';
  else if (s === 'converted') key = 'converted';
  else if (s === 'lost') key = 'lost';
  
  const badgeClass = designTokens.badges[key] || designTokens.badges.inactive;
  
  return (
    <span className={`${designTokens.badges.base} ${badgeClass} ${className}`}>
      {status}
    </span>
  );
}
