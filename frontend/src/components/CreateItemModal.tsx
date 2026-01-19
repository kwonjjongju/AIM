import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import toast from 'react-hot-toast';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateItemModal({ isOpen, onClose }: CreateItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: itemsApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('항목이 등록되었습니다! 💡');
      handleClose();
    },
    onError: () => {
      toast.error('등록에 실패했습니다');
    },
  });

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800">
                    새 아이디어 등록
                  </h2>
                  <p className="text-xs text-gray-500">편하게 써주세요 (형식 없음)</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  뭐가 불편한가요? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 회의실 예약이 너무 번거로워요"
                  className="input"
                  maxLength={100}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {title.length}/100
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="편하게 써주세요..."
                  className="input min-h-[120px] resize-none"
                  rows={4}
                />
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSend size={16} />
                  {createMutation.isPending ? '등록 중...' : '일단 올리기'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
