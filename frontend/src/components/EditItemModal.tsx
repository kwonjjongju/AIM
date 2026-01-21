import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useAuthStore } from '../store/authStore';
import { ImprovementItemDetail } from '../types';
import toast from 'react-hot-toast';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ImprovementItemDetail | null;
}

// 섹션 상태 타입
interface SectionState {
  [key: string]: boolean;
}

// 폼 데이터 타입
interface FormData {
  taskName: string;
  taskDescription: string;
  taskCategory: string;
  taskFrequency: string;
  currentMethod: string;
  currentMethodDetail: string;
  currentDuration: string;
  participantCount: string;
  mainProblem: string;
  improvementReason: string;
  developmentPurpose: string;
  expectedEffectQuantitative: string;
  expectedEffectQualitative: string;
  automationLevel: string;
  inputDataSource: string;
  inputDataFormat: string;
  inputDataFrequency: string;
  outputDataFormat: string;
  outputDataUsage: string;
  preferredImplementation: string;
  guiRequired: string;
  webBased: string;
  coreEngine: string;
  deploymentEnvironment: string;
  targetDevice: string;
  securityLevel: string;
  primaryUserRole: string;
  expectedUserCount: string;
  usageScope: string;
  crossDepartmentPossibility: string;
  importance: string;
  targetCompletionDate: string;
  otherConstraints: string;
}

const initialFormData: FormData = {
  taskName: '',
  taskDescription: '',
  taskCategory: '',
  taskFrequency: '',
  currentMethod: '',
  currentMethodDetail: '',
  currentDuration: '',
  participantCount: '',
  mainProblem: '',
  improvementReason: '',
  developmentPurpose: '',
  expectedEffectQuantitative: '',
  expectedEffectQualitative: '',
  automationLevel: '',
  inputDataSource: '',
  inputDataFormat: '',
  inputDataFrequency: '',
  outputDataFormat: '',
  outputDataUsage: '',
  preferredImplementation: '',
  guiRequired: '',
  webBased: '',
  coreEngine: '',
  deploymentEnvironment: '',
  targetDevice: '',
  securityLevel: '',
  primaryUserRole: '',
  expectedUserCount: '',
  usageScope: '',
  crossDepartmentPossibility: '',
  importance: '',
  targetCompletionDate: '',
  otherConstraints: '',
};

// 섹션 정의
const sections = [
  { id: 'basic', title: '① 기본 정보', icon: '📋', required: true },
  { id: 'status', title: '② 현황 & 문제점', icon: '🔍', required: true },
  { id: 'goal', title: '③ 개발 목적 & 기대효과', icon: '🎯', required: true },
  { id: 'data', title: '④ 입력/출력 데이터', icon: '💾', required: false },
  { id: 'tech', title: '⑤ 기술/구현 방식', icon: '⚙️', required: false },
  { id: 'infra', title: '⑥ 인프라/운영 환경', icon: '🖥️', required: false },
  { id: 'user', title: '⑦ 사용자 & 확장성', icon: '👥', required: false },
  { id: 'priority', title: '⑧ 우선순위 & 제약사항', icon: '⚡', required: false },
];

