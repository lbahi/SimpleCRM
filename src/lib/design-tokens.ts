// SimpleCRM — Design Tokens extracted from Figma Leads design
// These tokens provide consistent styling across all screens

export const designTokens = {
  // Cards & Containers
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    padding: 'p-6',
    hover: 'hover:shadow-md transition-shadow',
  },
  
  // Stats/Metrics Cards
  statCard: {
    base: 'bg-white rounded-lg border border-gray-200 p-6 shadow-sm',
    label: 'text-sm font-medium text-gray-500',
    value: 'text-3xl font-semibold text-gray-900 mt-2',
  },
  
  // Typography
  typography: {
    pageTitle: 'text-2xl font-semibold text-gray-900',
    sectionTitle: 'text-lg font-semibold text-gray-900',
    cardTitle: 'text-sm font-medium text-gray-700',
    body: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
    tableHeader: 'text-xs uppercase tracking-wider text-gray-600',
  },
  
  // Spacing
  spacing: {
    pageTop: 'py-6',
    section: 'space-y-6',
    cardGrid: 'grid gap-6',
    cardContent: 'space-y-4',
    compact: 'space-y-2',
  },
  
  // Status Badges (from Figma Leads)
  badges: {
    base: 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
    new: 'bg-blue-100 text-blue-700',
    fresh: 'bg-green-100 text-green-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    converted: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700',
  },
  
  // Source Pills
  pills: {
    base: 'inline-flex items-center px-2 py-0.5 rounded-md text-xs',
    colors: [
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-cyan-100 text-cyan-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
    ],
  },
  
  // Avatar
  avatar: {
    base: 'rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0',
    sizes: {
      sm: 'w-5 h-5 text-[10px]',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    },
  },
  
  // Buttons
  button: {
    primary: 'flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors',
    secondary: 'flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors',
    icon: 'p-1 hover:bg-gray-100 rounded transition-colors',
  },
  
  // Inputs
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    withIcon: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  },
  
  // Table
  table: {
    container: 'overflow-auto flex-1',
    header: 'bg-gray-50 sticky top-0 z-20',
    headerCell: 'px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600',
    row: 'border-b border-gray-200 hover:bg-gray-50',
    cell: 'px-4 py-3 text-sm',
  },
  
  // Toolbar
  toolbar: {
    base: 'flex items-center gap-4 p-4 border-b border-gray-200 bg-white',
  },
  
  // Dialogs
  dialog: {
    overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    content: 'bg-white rounded-lg shadow-xl w-full max-w-md',
    header: 'flex items-center justify-between p-4 border-b border-gray-200',
    body: 'p-4 space-y-4',
    footer: 'flex gap-2 p-4 border-t border-gray-200',
  },
  
  // Grid Layouts
  grid: {
    stats: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
    cards: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
    charts: 'grid gap-6 lg:grid-cols-2',
  },
};

