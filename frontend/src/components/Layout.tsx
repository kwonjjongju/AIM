import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate('/login');
      toast.success('로그아웃되었습니다');
    } catch {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl"
              >
                📋
              </motion.div>
              <div>
                <h1 className="font-display font-bold text-lg text-gray-800">
                  업무 개선 보드
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Fix-it Board</p>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <FiHome size={18} />
                <span className="hidden sm:inline">대시보드</span>
              </NavLink>
              <NavLink
                to="/board"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <FiGrid size={18} />
                <span className="hidden sm:inline">보드</span>
              </NavLink>
            </nav>

            {/* 사용자 정보 */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user?.department.color }}
                />
                <span className="text-gray-600">{user?.department.name}</span>
                <span className="text-gray-400">|</span>
                <span className="font-medium text-gray-800 flex items-center gap-1">
                  <FiUser size={14} />
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="로그아웃"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
