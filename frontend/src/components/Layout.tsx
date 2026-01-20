import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiGrid, 
  FiLogOut, 
  FiUser,
  FiSettings,
  FiLayers,
  FiUsers,
  FiFolder,
  FiCircle
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { departmentsApi } from '../api/departments';
import toast from 'react-hot-toast';

// 메뉴 구조 정의
interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  color?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
  path?: string;
}

// 고정 메뉴 (부서 데이터 없이 정의할 수 있는 메뉴)
const staticMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: <FiHome size={22} />,
    path: '/dashboard',
  },
  {
    id: 'board',
    label: '개선보드',
    icon: <FiGrid size={22} />,
    subItems: [], // 동적으로 채워짐
  },
  {
    id: 'management',
    label: '관리',
    icon: <FiSettings size={22} />,
    subItems: [
      { id: 'dept', label: '부서 관리', path: '/management/departments', icon: <FiFolder size={16} /> },
      { id: 'users', label: '사용자 관리', path: '/management/users', icon: <FiUsers size={16} /> },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>('board');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['board']);

  // 부서 목록 가져오기
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  // 부서 데이터를 기반으로 메뉴 아이템 생성
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems);

  useEffect(() => {
    if (departments && departments.length > 0) {
      const boardSubItems: SubMenuItem[] = [
        { 
          id: 'board-all', 
          label: '전체 보기', 
          path: '/board', 
          icon: <FiLayers size={16} /> 
        },
        ...departments.map(dept => ({
          id: `board-dept-${dept.id}`,
          label: dept.name,
          path: `/board?dept=${dept.id}`,
          icon: <FiCircle size={12} style={{ color: dept.color, fill: dept.color }} />,
          color: dept.color,
        })),
      ];

      setMenuItems(prev => prev.map(item => 
        item.id === 'board' 
          ? { ...item, subItems: boardSubItems }
          : item
      ));
    }
  }, [departments]);

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

  const handleMenuClick = (menu: MenuItem) => {
    if (menu.path) {
      navigate(menu.path);
      setActiveMenu(menu.id);
    } else if (menu.subItems) {
      setActiveMenu(menu.id);
      if (expandedMenus.includes(menu.id)) {
        setExpandedMenus(expandedMenus.filter(id => id !== menu.id));
      } else {
        setExpandedMenus([...expandedMenus, menu.id]);
      }
    }
  };

  const toggleSubmenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
  };

  const isMenuActive = (menu: MenuItem) => {
    if (menu.path) {
      return location.pathname === menu.path;
    }
    if (menu.subItems) {
      return menu.subItems.some(sub => location.pathname + location.search === sub.path || location.pathname === sub.path.split('?')[0]);
    }
    return false;
  };

  const isSubItemActive = (subItem: SubMenuItem) => {
    const currentPath = location.pathname + location.search;
    if (subItem.path.includes('?')) {
      return currentPath === subItem.path;
    }
    return location.pathname === subItem.path && !location.search;
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* 좌측 아이콘 바 */}
      <div className="w-16 bg-slate-700 flex flex-col items-center py-4 z-50">
        {/* 로고 */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
        </div>

        {/* 메뉴 아이콘 */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {menuItems.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu)}
              className={`
                w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 group relative
                ${activeMenu === menu.id || isMenuActive(menu)
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:bg-slate-600 hover:text-white'
                }
              `}
              title={menu.label}
            >
              {menu.icon}
              <span className="text-[9px] font-medium truncate w-full text-center px-0.5">
                {menu.label.slice(0, 4)}
              </span>
            </button>
          ))}
        </nav>

        {/* 하단 - 로그아웃 */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
            title="로그아웃"
          >
            <FiLogOut size={20} />
            <span className="text-[9px]">로그아웃</span>
          </button>
        </div>
      </div>

      {/* 서브메뉴 사이드바 */}
      <AnimatePresence>
        {activeMenu && menuItems.find(m => m.id === activeMenu)?.subItems && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 border-r border-slate-200 overflow-hidden z-40"
          >
            <div className="w-[220px] h-full flex flex-col">
              {/* 서브메뉴 헤더 */}
              <div className="h-14 px-4 flex items-center border-b border-slate-200 bg-white">
                <h2 className="font-semibold text-slate-800">
                  {menuItems.find(m => m.id === activeMenu)?.label}
                </h2>
              </div>

              {/* 서브메뉴 아이템 */}
              <div className="flex-1 py-2 overflow-y-auto">
                {menuItems.find(m => m.id === activeMenu)?.subItems?.map((subItem) => (
                  <div key={subItem.id}>
                    <NavLink
                      to={subItem.path}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg
                        transition-all duration-150
                        ${isSubItemActive(subItem)
                          ? 'bg-teal-500 text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-200'
                        }
                      `}
                      style={
                        isSubItemActive(subItem) && subItem.color
                          ? { backgroundColor: subItem.color }
                          : undefined
                      }
                    >
                      {subItem.icon}
                      <span className="text-sm">{subItem.label}</span>
                    </NavLink>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 상단 헤더 */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          {/* 시스템 제목 */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-800">
              <span className="text-teal-600">A</span>utomated{' '}
              <span className="text-teal-600">I</span>mprovement{' '}
              <span className="text-teal-600">M</span>anagement
            </h1>
          </div>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: user?.department.color }}
              />
              <span className="text-slate-500">{user?.department.name}</span>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <FiUser size={14} />
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto bg-slate-100">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
