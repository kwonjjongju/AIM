import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { departmentsApi } from '../api/departments';
import { itemsApi } from '../api/items';
import { dashboardApi } from '../api/dashboard';
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
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | null>(
    searchParams.get('status') as ItemStatus | null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { user } = useAuthStore();

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    const deptParam = searchParams.get('dept');
    const statusParam = searchParams.get('status') as ItemStatus | null;
    
    if (deptParam !== selectedDeptId) {
      setSelectedDeptId(deptParam);
    }
    if (statusParam !== selectedStatus) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  // 본부 선택 시 URL 파라미터도 업데이트
  const handleDeptSelect = (deptId: string | null) => {
    setSelectedDeptId(deptId);
    setSelectedStatus(null); // 본부 변경 시 상태 필터 초기화
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

  // 상태별 요약 데이터
  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  });

  const canCreate = user?.role !== 'EXECUTIVE';

  // 선택된 본부 정보 가져오기
  const selectedDept = departments?.find(d => d.id === selectedDeptId);

  // 현재 필터된 항목들의 상태별 건수 계산 (본부별 또는 전체)
  const statusCounts = useMemo(() => {
    if (!itemsData?.items) return null;
    
    const counts: Record<ItemStatus, number> = {
      IDEA: 0,
      REVIEWING: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      DONE: 0,
    };
    
    itemsData.items.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    
    return counts;
  }, [itemsData?.items]);

  // 상태별로 항목 그룹화 (selectedStatus가 없을 때만 그룹화)
  const groupedItems = useMemo(() => {
    if (!itemsData?.items || selectedStatus) return null;
    
    const statusOrder: ItemStatus[] = ['IDEA', 'REVIEWING', 'IN_PROGRESS', 'ON_HOLD', 'DONE'];
    const groups: Record<ItemStatus, typeof itemsData.items> = {
      IDEA: [],
      REVIEWING: [],
      IN_PROGRESS: [],
      ON_HOLD: [],
      DONE: [],
    };
    
    itemsData.items.forEach(item => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      }
    });
    
    return statusOrder.map(status => ({
      status,
      config: STATUS_CONFIG[status],
      items: groups[status],
    })).filter(group => group.items.length > 0);
  }, [itemsData?.items, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            개선보드 📋
          </h1>
          <p className="text-gray-500 mt-1">
            본부별로 개선 항목을 확인하고 관리하세요
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

      {/* 메인 탭: 전체보기 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDeptSelect(null)}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            selectedDeptId === null
              ? 'bg-gray-800 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📊 전체보기
        </button>
      </div>

      {/* 본부 탭 (8개) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs text-gray-400 mb-3 font-medium">본부 선택</p>
        <div className="flex flex-wrap gap-2">
          {departments?.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleDeptSelect(dept.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                selectedDeptId === dept.id
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white hover:scale-102'
              }`}
              style={{
                backgroundColor: selectedDeptId === dept.id ? dept.color : 'white',
                borderColor: dept.color,
                color: selectedDeptId === dept.id ? 'white' : dept.color,
              }}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* 상태 탭 (항상 표시) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-3">
          {selectedDeptId ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedDept?.color }}
              />
              <p className="text-sm font-bold text-gray-700">
                {selectedDept?.name} 상태별 보기
              </p>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <p className="text-sm font-bold text-gray-700">
                전체본부 상태별 보기
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === null
                ? 'bg-gray-700 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-300'
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === status ? 'shadow-md scale-105' : 'hover:scale-102'
                }`}
                style={{
                  backgroundColor:
                    selectedStatus === status ? config.color : 'white',
                  color: selectedStatus === status ? 'white' : config.color,
                  border: `2px solid ${config.color}`,
                }}
              >
                <span className="text-base">{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 현재 필터 상태 표시 + 상태별 현황 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">현재 보기:</span>
          <span className="font-bold text-gray-800">
            {selectedDeptId ? selectedDept?.name : '전체'}
          </span>
          {selectedStatus && (
            <>
              <span className="text-gray-400">›</span>
              <span
                className="font-medium px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: `${STATUS_CONFIG[selectedStatus].color}30`,
                  color: STATUS_CONFIG[selectedStatus].color,
                }}
              >
                {STATUS_CONFIG[selectedStatus].icon} {STATUS_CONFIG[selectedStatus].label}
              </span>
            </>
          )}
          <span className="text-gray-400 ml-2">
            ({itemsData?.pagination.total || 0}건)
          </span>
          {(selectedDeptId || selectedStatus) && (
            <button
              onClick={() => {
                handleDeptSelect(null);
                setSelectedStatus(null);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline ml-2"
            >
              초기화
            </button>
          )}
        </div>

        {/* 상태별 현황 (현재 필터 기준) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as ItemStatus)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all hover:scale-105 ${
                selectedStatus === status ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{ 
                backgroundColor: `${config.color}15`,
                color: config.color,
                ringColor: config.color,
              }}
              title={`${config.label} 필터`}
            >
              <span>{config.icon}</span>
              <span className="font-bold">
                {statusCounts?.[status as ItemStatus] || 0}
              </span>
            </button>
          ))}
        </div>
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
            <p className="text-lg">
              {selectedDeptId
                ? `${selectedDept?.name}에 등록된 항목이 없어요`
                : '등록된 항목이 없어요'}
            </p>
            {canCreate && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                첫 번째 아이디어를 등록해보세요!
              </button>
            )}
          </motion.div>
        ) : groupedItems && !selectedStatus ? (
          // 상태별 그룹화 표시 (세로 칼럼 레이아웃)
          <motion.div
            key="grouped"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {groupedItems.map((group, groupIdx) => (
              <div key={group.status} className="flex flex-col">
                {/* 상태 그룹 헤더 */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2"
                  style={{ 
                    backgroundColor: `${group.config.color}15`,
                    borderColor: group.config.color,
                  }}
                >
                  <span className="text-lg">{group.config.icon}</span>
                  <span
                    className="font-bold text-sm flex-1"
                    style={{ color: group.config.color }}
                  >
                    {group.config.label}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: group.config.color,
                      color: 'white',
                    }}
                  >
                    {group.items.length}
                  </span>
                </div>
                {/* 그룹 내 카드 (세로 배치) */}
                <div className="flex flex-col gap-3 p-2 bg-gray-50 rounded-b-lg min-h-[200px]">
                  {group.items.map((item, idx) => (
                    <ImprovementCard
                      key={item.id}
                      item={item}
                      index={groupIdx * 10 + idx}
                      onClick={() => setSelectedItemId(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          // 단일 상태 필터 시 기존 그리드
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
