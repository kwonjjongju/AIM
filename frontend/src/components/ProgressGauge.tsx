import { motion } from 'framer-motion';
import type { ItemStatus } from '../types';

interface ProgressGaugeProps {
  title: string;
  status: ItemStatus;
  size?: 'sm' | 'md' | 'lg';
}

// 상태별 진행률 매핑
const STATUS_PROGRESS: Record<ItemStatus, number> = {
  IDEA: 0,           // 신규: 0%
  REVIEWING: 25,     // 검토 중: 25%
  ON_HOLD: 50,       // 미선정: 50%
  IN_PROGRESS: 75,   // 진행 중: 75%
  DONE: 100,         // 완료: 100%
};

// 상태별 색상
const STATUS_COLORS: Record<ItemStatus, { start: string; end: string }> = {
  IDEA: { start: '#9CA3AF', end: '#D1D5DB' },
  REVIEWING: { start: '#3B82F6', end: '#93C5FD' },
  ON_HOLD: { start: '#F59E0B', end: '#FCD34D' },
  IN_PROGRESS: { start: '#10B981', end: '#6EE7B7' },
  DONE: { start: '#059669', end: '#34D399' },
};

export default function ProgressGauge({ title, status, size = 'md' }: ProgressGaugeProps) {
  const progress = STATUS_PROGRESS[status];
  const colors = STATUS_COLORS[status];
  
  // 크기 설정
  const sizeConfig = {
    sm: { width: 120, height: 70, strokeWidth: 8, fontSize: 'text-lg', titleSize: 'text-xs' },
    md: { width: 160, height: 90, strokeWidth: 10, fontSize: 'text-2xl', titleSize: 'text-sm' },
    lg: { width: 200, height: 110, strokeWidth: 12, fontSize: 'text-3xl', titleSize: 'text-base' },
  };
  
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius; // 반원의 둘레
  const progressOffset = circumference - (progress / 100) * circumference;
  
  const centerX = config.width / 2;
  const centerY = config.height - 10;

  return (
    <div className="flex flex-col items-center">
      {/* 제목 */}
      <p className={`font-bold text-gray-700 mb-1 ${config.titleSize} truncate max-w-full px-2 text-center`}>
        {title}
      </p>
      <p className="text-[10px] text-gray-400 mb-2">안건 진행률</p>
      
      {/* 게이지 */}
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          className="transform"
        >
          {/* 배경 호 (회색) */}
          <path
            d={`M ${config.strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${centerY}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          
          {/* 진행률 호 (컬러) */}
          <motion.path
            d={`M ${config.strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${centerY}`}
            fill="none"
            stroke={`url(#gradient-${status})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id={`gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* 퍼센트 텍스트 */}
        <div 
          className="absolute inset-0 flex items-end justify-center pb-1"
          style={{ paddingBottom: size === 'sm' ? '2px' : '8px' }}
        >
          <motion.span
            className={`font-bold ${config.fontSize}`}
            style={{ color: colors.start }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {progress}%
          </motion.span>
        </div>
      </div>
      
      {/* 라벨 */}
      <div className="flex justify-between w-full px-2 mt-1">
        <span className="text-[10px] font-medium text-gray-500">시작</span>
        <span className="text-[10px] font-medium text-gray-500">완료</span>
      </div>
    </div>
  );
}
