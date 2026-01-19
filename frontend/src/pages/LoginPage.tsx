import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`안녕하세요, ${data.user.name}님! 👋`);
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('이메일 또는 비밀번호를 확인해주세요');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }
    loginMutation.mutate();
  };

  // 데모 계정 빠른 로그인
  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-[10%] text-6xl opacity-20"
        >
          📋
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-[15%] text-5xl opacity-20"
        >
          💡
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          className="absolute bottom-32 left-[20%] text-4xl opacity-20"
        >
          🛠️
        </motion.div>
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-20 right-[25%] text-5xl opacity-20"
        >
          ✅
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-block text-6xl mb-4"
          >
            📋
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-gray-800 mb-2">
            업무 개선 보드
          </h1>
          <p className="text-gray-500">
            화이트보드 + 포스트잇을 온라인으로
          </p>
        </div>

        {/* 로그인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base"
            >
              {loginMutation.isPending ? (
                '로그인 중...'
              ) : (
                <>
                  로그인
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* 데모 계정 안내 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">
              테스트 계정으로 빠른 로그인
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => quickLogin('admin@company.com')}
                className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
              >
                관리자
              </button>
              <button
                onClick={() => quickLogin('exec@company.com')}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                경영자
              </button>
              <button
                onClick={() => quickLogin('hong@company.com')}
                className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
              >
                일반직원
              </button>
              <button
                onClick={() => quickLogin('prod.manager@company.com')}
                className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors"
              >
                부서담당자
              </button>
            </div>
          </div>
        </motion.div>

        {/* 하단 안내 */}
        <p className="text-center text-sm text-gray-400 mt-6">
          성과관리가 아닌 <span className="text-amber-600 font-medium">리스트 관리</span>
        </p>
      </motion.div>
    </div>
  );
}
