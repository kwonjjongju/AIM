/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 상태 색상 (캐주얼 버전)
        status: {
          idea: '#FCD34D',      // 💡 떠올림 - 노랑
          reviewing: '#60A5FA', // 👀 보고 있음 - 파랑
          progress: '#34D399',  // 🛠️ 만지는 중 - 초록
          hold: '#9CA3AF',      // ⏸️ 잠깐 멈춤 - 회색
          done: '#2DD4BF',      // ✅ 정리됨 - 민트
        },
        // 메인 컬러
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 백그라운드 - 코르크 보드/화이트보드 느낌
        board: {
          light: '#fefce8',
          DEFAULT: '#fef3c7',
          dark: '#fde68a',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        display: ['Gmarket Sans', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 12px 32px -8px rgba(0, 0, 0, 0.1)',
        'sticky': '2px 4px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
}
