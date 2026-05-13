interface SourceCellProps {
  sources: string[];
}

const sourceColors = [
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
];

export function SourceCell({ sources }: SourceCellProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {sources.map((source, index) => (
        <span
          key={source}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${sourceColors[index % sourceColors.length]}`}
        >
          {source}
        </span>
      ))}
    </div>
  );
}
