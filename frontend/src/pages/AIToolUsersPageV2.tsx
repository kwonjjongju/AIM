import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiSearch, FiPlus, FiEdit2, FiSave, FiXCircle } from 'react-icons/fi';
import { aiToolUsersApi, AIToolUserData } from '../api/aiToolUsers';
import toast from 'react-hot-toast';

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

// 초기 데이터 (DB가 비어있을 때 사용)
const INITIAL_USERS_DATA: AIToolUserData[] = [
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

// 유효성 검사 에러 타입
interface ValidationErrors {
  name?: string;
  email?: string;
  team?: string;
}

export default function AIToolUsersPageV2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [usersData, setUsersData] = useState<AIToolUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 행 편집 상태
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<AIToolUserData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Unsaved changes 모달
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await aiToolUsersApi.getAll();
      if (data.length === 0) {
        setUsersData(INITIAL_USERS_DATA);
      } else {
        setUsersData(data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setUsersData(INITIAL_USERS_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  // 팀 목록 추출 (선택된 본부 기준)
  const teams = [...new Set(
    usersData
      .filter(u => selectedDivision === 'all' || u.division === selectedDivision)
      .map(u => u.team)
      .filter(t => t)
  )];

  // 필터링된 데이터
  const filteredUsers = usersData.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.division.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === 'all' || user.division === selectedDivision;
    const matchesTeam = selectedTeam === 'all' || user.team === selectedTeam;
    return matchesSearch && matchesDivision && matchesTeam;
  });

  // 유효성 검사
  const validate = (data: AIToolUserData): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (!data.name.trim()) {
      errs.name = '이름을 입력해주세요';
    }
    if (!data.email.trim()) {
      errs.email = '계정 ID를 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = '이메일 형식이 아닙니다';
    }
    return errs;
  };

  // 편집 시작
  const handleStartEdit = (user: AIToolUserData) => {
    if (editingRowId !== null && isDirty) {
      setPendingAction(() => () => {
        setEditingRowId(user.id);
        setEditDraft({ ...user });
        setIsDirty(false);
        setErrors({});
      });
      setShowUnsavedModal(true);
      return;
    }
    setEditingRowId(user.id);
    setEditDraft({ ...user });
    setIsDirty(false);
    setErrors({});
  };

  // 편집 취소
  const handleCancelEdit = () => {
    if (isDirty) {
      setPendingAction(() => () => {
        setEditingRowId(null);
        setEditDraft(null);
        setIsDirty(false);
        setErrors({});
      });
      setShowUnsavedModal(true);
      return;
    }
    setEditingRowId(null);
    setEditDraft(null);
    setIsDirty(false);
    setErrors({});
  };

  // 필드 변경
  const handleFieldChange = (field: keyof AIToolUserData, value: string) => {
    if (!editDraft) return;
    const updated = { ...editDraft, [field]: value };
    setEditDraft(updated);
    setIsDirty(true);
    setErrors(validate(updated));
  };

  // AI 툴 토글
  const handleToolToggle = (toolId: string) => {
    if (!editDraft) return;
    const updated = {
      ...editDraft,
      tools: { ...editDraft.tools, [toolId]: !editDraft.tools[toolId as keyof typeof editDraft.tools] }
    };
    setEditDraft(updated);
    setIsDirty(true);
  };

  // 저장
  const handleSave = async () => {
    if (!editDraft) return;

    const validationErrors = validate(editDraft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSaving(true);

      // 로컬 상태 업데이트
      setUsersData(prev => prev.map(u => u.id === editDraft.id ? editDraft : u));

      // API 저장
      const updatedData = usersData.map(u => u.id === editDraft.id ? editDraft : u);
      await aiToolUsersApi.saveAll(updatedData);

      toast.success('저장되었습니다');
      setEditingRowId(null);
      setEditDraft(null);
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  // 신규 등록
  const handleAddUser = () => {
    if (editingRowId !== null && isDirty) {
      setPendingAction(() => () => addNewUser());
      setShowUnsavedModal(true);
      return;
    }
    addNewUser();
  };

  const addNewUser = () => {
    const newId = usersData.length > 0 ? Math.max(...usersData.map(u => u.id)) + 1 : 1;
    const newUser: AIToolUserData = {
      id: newId,
      division: '',
      team: '',
      name: '',
      email: '',
      tools: { skywork: false, gemini: false, chatgpt: false, cursor: false, claude: false },
    };
    setUsersData(prev => [...prev, newUser]);
    setEditingRowId(newId);
    setEditDraft(newUser);
    setIsDirty(false);
    setErrors({});
  };

  // Unsaved modal 처리
  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // 통계 계산
  const stats = AI_TOOLS.map(tool => ({
    ...tool,
    count: usersData.filter(u => u.tools[tool.id as keyof typeof u.tools]).length,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            경신 AI 툴 사용자 현황 (V2)
          </h1>
          <p className="text-gray-500 mt-1">
            총 {usersData.length}명의 AI 툴 사용자 현황 - Row Editing 방식
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
        >
          <FiPlus size={18} />
          신규 등록
        </motion.button>
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
      <div className="flex gap-4 items-center flex-wrap">
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
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setSelectedTeam('all');
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">전체 본부</option>
          {DIVISIONS.map(div => (
            <option key={div} value={div}>{div}</option>
          ))}
        </select>
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
                <th className="px-3 py-3 text-center text-sm font-semibold min-w-[180px]">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const isEditing = editingRowId === user.id;
                const currentData = isEditing && editDraft ? editDraft : user;

                return (
                  <tr
                    key={user.id}
                    className={`
                      border-b border-gray-100 transition-colors
                      ${isEditing ? 'bg-amber-50 ring-2 ring-amber-300 ring-inset' : idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100'}
                    `}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>

                    {/* 본부 */}
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <select
                          value={currentData.division}
                          onChange={(e) => handleFieldChange('division', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="">선택</option>
                          {DIVISIONS.map(div => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-700">{user.division || '-'}</span>
                      )}
                    </td>

                    {/* 팀 */}
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={currentData.team}
                            onChange={(e) => handleFieldChange('team', e.target.value)}
                            placeholder="팀명 입력"
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 bg-white ${errors.team ? 'border-red-400 focus:ring-red-500' : 'border-amber-300 focus:ring-amber-500'}`}
                          />
                          {errors.team && <p className="text-xs text-red-500 mt-0.5">{errors.team}</p>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">{user.team || '-'}</span>
                      )}
                    </td>

                    {/* 사용자 */}
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={currentData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="이름 입력"
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 bg-white ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-amber-300 focus:ring-amber-500'}`}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">{user.name || '-'}</span>
                      )}
                    </td>

                    {/* 계정 ID */}
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={currentData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            placeholder="이메일 입력"
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 bg-white ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-amber-300 focus:ring-amber-500'}`}
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700">{user.email || '-'}</span>
                      )}
                    </td>

                    {/* AI 툴 체크박스 */}
                    {AI_TOOLS.map(tool => (
                      <td key={tool.id} className="px-3 py-3 text-center">
                        {isEditing ? (
                          <button
                            onClick={() => handleToolToggle(tool.id)}
                            className="transition-transform hover:scale-110"
                          >
                            {currentData.tools[tool.id as keyof typeof currentData.tools] ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-100">
                                <FiCheck className="text-teal-600" size={16} />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                                <FiX className="text-gray-400" size={16} />
                              </span>
                            )}
                          </button>
                        ) : (
                          user.tools[tool.id as keyof typeof user.tools] ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-100">
                              <FiCheck className="text-teal-600" size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                              <FiX className="text-gray-400" size={16} />
                            </span>
                          )
                        )}
                      </td>
                    ))}

                    {/* 작업 버튼 */}
                    <td className="px-3 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSave}
                            disabled={isSaving || Object.keys(errors).length > 0}
                            className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white text-sm rounded hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiSave size={14} />
                            {isSaving ? '저장중...' : '저장'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                          >
                            <FiXCircle size={14} />
                            취소
                          </button>
                          {isDirty && (
                            <span className="text-amber-600 text-xs font-medium">변경됨</span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(user)}
                          disabled={editingRowId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                          title={editingRowId !== null ? '편집 중인 행이 있습니다' : '편집'}
                        >
                          <FiEdit2 size={14} />
                          편집
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </motion.div>

      {/* Unsaved Changes 모달 */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              변경사항이 저장되지 않았습니다
            </h3>
            <p className="text-gray-600 mb-6">
              저장하지 않고 이동하면 변경사항이 사라집니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                저장하지 않고 이동
              </button>
              <button
                onClick={handleSaveAndContinue}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                저장 후 이동
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
