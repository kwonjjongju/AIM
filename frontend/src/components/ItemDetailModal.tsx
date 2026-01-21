import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEdit2, FiTrash2, FiClock, FiUser, FiChevronRight } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useAuthStore } from '../store/authStore';
import StatusBadge from './StatusBadge';
import EditItemModal from './EditItemModal';
import { STATUS_CONFIG, type ItemStatus } from '../types';
import toast from 'react-hot-toast';

interface ItemDetailModalProps {
  itemId: string | null;
  onClose: () => void;
}

// 설명 파싱 함수 - [라벨] 값 형태를 구조화
const parseDescription = (description: string | undefined) => {
  if (!description) return [];
  
  const sections: { label: string; value: string; section: string }[] = [];
  const lines = description.split('\n');
  
  // 섹션 매핑
  const sectionMap: Record<string, string> = {
    '업무내용': '① 기본 정보',
    '현재방식': '② 현황 & 문제점',
    '소요시간': '② 현황 & 문제점',
    '참여인원': '② 현황 & 문제점',
    '문제점': '② 현황 & 문제점',
    '개선사유': '② 현황 & 문제점',
    '개발목적': '③ 개발 목적 & 기대효과',
    '기대효과(정량)': '③ 개발 목적 & 기대효과',
    '기대효과(정성)': '③ 개발 목적 & 기대효과',
    '자동화수준': '③ 개발 목적 & 기대효과',
    '입력데이터': '④ 입력/출력 데이터',
    '출력데이터': '④ 입력/출력 데이터',
    '구현방식': '⑤ 기술/구현 방식',
    '핵심기술': '⑤ 기술/구현 방식',
    '배포환경': '⑥ 인프라/운영 환경',
    '디바이스': '⑥ 인프라/운영 환경',
    '사용자': '⑦ 사용자 & 확장성',
    '사용범위': '⑦ 사용자 & 확장성',
    '중요도': '⑧ 우선순위 & 제약사항',
    '희망완료': '⑧ 우선순위 & 제약사항',
    '기타': '⑧ 우선순위 & 제약사항',
  };
  
  lines.forEach(line => {
    const match = line.match(/^\[(.+?)\]\s*(.+)$/);
    if (match) {
      const label = match[1];
      const value = match[2];
      const section = sectionMap[label] || '기타 정보';
      sections.push({ label, value, section });
    }
  });
  
  return sections;
};

// 섹션별로 그룹화
const groupBySection = (items: { label: string; value: string; section: string }[]) => {
  const groups: Record<string, { label: string; value: string }[]> = {};
  items.forEach(item => {
    if (!groups[item.section]) {
      groups[item.section] = [];
    }
    groups[item.section].push({ label: item.label, value: item.value });
  });
  return groups;
};

export default function ItemDetailModal({ itemId, onClose }: ItemDetailModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemsApi.getItem(itemId!),
    enabled: !!itemId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ItemStatus) =>
      itemsApi.updateStatus(itemId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('상태가 변경되었습니다');
      setShowStatusMenu(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => itemsApi.deleteItem(itemId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('삭제되었습니다');
      onClose();
    },
  });

  // 권한 체크
  const canEdit = () => {
    if (!user || !item) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'EXECUTIVE') return false;
    if (user.role === 'DEPT_MANAGER' && item.department.id === user.department.id) return true;
    if (item.createdBy.id === user.id) return true;
    return false;
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <AnimatePresence>
      {itemId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : item ? (
              <>
                {/* 헤더 */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span
                      className="text-sm font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${item.department.color}20`, color: item.department.color }}
                    >
                      {item.department.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit() && (
                      <>
                        <button
                          onClick={handleEdit}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6 space-y-6">
                  {/* 제목/설명 */}
                  <h1 className="text-2xl font-bold text-gray-800">{item.title}</h1>
                      {item.description && (() => {
                        const parsed = parseDescription(item.description);
                        const grouped = groupBySection(parsed);
                        const sectionOrder = [
                          '① 기본 정보',
                          '② 현황 & 문제점',
                          '③ 개발 목적 & 기대효과',
                          '④ 입력/출력 데이터',
                          '⑤ 기술/구현 방식',
                          '⑥ 인프라/운영 환경',
                          '⑦ 사용자 & 확장성',
                          '⑧ 우선순위 & 제약사항',
                          '기타 정보',
                        ];
                        
                        if (parsed.length === 0) {
                          // 구조화된 데이터가 없으면 원본 텍스트 표시
                          return <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>;
                        }
                        
                        return (
                          <div className="space-y-4 mt-4">
                            {sectionOrder.map(sectionName => {
                              const items = grouped[sectionName];
                              if (!items || items.length === 0) return null;
                              
                              return (
                                <div key={sectionName} className="border border-gray-200">
                                  {/* 섹션 헤더 */}
                                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700">{sectionName}</h3>
                                  </div>
                                  {/* 필드 목록 */}
                                  <div className="divide-y divide-gray-100">
                                    {items.map((field, idx) => (
                                      <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3">
                                        <div className="text-sm font-medium text-gray-500">
                                          {field.label}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-800">
                                          {field.value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                  {/* 정보 */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiUser size={14} />
                      <span>등록자: {item.createdBy.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiClock size={14} />
                      <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>

                  {/* 상태 변경 (권한 있을 때만) */}
                  {canEdit() && (
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">상태 변경</span>
                        <FiChevronRight className={`transform transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showStatusMenu && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1"
                          >
                            {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => statusMutation.mutate(status)}
                                disabled={item.status === status}
                                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  item.status === status
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <span>{STATUS_CONFIG[status].icon}</span>
                                <span className="text-sm">{STATUS_CONFIG[status].label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 상태 이력 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">상태 이력</h3>
                    <div className="space-y-3">
                      {item.statusHistory.map((history, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: STATUS_CONFIG[history.toStatus].color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {history.fromStatus
                                  ? `${STATUS_CONFIG[history.fromStatus].label} → ${STATUS_CONFIG[history.toStatus].label}`
                                  : STATUS_CONFIG[history.toStatus].label}
                              </span>
                              <span className="text-gray-400">by {history.changedBy.name}</span>
                            </div>
                            {history.note && (
                              <p className="text-gray-500 mt-0.5">{history.note}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-0.5">
                              {new Date(history.changedAt).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>

          {/* 수정 모달 */}
          <EditItemModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            item={item}
          />
        </>
      )}
    </AnimatePresence>
  );
}
