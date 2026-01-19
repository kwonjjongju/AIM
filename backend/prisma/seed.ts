import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 상수 정의 (SQLite는 enum 미지원)
const UserRole = {
  EMPLOYEE: 'EMPLOYEE',
  DEPT_MANAGER: 'DEPT_MANAGER',
  EXECUTIVE: 'EXECUTIVE',
  ADMIN: 'ADMIN',
} as const;

const ItemStatus = {
  IDEA: 'IDEA',
  REVIEWING: 'REVIEWING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  DONE: 'DONE',
} as const;

async function main() {
  console.log('🌱 Seeding database...');

  // 기존 데이터 삭제
  await prisma.statusHistory.deleteMany();
  await prisma.itemRelatedDepartment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.improvementItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 8개 본부 생성
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: '관리본부',
        code: 'MGMT',
        color: '#8B5CF6',
      },
    }),
    prisma.department.create({
      data: {
        name: '연구본부',
        code: 'RND',
        color: '#3B82F6',
      },
    }),
    prisma.department.create({
      data: {
        name: '생산기술본부',
        code: 'PTECH',
        color: '#06B6D4',
      },
    }),
    prisma.department.create({
      data: {
        name: '생산본부',
        code: 'PROD',
        color: '#F59E0B',
      },
    }),
    prisma.department.create({
      data: {
        name: '구매본부',
        code: 'PURCH',
        color: '#10B981',
      },
    }),
    prisma.department.create({
      data: {
        name: '전자부품사업본부',
        code: 'ELEC',
        color: '#EC4899',
      },
    }),
    prisma.department.create({
      data: {
        name: '영업본부',
        code: 'SALES',
        color: '#EF4444',
      },
    }),
    prisma.department.create({
      data: {
        name: '품질본부',
        code: 'QA',
        color: '#14B8A6',
      },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  // 비밀번호 해시 생성
  const passwordHash = await bcrypt.hash('password123', 10);

  // 사용자 생성
  const users = await Promise.all([
    // 관리자 (관리본부)
    prisma.user.create({
      data: {
        employeeId: 'EMP001',
        name: '김관리',
        email: 'admin@company.com',
        departmentId: departments[0].id, // 관리본부
        role: UserRole.ADMIN,
        passwordHash,
      },
    }),
    // 경영자 (관리본부)
    prisma.user.create({
      data: {
        employeeId: 'EMP002',
        name: '이경영',
        email: 'exec@company.com',
        departmentId: departments[0].id,
        role: UserRole.EXECUTIVE,
        passwordHash,
      },
    }),
    // 연구본부 담당자
    prisma.user.create({
      data: {
        employeeId: 'EMP003',
        name: '박연구',
        email: 'rnd.manager@company.com',
        departmentId: departments[1].id,
        role: UserRole.DEPT_MANAGER,
        passwordHash,
      },
    }),
    // 생산본부 담당자
    prisma.user.create({
      data: {
        employeeId: 'EMP004',
        name: '최생산',
        email: 'prod.manager@company.com',
        departmentId: departments[3].id,
        role: UserRole.DEPT_MANAGER,
        passwordHash,
      },
    }),
    // 품질본부 담당자
    prisma.user.create({
      data: {
        employeeId: 'EMP005',
        name: '정품질',
        email: 'qa.manager@company.com',
        departmentId: departments[7].id,
        role: UserRole.DEPT_MANAGER,
        passwordHash,
      },
    }),
    // 일반 직원들
    prisma.user.create({
      data: {
        employeeId: 'EMP006',
        name: '홍길동',
        email: 'hong@company.com',
        departmentId: departments[3].id, // 생산본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP007',
        name: '김영희',
        email: 'kim@company.com',
        departmentId: departments[7].id, // 품질본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP008',
        name: '이철수',
        email: 'lee@company.com',
        departmentId: departments[6].id, // 영업본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP009',
        name: '박수진',
        email: 'park@company.com',
        departmentId: departments[1].id, // 연구본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP010',
        name: '조민수',
        email: 'cho@company.com',
        departmentId: departments[4].id, // 구매본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP011',
        name: '강현우',
        email: 'kang@company.com',
        departmentId: departments[5].id, // 전자부품사업본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP012',
        name: '윤서연',
        email: 'yoon@company.com',
        departmentId: departments[2].id, // 생산기술본부
        role: UserRole.EMPLOYEE,
        passwordHash,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 개선 항목 생성
  const items = await Promise.all([
    // 생산본부 항목
    prisma.improvementItem.create({
      data: {
        title: '포장 라인 작업대 높이 조절',
        description: '허리 아파요... 작업대 높이가 너무 낮아서 장시간 서서 일하면 허리에 무리가 갑니다.',
        departmentId: departments[3].id, // 생산본부
        createdBy: users[5].id, // 홍길동
        status: ItemStatus.IDEA,
        statusHistories: {
          create: {
            toStatus: ItemStatus.IDEA,
            changedBy: users[5].id,
          },
        },
      },
    }),
    prisma.improvementItem.create({
      data: {
        title: '생산 일정 공유 게시판 필요',
        description: '매일 아침 생산 일정을 확인하려면 사무실까지 가야 합니다. 현장에서 바로 볼 수 있으면 좋겠어요.',
        departmentId: departments[3].id, // 생산본부
        createdBy: users[3].id, // 최생산
        status: ItemStatus.IN_PROGRESS,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[3].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.REVIEWING, changedBy: users[3].id },
            { fromStatus: ItemStatus.REVIEWING, toStatus: ItemStatus.IN_PROGRESS, changedBy: users[3].id, note: '연구본부와 협의 시작' },
          ],
        },
      },
    }),
    // 품질본부 항목
    prisma.improvementItem.create({
      data: {
        title: '불량품 분류 기준 표준화',
        description: '검수 담당자마다 기준이 달라요. 명확한 가이드라인이 있으면 좋겠습니다.',
        departmentId: departments[7].id, // 품질본부
        createdBy: users[6].id, // 김영희
        status: ItemStatus.REVIEWING,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[6].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.REVIEWING, changedBy: users[4].id, note: '품질본부 전체 회의에서 논의 예정' },
          ],
        },
      },
    }),
    prisma.improvementItem.create({
      data: {
        title: '측정 장비 교체 주기 알림',
        description: '측정 장비 교정 주기를 놓치는 경우가 있어요.',
        departmentId: departments[7].id, // 품질본부
        createdBy: users[4].id, // 정품질
        status: ItemStatus.DONE,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[4].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.IN_PROGRESS, changedBy: users[4].id },
            { fromStatus: ItemStatus.IN_PROGRESS, toStatus: ItemStatus.DONE, changedBy: users[4].id, note: '알림 시스템 구축 완료' },
          ],
        },
      },
    }),
    // 영업본부 항목
    prisma.improvementItem.create({
      data: {
        title: '고객 문의 응대 템플릿 정리',
        description: '자주 묻는 질문에 대한 답변 템플릿이 있으면 신입 교육에도 좋고 응대 시간도 줄일 수 있어요.',
        departmentId: departments[6].id, // 영업본부
        createdBy: users[7].id, // 이철수
        status: ItemStatus.IDEA,
        statusHistories: {
          create: { toStatus: ItemStatus.IDEA, changedBy: users[7].id },
        },
      },
    }),
    prisma.improvementItem.create({
      data: {
        title: '견적서 양식 현대화',
        description: '현재 견적서 양식이 너무 오래됐어요. 회사 이미지에도 안 좋은 것 같습니다.',
        departmentId: departments[6].id, // 영업본부
        createdBy: users[7].id,
        status: ItemStatus.ON_HOLD,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[7].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.REVIEWING, changedBy: users[7].id },
            { fromStatus: ItemStatus.REVIEWING, toStatus: ItemStatus.ON_HOLD, changedBy: users[7].id, note: '브랜드 리뉴얼 프로젝트와 연계 예정' },
          ],
        },
      },
    }),
    // 연구본부 항목
    prisma.improvementItem.create({
      data: {
        title: '실험 데이터 공유 시스템',
        description: '연구 데이터를 팀원들과 쉽게 공유할 수 있는 시스템이 필요합니다.',
        departmentId: departments[1].id, // 연구본부
        createdBy: users[8].id, // 박수진
        status: ItemStatus.IN_PROGRESS,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[8].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.IN_PROGRESS, changedBy: users[2].id, note: '클라우드 시스템 도입 검토 중' },
          ],
        },
      },
    }),
    // 구매본부 항목
    prisma.improvementItem.create({
      data: {
        title: '협력사 평가 기준 개선',
        description: '현재 협력사 평가 기준이 너무 단순해요. 다양한 항목으로 평가할 수 있으면 좋겠습니다.',
        departmentId: departments[4].id, // 구매본부
        createdBy: users[9].id, // 조민수
        status: ItemStatus.IDEA,
        statusHistories: {
          create: { toStatus: ItemStatus.IDEA, changedBy: users[9].id },
        },
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45일 전
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
    }),
    // 전자부품사업본부 항목
    prisma.improvementItem.create({
      data: {
        title: '부품 재고 관리 자동화',
        description: '수작업으로 재고를 관리하다 보니 오류가 자주 발생합니다.',
        departmentId: departments[5].id, // 전자부품사업본부
        createdBy: users[10].id, // 강현우
        status: ItemStatus.REVIEWING,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[10].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.REVIEWING, changedBy: users[10].id },
          ],
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60일 전
        updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35일 전 마지막 업데이트
      },
    }),
    // 생산기술본부 항목
    prisma.improvementItem.create({
      data: {
        title: '설비 점검 체크리스트 디지털화',
        description: '종이로 관리하는 점검 체크리스트를 태블릿으로 바꾸면 좋겠어요.',
        departmentId: departments[2].id, // 생산기술본부
        createdBy: users[11].id, // 윤서연
        status: ItemStatus.DONE,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[11].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.IN_PROGRESS, changedBy: users[11].id },
            { fromStatus: ItemStatus.IN_PROGRESS, toStatus: ItemStatus.DONE, changedBy: users[11].id, note: '태블릿 앱 배포 완료' },
          ],
        },
      },
    }),
    // 관리본부 항목
    prisma.improvementItem.create({
      data: {
        title: '회의실 예약 시스템 개선',
        description: '현재 엑셀로 관리하는데 불편합니다. 온라인 예약 시스템이 있으면 좋겠어요.',
        departmentId: departments[0].id, // 관리본부
        createdBy: users[0].id, // 김관리
        status: ItemStatus.REVIEWING,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[0].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.REVIEWING, changedBy: users[0].id },
          ],
        },
      },
    }),
    prisma.improvementItem.create({
      data: {
        title: '비품 신청 프로세스 간소화',
        description: '비품 하나 신청하는데 서류가 너무 많아요.',
        departmentId: departments[0].id, // 관리본부
        createdBy: users[0].id,
        status: ItemStatus.DONE,
        statusHistories: {
          create: [
            { toStatus: ItemStatus.IDEA, changedBy: users[0].id },
            { fromStatus: ItemStatus.IDEA, toStatus: ItemStatus.IN_PROGRESS, changedBy: users[0].id },
            { fromStatus: ItemStatus.IN_PROGRESS, toStatus: ItemStatus.DONE, changedBy: users[0].id, note: '전자결재 시스템 연동 완료' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} improvement items`);

  console.log('✅ Seeding completed!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('  Admin:      admin@company.com / password123');
  console.log('  Executive:  exec@company.com / password123');
  console.log('  Employee:   hong@company.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
