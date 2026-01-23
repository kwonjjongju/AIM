import { motion } from 'framer-motion';
import { FiUsers, FiMonitor } from 'react-icons/fi';

export default function AIToolUsersPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            경신 AI 툴 사용자 현황
          </h1>
          <p className="text-gray-500 mt-1">
            AI 툴 사용자 현황을 확인합니다
          </p>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card !rounded-none"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FiMonitor className="text-teal-600" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">AI 툴 사용자 현황</h2>
        </div>

        <div className="text-center py-12 text-gray-500">
          <FiUsers size={48} className="mx-auto mb-4 text-gray-300" />
          <p>사용자 현황 데이터가 여기에 표시됩니다</p>
        </div>
      </motion.div>
    </div>
  );
}
