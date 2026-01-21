import * as XLSX from 'xlsx';
import { prisma } from '../config/database';

interface ParsedItem {
  title: string;
  description: string;
  departmentName: string;
  managerName?: string;
  managerEmail?: string;
}

// 시트에서 과제 데이터 추출
const parseSheet = (ws: XLSX.WorkSheet, sheetName: string): ParsedItem[] => {
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
  const items: ParsedItem[] = [];
  
  if (data.length < 10) return items;
  
  // Row indices (0-based)
  const ROW_DEPT = 2;      // 부서명
  const ROW_MANAGER = 3;   // 담당자명
  const ROW_EMAIL = 4;     // 담당자 이메일
  const ROW_TASK_NAME = 5; // 업무명
  const ROW_TASK_DESC = 6; // 업무 내용
  const ROW_TASK_TYPE = 7; // 업무 분류 (정기/비정기)
  const ROW_FREQUENCY = 8; // 업무 빈도
  const ROW_CURRENT = 9;   // 현재 업무 방식
  
  // 추가 행들 (시트마다 다를 수 있음)
  const ROW_DURATION = 10;  // 현재 소요 시간
  const ROW_PARTICIPANT = 11; // 참여 인원
  const ROW_PROBLEM = 12;   // 주요 문제점
  const ROW_REASON = 13;    // 개선 필요 사유
  const ROW_PURPOSE = 14;   // 개발 목적
  const ROW_EFFECT_QUANT = 15; // 기대 효과 (정량)
  const ROW_EFFECT_QUAL = 16;  // 기대 효과 (정성)
  const ROW_AUTOMATION = 17;   // 자동화 수준
  const ROW_INPUT = 18;     // 입력 데이터
  const ROW_OUTPUT = 19;    // 출력 데이터
  
  // Column 3부터 과제 시작 (0: 구분, 1: Column Name, 2: 설명)
  const startCol = 3;
  const row1 = data[1] || [];
  
  for (let col = startCol; col < row1.length; col++) {
    const taskName = data[ROW_TASK_NAME]?.[col];
    
    if (!taskName || typeof taskName !== 'string' || !taskName.trim()) {
      continue;
    }
    
    const deptName = data[ROW_DEPT]?.[col] || sheetName;
    const managerName = data[ROW_MANAGER]?.[col];
    const managerEmail = data[ROW_EMAIL]?.[col];
    const taskDesc = data[ROW_TASK_DESC]?.[col];
    const taskType = data[ROW_TASK_TYPE]?.[col];
    const frequency = data[ROW_FREQUENCY]?.[col];
    const currentMethod = data[ROW_CURRENT]?.[col];
    const duration = data[ROW_DURATION]?.[col];
    const participant = data[ROW_PARTICIPANT]?.[col];
    const problem = data[ROW_PROBLEM]?.[col];
    const reason = data[ROW_REASON]?.[col];
    const purpose = data[ROW_PURPOSE]?.[col];
    const effectQuant = data[ROW_EFFECT_QUANT]?.[col];
    const effectQual = data[ROW_EFFECT_QUAL]?.[col];
    const automation = data[ROW_AUTOMATION]?.[col];
    const input = data[ROW_INPUT]?.[col];
    const output = data[ROW_OUTPUT]?.[col];
    
    // 설명 조합
    const descriptionParts: string[] = [];
    if (taskDesc) descriptionParts.push(`[업무내용] ${taskDesc}`);
    if (currentMethod) descriptionParts.push(`[현재방식] ${currentMethod}`);
    if (duration) descriptionParts.push(`[소요시간] ${duration}`);
    if (participant) descriptionParts.push(`[참여인원] ${participant}`);
    if (problem) descriptionParts.push(`[문제점] ${problem}`);
    if (reason) descriptionParts.push(`[개선사유] ${reason}`);
    if (purpose) descriptionParts.push(`[개발목적] ${purpose}`);
    if (effectQuant) descriptionParts.push(`[기대효과(정량)] ${effectQuant}`);
    if (effectQual) descriptionParts.push(`[기대효과(정성)] ${effectQual}`);
    if (automation) descriptionParts.push(`[자동화수준] ${automation}`);
    if (input) descriptionParts.push(`[입력데이터] ${input}`);
    if (output) descriptionParts.push(`[출력데이터] ${output}`);
    if (taskType) descriptionParts.push(`[업무분류] ${taskType}`);
    if (frequency) descriptionParts.push(`[업무빈도] ${frequency}`);
    
    items.push({
      title: taskName.trim(),
      description: descriptionParts.join('\n'),
      departmentName: typeof deptName === 'string' ? deptName.split('\r\n')[0].split('\n')[0].trim() : sheetName,
      managerName: typeof managerName === 'string' ? managerName : undefined,
      managerEmail: typeof managerEmail === 'string' ? managerEmail : undefined,
    });
  }
  
  return items;
};

