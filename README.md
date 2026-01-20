# 업무 개선 보드 (Fix-it Board) 📋

화이트보드 + 포스트잇을 온라인으로 옮긴 캐주얼 업무 개선 리스트 시스템입니다.

> **핵심 철학**: 성과관리가 아닌 **리스트 관리**

## 🎯 주요 기능

- **개선 항목 등록**: "뭐가 불편한가요?" - 부담 없이 등록
- **5단계 상태 관리**: 💡 떠올림 → 👀 보고 있음 → 🛠️ 만지는 중 → ⏸️ 잠깐 멈춤 → ✅ 정리됨
- **부서별 보드 뷰**: 탭으로 부서별 현황 확인
- **대시보드**: 전체 현황, 부서별 통계, 오래된 항목 하이라이트
- **권한 기반 접근**: 직원/부서담당자/경영자/관리자 역할별 권한

## 🛠️ 기술 스택

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 인증 (HttpOnly Cookie)

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query (TanStack Query)
- Framer Motion
- Recharts

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL 14+
- pnpm (권장) 또는 npm

### 1. 저장소 클론
```bash
git clone <repository-url>
cd AIM
```

### 2. Backend 설정

```bash
cd backend

# 패키지 설치
npm install

# 환경변수 설정 (.env 파일 생성)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/aim_db?schema=public"
# JWT_SECRET="your-secret-key"
# JWT_REFRESH_SECRET="your-refresh-secret-key"
# PORT=4000
# CORS_ORIGIN="http://localhost:5173"

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 동기화
npm run db:push

# 시드 데이터 생성
npm run db:seed

# 개발 서버 실행
npm run dev
```

### 3. Frontend 설정

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/v1

### 테스트 계정
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@company.com | password123 |
| 경영자 | exec@company.com | password123 |
| 부서담당자 | prod.manager@company.com | password123 |
| 일반직원 | hong@company.com | password123 |

## 📂 프로젝트 구조

```
AIM/
├── 0_SPEC/              # 설계 문서
│   ├── 00_브레인스토밍/
│   ├── 01_requirements/
│   ├── 02_design/
│   ├── 03_system_guards/
│   ├── 04_mvp/
│   ├── 05_tasks/
│   └── 06_verification/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── index.ts
└── frontend/
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── store/
        ├── types/
        └── main.tsx
```

## 🔐 권한 매트릭스

| 권한 | 조회 | 등록 | 수정 | 삭제 |
|------|------|------|------|------|
| 일반 직원 | 전체 | 본인 | 본인 | 본인 |
| 부서 담당자 | 전체 | 본인 | 부서 내 | 부서 내 |
| 경영자 | 전체 | ❌ | ❌ | ❌ |
| 시스템 관리자 | 전체 | 전체 | 전체 | 전체 |

## 📝 API 엔드포인트

### 인증
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `POST /api/v1/auth/refresh` - 토큰 갱신

### 개선 항목
- `GET /api/v1/items` - 목록 조회
- `POST /api/v1/items` - 등록
- `GET /api/v1/items/:id` - 상세 조회
- `PATCH /api/v1/items/:id` - 수정
- `PATCH /api/v1/items/:id/status` - 상태 변경
- `DELETE /api/v1/items/:id` - 삭제

### 대시보드
- `GET /api/v1/dashboard/summary` - 현황 요약

### 부서/사용자
- `GET /api/v1/departments` - 부서 목록
- `GET /api/v1/users` - 사용자 목록
- `GET /api/v1/users/me` - 내 정보

## 🤖 AI 개발 규칙

> **중요**: AI 어시스턴트가 이 프로젝트를 개발할 때 반드시 따라야 하는 규칙

### Git 커밋 규칙
**기능을 하나 완성할 때마다 반드시 Git 커밋을 수행할 것**

```bash
# 변경된 파일 스테이징
git add .

# 의미 있는 커밋 메시지와 함께 커밋
git commit -m "feat: 기능 설명"
```

### 커밋 메시지 형식
| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `style` | UI/스타일 변경 |
| `docs` | 문서 수정 |
| `chore` | 기타 작업 (설정 등) |

### 예시
```bash
git add .
git commit -m "feat: 대시보드 차트 클릭 시 해당 본부 보드로 이동"
git commit -m "fix: 로그인 토큰 갱신 오류 수정"
git commit -m "style: 본부명 8개로 변경"
```

---

## 📌 참고사항

### 하지 않는 것 (Anti-Requirements)
- ❌ KPI/점수/평가
- ❌ 부서 간 성과 랭킹
- ❌ 개인 평가 연동
- ❌ 달성률/퍼센트

### 하는 것
- ✅ 현재 회사에 어떤 개선거리들이 있는지 파악
- ✅ 어느 부서에서 무엇을 고민 중인지 확인
- ✅ 아이디어/진행중/완료 상태 구분
- ✅ 방치된 항목 식별

---

**문서 버전**: 1.0  
**최종 수정**: 2026-01-19
