/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 상태 색상
        status: {
          idea: '#FCD34D',      // 💡 아이디어 - 노랑
          reviewing: '#A855F7', // 👀 검토중 - 보라
          progress: '#60A5FA',  // 🛠️ 진행중 - 파랑
          hold: '#9CA3AF',      // ⏸️ 보류 - 회색
          done: '#2DD4BF',      // ✅ 완료 - 민트
        },
        // 사이드바 색상
        sidebar: {
          dark: '#334155',      // slate-700
          light: '#f8fafc',     // slate-50
          active: '#14b8a6',    // teal-500
          hover: '#475569',     // slate-600
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        display: ['Gmarket Sans', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 12px 32px -8px rgba(0, 0, 0, 0.1)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
