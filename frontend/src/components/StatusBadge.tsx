import { STATUS_CONFIG, type ItemStatus } from '../types';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: `${config.color}30`, color: config.color }}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