// 설명에서 폼 데이터 파싱
const parseDescriptionToFormData = (description: string | undefined): Partial<FormData> => {
  if (!description) return {};
  
  const result: Partial<FormData> = {};
  const lines = description.split('\n');
  
  const fieldMap: Record<string, keyof FormData> = {
    '업무내용': 'taskDescription',
    '현재방식': 'currentMethod',
    '소요시간': 'currentDuration',
    '참여인원': 'participantCount',
    '문제점': 'mainProblem',
    '개선사유': 'improvementReason',
    '개발목적': 'developmentPurpose',
    '기대효과(정량)': 'expectedEffectQuantitative',
    '기대효과(정성)': 'expectedEffectQualitative',
    '자동화수준': 'automationLevel',
    '입력데이터': 'inputDataSource',
    '출력데이터': 'outputDataFormat',
    '구현방식': 'preferredImplementation',
    '핵심기술': 'coreEngine',
    '배포환경': 'deploymentEnvironment',
    '디바이스': 'targetDevice',
    '사용자': 'primaryUserRole',
    '사용범위': 'usageScope',
    '중요도': 'importance',
    '희망완료': 'targetCompletionDate',
    '기타': 'otherConstraints',
  };
  
  lines.forEach(line => {
    const match = line.match(/^\[(.+?)\]\s*(.+)$/);
    if (match) {
      const label = match[1];
      let value = match[2];
      
      // 현재방식에서 상세 정보 분리
      if (label === '현재방식') {
        const detailMatch = value.match(/^(.+?)\s*\((.+)\)$/);
        if (detailMatch) {
          result.currentMethod = detailMatch[1];
          result.currentMethodDetail = detailMatch[2];
        } else {
          result.currentMethod = value;
        }
      }
      // 참여인원에서 '명' 제거
      else if (label === '참여인원') {
        result.participantCount = value.replace('명', '');
      }
      // 사용자에서 인원수 분리
      else if (label === '사용자') {
        const userMatch = value.match(/^(.+?)\s*\((\d+)명\)$/);
        if (userMatch) {
          result.primaryUserRole = userMatch[1];
          result.expectedUserCount = userMatch[2];
        } else {
          result.primaryUserRole = value;
        }
      }
      // 입력데이터에서 형식 분리
      else if (label === '입력데이터') {
        const parts = value.split(' / ');
        result.inputDataSource = parts[0] || '';
        result.inputDataFormat = parts[1] || '';
      }
      // 출력데이터에서 사용처 분리
      else if (label === '출력데이터') {
        const parts = value.split(' → ');
        result.outputDataFormat = parts[0] || '';
        result.outputDataUsage = parts[1] || '';
      }
      // 일반 필드
      else {
        const fieldKey = fieldMap[label];
        if (fieldKey) {
          result[fieldKey] = value;
        }
      }
    }
  });
  
  return result;
};

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [expandedSections, setExpandedSections] = useState<SectionState>({
    basic: true,
    status: true,
    goal: true,
    data: false,
    tech: false,
    infra: false,
    user: false,
    priority: false,
  });
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 아이템 데이터로 폼 초기화
  useEffect(() => {
    if (item && isOpen) {
      const parsed = parseDescriptionToFormData(item.description);
      setFormData({
        ...initialFormData,
        taskName: item.title,
        ...parsed,
      });
    }
  }, [item, isOpen]);

  const updateMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      itemsApi.updateItem(item!.id, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', item?.id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('수정되었습니다! ✏️');
      handleClose();
    },
    onError: () => {
      toast.error('수정에 실패했습니다');
    },
  });

  const handleClose = () => {
    setFormData(initialFormData);
    setExpandedSections({ basic: true, status: true, goal: true, data: false, tech: false, infra: false, user: false, priority: false });
    onClose();
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName.trim()) {
      toast.error('업무명을 입력해주세요');
      return;
    }

    // 상세 설명 조합
    const descriptionParts = [];
    
    if (formData.taskDescription) descriptionParts.push(`[업무내용] ${formData.taskDescription}`);
    if (formData.currentMethod) descriptionParts.push(`[현재방식] ${formData.currentMethod}${formData.currentMethodDetail ? ` (${formData.currentMethodDetail})` : ''}`);
    if (formData.currentDuration) descriptionParts.push(`[소요시간] ${formData.currentDuration}`);
    if (formData.participantCount) descriptionParts.push(`[참여인원] ${formData.participantCount}명`);
    if (formData.mainProblem) descriptionParts.push(`[문제점] ${formData.mainProblem}`);
    if (formData.improvementReason) descriptionParts.push(`[개선사유] ${formData.improvementReason}`);
    if (formData.developmentPurpose) descriptionParts.push(`[개발목적] ${formData.developmentPurpose}`);
    if (formData.expectedEffectQuantitative) descriptionParts.push(`[기대효과(정량)] ${formData.expectedEffectQuantitative}`);
    if (formData.expectedEffectQualitative) descriptionParts.push(`[기대효과(정성)] ${formData.expectedEffectQualitative}`);
    if (formData.automationLevel) descriptionParts.push(`[자동화수준] ${formData.automationLevel}`);
    if (formData.inputDataSource) descriptionParts.push(`[입력데이터] ${formData.inputDataSource} / ${formData.inputDataFormat || '-'}`);
    if (formData.outputDataFormat) descriptionParts.push(`[출력데이터] ${formData.outputDataFormat}${formData.outputDataUsage ? ` → ${formData.outputDataUsage}` : ''}`);
    if (formData.preferredImplementation) descriptionParts.push(`[구현방식] ${formData.preferredImplementation}`);
    if (formData.coreEngine) descriptionParts.push(`[핵심기술] ${formData.coreEngine}`);
    if (formData.deploymentEnvironment) descriptionParts.push(`[배포환경] ${formData.deploymentEnvironment}`);
    if (formData.targetDevice) descriptionParts.push(`[디바이스] ${formData.targetDevice}`);
    if (formData.primaryUserRole) descriptionParts.push(`[사용자] ${formData.primaryUserRole} ${formData.expectedUserCount ? `(${formData.expectedUserCount}명)` : ''}`);
    if (formData.usageScope) descriptionParts.push(`[사용범위] ${formData.usageScope}`);
    if (formData.importance) descriptionParts.push(`[중요도] ${formData.importance}`);
    if (formData.targetCompletionDate) descriptionParts.push(`[희망완료] ${formData.targetCompletionDate}`);
    if (formData.otherConstraints) descriptionParts.push(`[기타] ${formData.otherConstraints}`);

    updateMutation.mutate({
      title: formData.taskName.trim(),
      description: descriptionParts.join('\n') || undefined,
    });
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const selectClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-4 -translate-x-1/2 w-full max-w-2xl max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✏️</span>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800">
                    과제 수정
                  </h2>
                  <p className="text-xs text-gray-500">
                    {user?.department.name} · {user?.name}
                  </p>
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                        expandedSections[section.id] ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{section.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{section.title}</span>
                        {section.required && (
                          <span className="text-xs text-red-500">필수</span>
                        )}
                      </div>
                      {expandedSections[section.id] ? (
                        <FiChevronDown className="text-gray-400" />
                      ) : (
                        <FiChevronRight className="text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections[section.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 bg-white border-t border-gray-100 space-y-3">
                            {/* ① 기본 정보 */}
                            {section.id === 'basic' && (
                              <>
                                <div>
                                  <label className={labelClass}>
                                    업무명 <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.taskName}
                                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>업무 내용 (자세히)</label>
                                  <textarea
                                    value={formData.taskDescription}
                                    onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                                    className={`${inputClass} min-h-[80px] resize-none`}
                                    rows={3}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>업무 분류</label>
                                    <select
                                      value={formData.taskCategory}
                                      onChange={(e) => handleInputChange('taskCategory', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="정기">정기</option>
                                      <option value="비정기">비정기</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>업무 빈도</label>
                                    <input
                                      type="text"
                                      value={formData.taskFrequency}
                                      onChange={(e) => handleInputChange('taskFrequency', e.target.value)}
                                      placeholder="예: 월 1회"
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* ② 현황 & 문제점 */}
                            {section.id === 'status' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>현재 업무 방식</label>
                                    <select
                                      value={formData.currentMethod}
                                      onChange={(e) => handleInputChange('currentMethod', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="수기">수기</option>
                                      <option value="엑셀">엑셀</option>
                                      <option value="시스템">시스템</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>상세 (사용 도구)</label>
                                    <input
                                      type="text"
                                      value={formData.currentMethodDetail}
                                      onChange={(e) => handleInputChange('currentMethodDetail', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>현재 소요 시간</label>
                                    <input
                                      type="text"
                                      value={formData.currentDuration}
                                      onChange={(e) => handleInputChange('currentDuration', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClass}>참여 인원 수</label>
                                    <input
                                      type="number"
                                      value={formData.participantCount}
                                      onChange={(e) => handleInputChange('participantCount', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className={labelClass}>주요 문제점</label>
                                  <textarea
                                    value={formData.mainProblem}
                                    onChange={(e) => handleInputChange('mainProblem', e.target.value)}
                                    className={`${inputClass} min-h-[60px] resize-none`}
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>개선 필요 사유</label>
                                  <input
                                    type="text"
                                    value={formData.improvementReason}
                                    onChange={(e) => handleInputChange('improvementReason', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                              </>
                            )}

                            {/* ③ 개발 목적 & 기대효과 */}
                            {section.id === 'goal' && (
                              <>
                                <div>
                                  <label className={labelClass}>개발 목적</label>
                                  <input
                                    type="text"
                                    value={formData.developmentPurpose}
                                    onChange={(e) => handleInputChange('developmentPurpose', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>기대 효과 (정량)</label>
                                  <input
                                    type="text"
                                    value={formData.expectedEffectQuantitative}
                                    onChange={(e) => handleInputChange('expectedEffectQuantitative', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>기대 효과 (정성)</label>
                                  <input
                                    type="text"
                                    value={formData.expectedEffectQualitative}
                                    onChange={(e) => handleInputChange('expectedEffectQualitative', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>자동화 수준</label>
                                  <select
                                    value={formData.automationLevel}
                                    onChange={(e) => handleInputChange('automationLevel', e.target.value)}
                                    className={selectClass}
                                  >
                                    <option value="">선택</option>
                                    <option value="부분 자동화">부분 자동화</option>
                                    <option value="전체 자동화">전체 자동화</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* ④ 입력/출력 데이터 */}
                            {section.id === 'data' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>입력 데이터 출처</label>
                                    <select
                                      value={formData.inputDataSource}
                                      onChange={(e) => handleInputChange('inputDataSource', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="시스템">시스템</option>
                                      <option value="파일">파일</option>
                                      <option value="DB">DB</option>
                                      <option value="API">API</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>입력 데이터 형태</label>
                                    <select
                                      value={formData.inputDataFormat}
                                      onChange={(e) => handleInputChange('inputDataFormat', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="엑셀">엑셀</option>
                                      <option value="DB">DB</option>
                                      <option value="API">API</option>
                                      <option value="PPT">PPT</option>
                                      <option value="PDF">PDF</option>
                                      <option value="이미지">이미지</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>출력 데이터 형태</label>
                                    <select
                                      value={formData.outputDataFormat}
                                      onChange={(e) => handleInputChange('outputDataFormat', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="엑셀">엑셀</option>
                                      <option value="DB">DB</option>
                                      <option value="웹">웹</option>
                                      <option value="PPT">PPT</option>
                                      <option value="PDF">PDF</option>
                                      <option value="리포트">리포트</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>출력 데이터 사용처</label>
                                    <input
                                      type="text"
                                      value={formData.outputDataUsage}
                                      onChange={(e) => handleInputChange('outputDataUsage', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* ⑤ 기술/구현 방식 */}
                            {section.id === 'tech' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>선호 구현 방식</label>
                                    <select
                                      value={formData.preferredImplementation}
                                      onChange={(e) => handleInputChange('preferredImplementation', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="SW 개발">SW 개발</option>
                                      <option value="태블로 대시보드">태블로 대시보드</option>
                                      <option value="RPA">RPA</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>GUI 필요 여부</label>
                                    <select
                                      value={formData.guiRequired}
                                      onChange={(e) => handleInputChange('guiRequired', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="Y">필요</option>
                                      <option value="N">불필요</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className={labelClass}>핵심 기술/엔진</label>
                                  <input
                                    type="text"
                                    value={formData.coreEngine}
                                    onChange={(e) => handleInputChange('coreEngine', e.target.value)}
                                    className={inputClass}
                                  />
                                </div>
                              </>
                            )}

                            {/* ⑥ 인프라/운영 환경 */}
                            {section.id === 'infra' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>배포 환경</label>
                                    <select
                                      value={formData.deploymentEnvironment}
                                      onChange={(e) => handleInputChange('deploymentEnvironment', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="개인PC">개인PC</option>
                                      <option value="온프레미스">온프레미스 서버</option>
                                      <option value="클라우드">클라우드</option>
                                      <option value="기타">기타</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>사용 디바이스</label>
                                    <select
                                      value={formData.targetDevice}
                                      onChange={(e) => handleInputChange('targetDevice', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="PC">PC</option>
                                      <option value="모바일">모바일</option>
                                      <option value="PC/모바일">PC + 모바일</option>
                                      <option value="태블릿">태블릿</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className={labelClass}>보안 민감도</label>
                                  <select
                                    value={formData.securityLevel}
                                    onChange={(e) => handleInputChange('securityLevel', e.target.value)}
                                    className={selectClass}
                                  >
                                    <option value="">선택</option>
                                    <option value="상">상 (기밀 데이터)</option>
                                    <option value="중">중 (내부 데이터)</option>
                                    <option value="하">하 (공개 가능)</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* ⑦ 사용자 & 확장성 */}
                            {section.id === 'user' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>주요 사용자 직무</label>
                                    <input
                                      type="text"
                                      value={formData.primaryUserRole}
                                      onChange={(e) => handleInputChange('primaryUserRole', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClass}>예상 사용자 수</label>
                                    <input
                                      type="number"
                                      value={formData.expectedUserCount}
                                      onChange={(e) => handleInputChange('expectedUserCount', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className={labelClass}>사용 범위</label>
                                  <select
                                    value={formData.usageScope}
                                    onChange={(e) => handleInputChange('usageScope', e.target.value)}
                                    className={selectClass}
                                  >
                                    <option value="">선택</option>
                                    <option value="팀내">팀내</option>
                                    <option value="부서간">부서간</option>
                                    <option value="전사">전사</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {/* ⑧ 우선순위 & 제약사항 */}
                            {section.id === 'priority' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelClass}>중요도</label>
                                    <select
                                      value={formData.importance}
                                      onChange={(e) => handleInputChange('importance', e.target.value)}
                                      className={selectClass}
                                    >
                                      <option value="">선택</option>
                                      <option value="상">상</option>
                                      <option value="중">중</option>
                                      <option value="하">하</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>희망 완료 시점</label>
                                    <input
                                      type="date"
                                      value={formData.targetCompletionDate}
                                      onChange={(e) => handleInputChange('targetCompletionDate', e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className={labelClass}>기타 제약사항</label>
                                  <textarea
                                    value={formData.otherConstraints}
                                    onChange={(e) => handleInputChange('otherConstraints', e.target.value)}
                                    className={`${inputClass} min-h-[60px] resize-none`}
                                    rows={2}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* 버튼 */}
              <div className="sticky bottom-0 flex justify-between items-center gap-3 px-6 py-4 bg-white border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  <span className="text-red-500">*</span> 필수 입력 항목
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave size={16} />
                    {updateMutation.isPending ? '저장 중...' : '수정 완료'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
