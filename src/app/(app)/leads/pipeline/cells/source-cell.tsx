// SimpleCRM — source-cell.tsx
"use client";

const sourceColors = [
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
];

interface SourceCellProps {
  sources: Array<{ source: string; name?: string; color?: string }>;
}

export function SourceCell({ sources }: SourceCellProps | any) {
  let normalizedSources: Array<{ source: string; name: string; color?: string }> = [];

  if (Array.isArray(sources)) {
    normalizedSources = sources.map((s: any) => {
      if (typeof s === 'string') {
        return { source: s, name: s };
      }
      if (s.source) {
        return { source: s.source, name: s.name || s.source };
      }
      if (s.name) {
        return { source: s.name, name: s.name };
      }
      return { source: 'Unknown', name: 'Unknown' };
    });
  } else if (typeof sources === 'string' && sources.trim().length > 0) {
    normalizedSources = [{ source: sources, name: sources }];
  } else if (sources && typeof sources === 'object' && ('source' in sources || 'name' in sources)) {
    const s = sources as any;
    normalizedSources = [{ source: s.source || s.name || 'Unknown', name: s.name || s.source || 'Unknown' }];
  }

  // Deduplicate sources by source
  const uniqueSources = normalizedSources.filter((source, index, self) =>
    index === self.findIndex((s) => s.source === source.source)
  );

  if (uniqueSources.length === 0) return <span className="text-neutral-400">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {uniqueSources.map((source, idx) => (
        <span
          key={`${source.source}-${idx}`}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${sourceColors[idx % sourceColors.length]}`}
        >
          {source.name || 'Unknown'}
        </span>
      ))}
    </div>
  );
}
