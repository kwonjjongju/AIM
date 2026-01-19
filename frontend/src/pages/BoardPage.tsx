import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiPlus, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { departmentsApi } from '../api/departments';
import { itemsApi } from '../api/items';
import { useAuthStore } from '../store/authStore';
import { STATUS_CONFIG, type ItemStatus } from '../types';
import ImprovementCard from '../components/ImprovementCard';
import CreateItemModal from '../components/CreateItemModal';
import ItemDetailModal from '../components/ItemDetailModal';

export default function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(
    searchParams.get('dept')
  );
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { user } = useAuthStore();

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    const deptParam = searchParams.get('dept');
    if (deptParam !== selectedDeptId) {
      setSelectedDeptId(deptParam);
    }
  }, [searchParams]);

  // 부서 선택 시 URL 파라미터도 업데이트
  const handleDeptSelect = (deptId: string | null) => {
    setSelectedDeptId(deptId);
    if (deptId) {
      setSearchParams({ dept: deptId });
    } else {
      setSearchParams({});
    }
  };

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const { data: itemsData, isLoading, refetch } = useQuery({
    queryKey: ['items', { departmentId: selectedDeptId, status: selectedStatus }],
    queryFn: () =>
      itemsApi.getItems({
        departmentId: selectedDeptId || undefined,
        status: selectedStatus || undefined,
        limit: 100,
      }),
  });

  const canCreate = user?.role !== 'EXECUTIVE';

  const clearFilters = () => {
    handleDeptSelect(null);
    setSelectedStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            보드 📋
          </h1>
          <p className="text-gray-500 mt-1">
            본부별/상태별로 개선 항목을 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            title="새로고침"
          >
            <FiRefreshCw size={20} />
          </button>
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={20} />
              일단 올리기
            </motion.button>
          )}
        </div>
      </div>

      {/* 본부 탭 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleDeptSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedDeptId === null
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          전체
        </button>
        {departments?.map((dept) => (
          <button
            key={dept.id}
            onClick={() => handleDeptSelect(dept.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedDeptId === dept.id
                ? 'text-white shadow-md'
                : 'bg-white hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: selectedDeptId === dept.id ? dept.color : undefined,
              color: selectedDeptId === dept.id ? 'white' : dept.color,
            }}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <FiFilter size={14} />
          상태:
        </span>
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedStatus === null
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                selectedStatus === status ? 'shadow-md' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor:
                  selectedStatus === status ? config.color : `${config.color}30`,
                color: selectedStatus === status ? 'white' : config.color,
              }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
        {(selectedDeptId || selectedStatus) && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-2"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-500">
        총 <span className="font-bold text-gray-800">{itemsData?.pagination.total || 0}</span>건
      </div>

      {/* 카드 그리드 */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="card h-44 animate-pulse bg-gray-100" />
              ))}
          </motion.div>
        ) : itemsData?.items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg">등록된 항목이 없어요</p>
            {canCreate && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                첫 번째 아이디어를 등록해보세요!
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {itemsData?.items.map((item, idx) => (
              <ImprovementCard
                key={item.id}
                item={item}
                index={idx}
                onClick={() => setSelectedItemId(item.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 페이지네이션 안내 */}
      {itemsData && itemsData.pagination.total > itemsData.items.length && (
        <div className="text-center text-sm text-gray-400">
          {itemsData.items.length}개 표시 중 (전체 {itemsData.pagination.total}개)
        </div>
      )}

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