// 부서명 매핑 (엑셀 시트명 → DB 부서명)
const departmentMapping: Record<string, string> = {
  '관리총괄': '관리본부',
  '생산기술본부': '생산기술본부',
  '생산본부': '생산본부',
  '연구본부': '연구본부',
  '영업본부': '영업본부',
  '전자부품사업본부': '전자부품사업본부',
  '품질본부': '품질본부',
  '구매본부': '구매본부',
};

export const uploadService = {
  // 엑셀 파일 파싱 및 아이템 생성
  async processExcelFile(
    buffer: Buffer,
    userId: string,
    options: { preview?: boolean; targetSheets?: string[] } = {}
  ): Promise<{ created: number; skipped: number; errors: string[]; preview?: ParsedItem[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const allItems: ParsedItem[] = [];
    const errors: string[] = [];
    
    // 처리할 시트 필터링
    const sheetsToProcess = options.targetSheets?.length
      ? wb.SheetNames.filter(name => options.targetSheets!.includes(name))
      : wb.SheetNames.filter(name => 
          !name.includes('요약') && 
          !name.includes('기타') && 
          !name.includes('취합')
        );
    
    for (const sheetName of sheetsToProcess) {
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;
      
      try {
        const items = parseSheet(ws, sheetName);
        allItems.push(...items);
      } catch (err: any) {
        errors.push(`시트 "${sheetName}" 처리 오류: ${err.message}`);
      }
    }
    
    // 미리보기 모드
    if (options.preview) {
      return { created: 0, skipped: 0, errors, preview: allItems };
    }
    
    // 실제 생성
    let created = 0;
    let skipped = 0;
    
    for (const item of allItems) {
      try {
        // 부서 찾기
        const mappedDeptName = departmentMapping[item.departmentName] || item.departmentName;
        let department = await prisma.department.findFirst({
          where: {
            OR: [
              { name: mappedDeptName },
              { name: { contains: mappedDeptName.split(' ')[0] } },
            ],
          },
        });
        
        // 부서가 없으면 기본 부서 사용
        if (!department) {
          department = await prisma.department.findFirst();
        }
        
        if (!department) {
          errors.push(`부서를 찾을 수 없음: ${item.departmentName}`);
          skipped++;
          continue;
        }
        
        // 중복 체크 (같은 제목 + 같은 부서)
        const existing = await prisma.improvementItem.findFirst({
          where: {
            title: item.title,
            departmentId: department.id,
          },
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // 아이템 생성
        await prisma.improvementItem.create({
          data: {
            title: item.title,
            description: item.description || undefined,
            status: 'IDEA',
            departmentId: department.id,
            createdById: userId,
            statusHistory: {
              create: {
                toStatus: 'IDEA',
                changedById: userId,
                note: '엑셀 업로드로 자동 등록',
              },
            },
          },
        });
        
        created++;
      } catch (err: any) {
        errors.push(`"${item.title}" 생성 오류: ${err.message}`);
        skipped++;
      }
    }
    
    return { created, skipped, errors };
  },
  
  // 엑셀 시트 목록 조회
  async getSheetNames(buffer: Buffer): Promise<string[]> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    return wb.SheetNames;
  },
};
