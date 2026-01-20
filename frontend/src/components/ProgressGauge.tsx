import { motion } from 'framer-motion';
import type { ItemStatus } from '../types';

interface ProgressGaugeProps {
  title: string;
  status: ItemStatus;
}

// 상태별 진행률 매핑
const STATUS_PROGRESS: Record<ItemStatus, number> = {
  IDEA: 0,           // 신규 - 0%
  REVIEWING: 25,     // 검토 중 - 25%
  ON_HOLD: 50,       // 미선정 - 50%
  IN_PROGRESS: 75,   // 진행 중 - 75%
  DONE: 100,         // 완료 - 100%
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  IDEA: '신규',
  REVIEWING: '검토 중',
  ON_HOLD: '미선정',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
};

export default function ProgressGauge({ title, status }: ProgressGaugeProps) {
  const progress = STATUS_PROGRESS[status];
  const statusLabel = STATUS_LABELS[status];
  
  // 반원 게이지 계산 (180도 = 100%)
  const angle = (progress / 100) * 180;
  
  // SVG 아크 경로 계산
  const radius = 60;
  const strokeWidth = 10;
  const centerX = 80;
  const centerY = 70;
  
  // 시작점 (왼쪽 끝)
  const startX = centerX - radius;
  const startY = centerY;
  
  // 끝점 계산 (각도에 따라)
  const endAngle = Math.PI - (angle * Math.PI) / 180;
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY - radius * Math.sin(endAngle);
  
  // 아크 플래그 (180도 이상이면 1)
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  // 진행률에 따른 색상
  const getProgressColor = (prog: number) => {
    if (prog === 0) return '#E5E7EB';
    if (prog <= 25) return '#10B981'; // 초록
    if (prog <= 50) return '#F59E0B'; // 주황
    if (prog <= 75) return '#F97316'; // 진한 주황
    return '#10B981'; // 완료 - 초록
  };

  const progressColor = getProgressColor(progress);
  
  return (
    <div className="flex flex-col items-center">
      {/* 안건명 */}
      <div className="text-center mb-1">
        <p className="text-xs font-semibold text-gray-500">안건명</p>
        <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]" title={title}>
          {title.length > 12 ? `${title.slice(0, 12)}...` : title}
        </p>
      </div>
      
      {/* 게이지 */}
      <div className="relative flex justify-center">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* 배경 아크 (회색) */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${startY}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* 진행 아크 (색상) */}
          {progress > 0 && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          
          {/* 퍼센트 텍스트 */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#374151"
          >
            {progress}%
          </text>
          
          {/* 상태 라벨 */}
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            fontSize="11"
            fill="#6B7280"
          >
            {statusLabel}
          </text>
        </svg>
      </div>
      
      {/* 시작 / 완료 라벨 */}
      <div className="flex justify-between w-full px-2 -mt-1">
        <span className="text-xs font-medium text-emerald-600">시작</span>
        <span className="text-xs font-medium text-orange-500">완료</span>
      </div>
    </div>
  );
}
