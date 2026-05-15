// lib/design-system/tokens.tsx
import React from 'react';

export const designTokens = {
  // Cards & Containers
  card: {
    base: 'bg-white rounded-lg border border-neutral-200 shadow-sm transition-shadow duration-200',
    padding: 'p-6',
    hover: 'hover:shadow-md',
  },
  
  // Metrics/Stats Cards
  statCard: {
    base: 'bg-white rounded-lg border border-neutral-200 p-6 shadow-sm',
    label: 'text-sm text-neutral-500 font-medium',
    value: 'text-3xl font-semibold text-neutral-900 mt-2 tracking-tight',
  },
  
  // Typography
  typography: {
    pageTitle: 'text-2xl font-semibold text-neutral-900 tracking-tight',
    sectionTitle: 'text-lg font-semibold text-neutral-900 tracking-tight',
    cardTitle: 'text-sm font-medium text-neutral-700',
    body: 'text-sm text-neutral-600 leading-relaxed',
    caption: 'text-xs text-neutral-500',
  },
  
  // Spacing
  spacing: {
    pageTop: 'pt-6 pb-8 px-8',
    section: 'space-y-6',
    cardGrid: 'grid gap-6',
    cardContent: 'space-y-4',
  },
  
  // Status Badges (extracted from Figma Leads design)
  badges: {
    base: 'px-2.5 py-1 rounded-md text-xs font-medium',
    new: 'bg-blue-100 text-blue-700',
    no_respond: 'bg-orange-100 text-orange-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    converted: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
    inactive: 'bg-neutral-100 text-neutral-700',
  },
  
  // Colors (Neutral focus for premium feel)
  colors: {
    primary: 'neutral',
    background: 'bg-neutral-50',
    surface: 'bg-white',
    border: 'border-neutral-200',
    text: {
      primary: 'text-neutral-900',
      secondary: 'text-neutral-600',
      tertiary: 'text-neutral-500',
    },
  },

  // Layout Grids
  grid: {
    stats: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    charts: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  }
}

// Helper components (exported from UI library for convenience)
export { StatCard } from '@/components/ui/stat-card';
export { StatusBadge } from '@/components/ui/status-badge';
export { SectionHeader } from '@/components/ui/section-header';
export { DataTableWrapper } from '@/components/ui/data-table-wrapper';
