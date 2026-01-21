import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiList, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi, ExcelPreviewItem } from '../api/upload';
import toast from 'react-hot-toast';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelUploadModal({ isOpen, onClose }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [preview, setPreview] = useState<ExcelPreviewItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const previewMutation = useMutation({
    mutationFn: (file: File) => uploadApi.previewExcel(file),
    onSuccess: (data) => {
      setSheets(data.sheets);
      setSelectedSheets(data.sheets.filter(s => !s.includes('요약') && !s.includes('기타') && !s.includes('취합')));
      setPreview(data.preview);
      setStep('preview');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || '파일 처리 중 오류가 발생했습니다.');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, sheets }: { file: File; sheets: string[] }) => uploadApi.uploadExcel(file, sheets),
    onSuccess: (data) => {
      setResult({ created: data.created, skipped: data.skipped, errors: data.errors });
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`${data.created}개 항목이 등록되었습니다! 📊`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || '업로드 중 오류가 발생했습니다.');
    },
  });

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setSheets([]);
    setSelectedSheets([]);
    setPreview([]);
    setExpandedItems(new Set());
    setResult(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewMutation.mutate(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      previewMutation.mutate(droppedFile);
    } else {
      toast.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  const handleUpload = () => {
    if (file && selectedSheets.length > 0) {
      uploadMutation.mutate({ file, sheets: selectedSheets });
    }
  };

  const toggleSheet = (sheet: string) => {
    setSelectedSheets(prev =>
      prev.includes(sheet)
        ? prev.filter(s => s !== sheet)
        : [...prev, sheet]
    );
  };

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // 선택된 시트의 아이템만 필터링
  const filteredPreview = preview.filter(item => {
    const deptSheet = sheets.find(s => 
      item.departmentName.includes(s.split('_')[0]) || 
      s.includes(item.departmentName.split(' ')[0])
    );
    return !deptSheet || selectedSheets.includes(deptSheet);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800">
                    엑셀 파일 업로드
                  </h2>
                  <p className="text-xs text-gray-500">
                    엑셀 파일에서 개선과제를 일괄 등록합니다
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

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: 파일 업로드 */}
              {step === 'upload' && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    previewMutation.isPending
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {previewMutation.isPending ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
                      <p className="text-gray-600">파일 분석 중...</p>
                    </div>
                  ) : (
                    <>
                      <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        엑셀 파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-sm text-gray-500">
                        지원 형식: .xlsx, .xls (최대 10MB)
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: 미리보기 */}
              {step === 'preview' && (
                <div className="space-y-6">
                  {/* 파일 정보 */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FiFile size={24} className="text-emerald-500" />
                    <div>
                      <p className="font-medium text-gray-700">{file?.name}</p>
                      <p className="text-xs text-gray-500">
                        {sheets.length}개 시트 · {preview.length}개 과제 발견
                      </p>
                    </div>
                  </div>

                  {/* 시트 선택 */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">시트 선택</h3>
                    <div className="flex flex-wrap gap-2">
                      {sheets.map((sheet) => (
                        <button
                          key={sheet}
                          onClick={() => toggleSheet(sheet)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedSheets.includes(sheet)
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                          }`}
                        >
                          {sheet}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 미리보기 목록 */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      등록될 과제 미리보기 ({filteredPreview.length}개)
                    </h3>
                    <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                      {filteredPreview.slice(0, 50).map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <button
                            onClick={() => toggleItem(idx)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                          >
                            {expandedItems.has(idx) ? (
                              <FiChevronDown className="text-gray-400 flex-shrink-0" />
                            ) : (
                              <FiChevronRight className="text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-700 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.departmentName}
                                {item.managerName && ` · ${item.managerName}`}
                              </p>
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedItems.has(idx) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-10 pb-3 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50">
                                  {item.description || '(설명 없음)'}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      
                      {filteredPreview.length > 50 && (
                        <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                          외 {filteredPreview.length - 50}개 항목...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: 결과 */}
              {step === 'result' && result && (
                <div className="text-center py-8">
                  <FiCheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    업로드 완료!
                  </h3>
                  <div className="flex justify-center gap-8 my-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{result.created}</p>
                      <p className="text-sm text-gray-500">등록됨</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-400">{result.skipped}</p>
                      <p className="text-sm text-gray-500">건너뜀 (중복)</p>
                    </div>
                  </div>
                  
                  {result.errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                      <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                        <FiAlertCircle />
                        <span>오류 발생 ({result.errors.length}건)</span>
                      </div>
                      <ul className="text-sm text-red-500 list-disc list-inside">
                        {result.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>외 {result.errors.length - 5}건...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
              {step === 'upload' && (
                <p className="text-xs text-gray-500">
                  본부별 업무개선SW개발리스트 엑셀 파일을 업로드하세요
                </p>
              )}
              
              {step === 'preview' && (
                <p className="text-xs text-gray-500">
                  선택된 시트: {selectedSheets.length}개 · 등록 예정: {filteredPreview.length}개
                </p>
              )}
              
              {step === 'result' && (
                <p className="text-xs text-gray-500">
                  대시보드에서 등록된 항목을 확인하세요
                </p>
              )}

              <div className="flex gap-3">
                {step === 'preview' && (
                  <>
                    <button
                      onClick={() => {
                        setStep('upload');
                        setFile(null);
                      }}
                      className="btn-secondary"
                    >
                      다시 선택
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending || selectedSheets.length === 0}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiList size={16} />
                      {uploadMutation.isPending ? '등록 중...' : `${filteredPreview.length}개 등록`}
                    </button>
                  </>
                )}
                
                {step === 'result' && (
                  <button onClick={handleClose} className="btn-primary">
                    완료
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
