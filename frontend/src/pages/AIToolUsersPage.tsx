import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiSearch } from 'react-icons/fi';

// 본부 목록
const DIVISIONS = [
  '전자부품사업본부',
  '관리본부',
  '생산본부',
  '생산기술본부',
  '구매본부',
  '품질본부',
  '연구본부',
  '영업본부',
];

// AI 툴 목록
const AI_TOOLS = [
  { id: 'skywork', name: 'Skywork', color: '#6366f1' },
  { id: 'gemini', name: 'Gemini & Antigravity', color: '#10b981' },
  { id: 'chatgpt', name: 'ChatGPT', color: '#14b8a6' },
  { id: 'cursor', name: 'Cursor AI', color: '#f59e0b' },
  { id: 'claude', name: 'Claude Code', color: '#8b5cf6' },
];

// 사용자 데이터 (임시 하드코딩)
const INITIAL_USERS_DATA = [
  { id: 1, division: '', team: '총괄사장', name: '금우연 사장', email: 'geumwy@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: true, cursor: false, claude: false } },
  { id: 2, division: '전자부품사업본부', team: '전자시스템설계팀', name: '최규진 선임', email: 'embeddedmaster@kyungshin.co.kr', tools: { skywork: true, gemini: true, chatgpt: true, cursor: true, claude: true } },
  { id: 3, division: '전자부품사업본부', team: '전자시스템설계팀', name: '신용갑 책임', email: 'ygshin@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: false, cursor: false, claude: false } },
  { id: 4, division: '전자부품사업본부', team: '전자시스템설계팀', name: '여서정 연구원', email: 'ysj0930@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: false, cursor: false, claude: false } },
  { id: 5, division: '전자부품사업본부', team: '전자시스템설계팀', name: '조준희 연구원', email: 'junhui125@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: false, cursor: false, claude: true } },
  { id: 6, division: '전자부품사업본부', team: '전자시스템설계팀', name: '정세인 연구원', email: 'sein0130@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: false, cursor: false, claude: true } },
  { id: 7, division: '전자부품사업본부', team: '전자시스템설계팀', name: '이경철 책임', email: 'e22e0550@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: false, cursor: false, claude: false } },
  { id: 8, division: '관리본부', team: '인사팀', name: '이영호 책임', email: 'hslyh@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: true, cursor: false, claude: false } },
  { id: 9, division: '관리본부', team: '원가기획팀', name: '김효정 책임', email: 'khj0304@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 10, division: '구매본부', team: '외주원가팀', name: '이태관 선임', email: 'LTG018@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 11, division: '연구본부', team: '연구지원센터', name: '김용노 상무보', email: 'morriskim@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 12, division: '연구본부', team: '연구기획팀', name: '김영아 선임', email: 'younga@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 13, division: '연구본부', team: '연구기획팀', name: '김륜영 연구원', email: 'fbsdud1212@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 14, division: '연구본부', team: '설계분석팀', name: '오수경 연구원', email: '5sg0221@kyungshin.co.kr', tools: { skywork: false, gemini: false, chatgpt: false, cursor: true, claude: false } },
  { id: 15, division: '생산기술본부', team: '선행생산기술팀', name: '김우영 선임', email: 'wykim7@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: true, cursor: true, claude: true } },
  { id: 16, division: '연구본부', team: '부품설계팀', name: '권종주 선임', email: 'kwonjj9112@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: true, cursor: true, claude: true } },
  { id: 17, division: '연구본부', team: '부품설계팀', name: '박재호 책임', email: 'jaehodesu@kyungshin.co.kr', tools: { skywork: false, gemini: true, chatgpt: true, cursor: false, claude: false } },
];

export default function AIToolUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [usersData, setUsersData] = useState(INITIAL_USERS_DATA);

  // 팀 목록 추출
  const teams = [...new Set(usersData.map(u => u.team))];

  // 필터링된 데이터
  const filteredUsers = usersData.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.division.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || user.team === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  // 본부 변경 핸들러
  const handleDivisionChange = (userId: number, division: string) => {
    setUsersData(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, division } : user
      )
    );
  };

  // 통계 계산
  const stats = AI_TOOLS.map(tool => ({
    ...tool,
    count: usersData.filter(u => u.tools[tool.id as keyof typeof u.tools]).length,
  }));

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            경신 AI 툴 사용자 현황
          </h1>
          <p className="text-gray-500 mt-1">
            총 {usersData.length}명의 AI 툴 사용자 현황
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card !rounded-none p-4"
            style={{ borderLeft: `4px solid ${tool.color}` }}
          >
            <p className="text-xs text-gray-500 font-medium">{tool.name}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: tool.color }}>
              {tool.count}
              <span className="text-sm text-gray-400 font-normal ml-1">명</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* 필터 영역 */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="이름, 이메일, 팀으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">전체 팀</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card !rounded-none overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold w-12">No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">본부</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">팀</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">사용자</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">계정 ID</th>
                {AI_TOOLS.map(tool => (
                  <th
                    key={tool.id}
                    className="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                    style={{ backgroundColor: tool.color }}
                  >
                    {tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                  <td className="px-2 py-2">
                    <select
                      value={user.division}
                      onChange={(e) => handleDivisionChange(user.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">선택</option>
                      {DIVISIONS.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.team}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  {AI_TOOLS.map(tool => (
                    <td key={tool.id} className="px-3 py-3 text-center">
                      {user.tools[tool.id as keyof typeof user.tools] ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-100">
                          <FiCheck className="text-teal-600" size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                          <FiX className="text-gray-400" size={16} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </motion.div>
    </div>
  );
}
