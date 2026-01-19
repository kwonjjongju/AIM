import { motion } from 'framer-motion';
import { FiUser, FiClock } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import type { ImprovementItem } from '../types';

interface ImprovementCardProps {
  item: ImprovementItem;
  onClick: () => void;
  index?: number;
}

export default function ImprovementCard({ item, onClick, index = 0 }: ImprovementCardProps) {
  const isStale = item.daysSinceUpdate >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, rotate: 0 }}
      onClick={onClick}
      className="relative bg-white rounded-xl shadow-card hover:shadow-card-hover p-4 cursor-pointer transition-all duration-200 group"
      style={{
        transform: `rotate(${(index % 3 - 1) * 0.5}deg)`,
        borderLeft: `4px solid ${item.department.color}`,
      }}
    >
      {/* 오래된 항목 표시 */}
      {isStale && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-md">
          {item.daysSinceUpdate}일 전
        </div>
      )}

      {/* 상태 배지 */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={item.status} size="sm" />
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${item.department.color}20`, color: item.department.color }}
        >
          {item.department.name}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {item.title}
      </h3>

      {/* 설명 (있으면) */}
      {item.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {item.description}
        </p>
      )}

      {/* 하단 정보 */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <FiUser size={12} />
          <span>{item.createdBy.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiClock size={12} />
          <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>
    </motion.div>
  );
}
