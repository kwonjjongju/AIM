import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiPlus, FiClock, FiCheckCircle, FiPauseCircle, FiList } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardApi } from '../api/dashboard';
import { itemsApi } from '../api/items';
import { useAuthStore } from '../store/authStore';
import { STATUS_CONFIG } from '../types';
import ImprovementCard from '../components/ImprovementCard';
import CreateItemModal from '../components/CreateItemModal';
import ItemDetailModal from '../components/ItemDetailModal';

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', { limit: 8 }],
    queryFn: () => itemsApi.getItems({ limit: 8 }),
  });

  const canCreate = user?.role !== 'EXECUTIVE';

  return (
    <div className="space-y-6">
      {/* 인사 & 등록 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            현황 훑어보기 👀
          </h1>
          <p className="text-gray-500 mt-1">
            요즘 회사에서 어떤 이야기들이 오가는지 한눈에!
          </p>
        </div>
        {canCreate && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-base"
          >
            <FiPlus size={20} />
            일단 올리기
          </motion.button>
        )}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card animate-pulse h-24 bg-gray-100" />
            ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <FiList className="text-amber-700" size={20} />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">전체</p>
                  <p className="text-2xl font-bold text-amber-800">{summary?.total || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-200 rounded-lg">
                  <FiCheckCircle className="text-teal-700" size={20} />
                </div>
                <div>
                  <p className="text-xs text-teal-600 font-medium">완료</p>
                  <p className="text-2xl font-bold text-teal-800">
                    {summary?.byStatus.DONE || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <FiPauseCircle className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">멈춤</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {summary?.byStatus.ON_HOLD || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <FiClock className="text-orange-700" size={20} />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-medium">오래된 항목</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {summary?.staleItems.length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* 본부별 현황 차트 (세로 차트) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="font-semibold text-gray-700 mb-2 text-lg">본부별 현황</h2>
        <p className="text-xs text-gray-400 mb-4">클릭하면 해당 본부 보드로 이동</p>
        {summaryLoading ? (
          <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <div className="flex justify-center gap-3 overflow-x-auto pb-2">
            {summary?.byDepartment.map((dept) => {
              const maxCount = Math.max(...(summary?.byDepartment.map(d => d.count) || [1]));
              const heightPercent = maxCount > 0 ? (dept.count / maxCount) * 100 : 0;
              const minHeight = 20;
              const maxHeight = 180;
              const barHeight = Math.max(minHeight, (heightPercent / 100) * maxHeight);
              
              return (
                <button
                  key={dept.id}
                  onClick={() => navigate(`/board?dept=${dept.id}`)}
                  className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105"
                >
                  {/* 건수 */}
                  <span
                    className="text-sm font-bold"
                    style={{ color: dept.color }}
                  >
                    {dept.count}
                  </span>
                  {/* 막대 */}
                  <div
                    className="w-12 rounded-t-lg transition-all group-hover:shadow-lg"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: dept.color,
                    }}
                  />
                  {/* 본부 이름 (도형으로 감싸기) */}
                  <div
                    className="px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all group-hover:shadow-md"
                    style={{
                      backgroundColor: `${dept.color}20`,
                      color: dept.color,
                      border: `2px solid ${dept.color}`,
                    }}
                  >
                    {dept.name}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 오래된 항목 (컴팩트) */}
      {summary?.staleItems && summary.staleItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card py-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-700 text-sm">
              ⚠️ 오래된 항목 <span className="text-gray-400">(30일+)</span>
            </h2>
            <div className="flex gap-2">
              {summary.staleItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm"
                >
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">{item.title}</span>
                  <span className="text-xs text-orange-600 font-medium">{item.daysSinceUpdate}일</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 최근 등록된 항목 + 상태별 현황 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="font-medium text-gray-700">최근 등록된 항목</h2>
          {/* 상태별 현황 (인라인) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div
                key={status}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <span>{config.icon}</span>
                <span className="font-bold" style={{ color: config.color }}>
                  {summary?.byStatus[status as keyof typeof summary.byStatus] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
        {itemsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card h-40 animate-pulse bg-gray-100" />
              ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {itemsData?.items.map((item, idx) => (
              <ImprovementCard
                key={item.id}
                item={item}
                index={idx}
                onClick={() => setSelectedItemId(item.id)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* 모달 */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <ItemDetailModal
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </div>
  );
}
