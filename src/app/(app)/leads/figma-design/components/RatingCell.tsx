import { Star } from 'lucide-react';

interface RatingCellProps {
  rating: number;
  onChange?: (rating: number) => void;
}

export function RatingCell({ rating, onChange }: RatingCellProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className="transition-all duration-200 cursor-pointer hover:scale-125"
        >
          <Star
            className={`h-3 w-3 ${star <= rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}
