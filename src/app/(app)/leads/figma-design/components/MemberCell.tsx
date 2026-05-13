interface MemberCellProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MemberCell({ name, size = 'md' }: MemberCellProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const initials = getInitials(name);

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0`}>
        {initials}
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
}
