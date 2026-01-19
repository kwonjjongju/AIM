# 작업 분해 (Task Breakdown)
## 업무 개선 보드 시스템

---

## 1. Phase 1: MVP (2주)

### 1.1 프로젝트 설정

| ID | 작업명 | 설명 | 상태 | 담당 |
|----|--------|------|------|------|
| TASK-001 | 프로젝트 초기화 | 모노레포 구조, 패키지 설치 | TODO | - |
| TASK-002 | DB 스키마 설계 | Prisma schema 작성, 마이그레이션 | TODO | - |
| TASK-003 | 개발 환경 구성 | Docker Compose, 환경변수 | TODO | - |

### 1.2 백엔드 기반

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-004-BE | Express 서버 설정 | 기본 서버, 미들웨어 | TODO | TASK-001 |
| TASK-005-BE | Prisma 연동 | DB 연결, 클라이언트 설정 | TODO | TASK-002 |
| TASK-006-BE | 에러 핸들링 | 글로벌 에러 처리 | TODO | TASK-004 |

### 1.3 인증 기능

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-007-BE | 인증 API | 로그인, 로그아웃, 토큰 갱신 | TODO | TASK-005 |
| TASK-008-BE | JWT 미들웨어 | 토큰 검증, 권한 확인 | TODO | TASK-007 |
| TASK-009-FE | 로그인 페이지 | 로그인 폼, 에러 처리 | TODO | TASK-010 |
| TASK-010-FE | React 프로젝트 설정 | Vite, Tailwind, 라우터 | TODO | TASK-001 |

### 1.4 항목 CRUD

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-011-BE | 항목 API | CRUD 엔드포인트 | TODO | TASK-008 |
| TASK-012-BE | 상태 관리 API | 상태 변경, 이력 기록 | TODO | TASK-011 |
| TASK-013-FE | 보드 페이지 | 카드 그리드, 부서 탭 | TODO | TASK-010 |
| TASK-014-FE | 등록 모달 | 항목 등록 폼 | TODO | TASK-013 |
| TASK-015-FE | 상세 모달 | 상세 보기, 상태 변경 | TODO | TASK-013 |

### 1.5 대시보드

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-016-BE | 대시보드 API | 통계, 부서별 현황 | TODO | TASK-011 |
| TASK-017-FE | 대시보드 페이지 | 요약, 차트, 오래된 항목 | TODO | TASK-016 |

### 1.6 마무리

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-018 | 반응형 UI | 모바일 대응 | TODO | TASK-017 |
| TASK-019 | 테스트 | 주요 시나리오 테스트 | TODO | TASK-018 |
| TASK-020 | Docker 배포 | 운영 환경 배포 | TODO | TASK-019 |

---

## 2. Phase 2: 핵심 고도화 (1주)

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-021-BE | 파일 업로드 API | 첨부파일 업로드/다운로드 | TODO | TASK-020 |
| TASK-022-FE | 파일 업로드 UI | 드래그앤드롭, 미리보기 | TODO | TASK-021 |
| TASK-023-BE | 담당자 지정 API | 담당자 할당/변경 | TODO | TASK-020 |
| TASK-024-FE | 담당자 UI | 담당자 선택 | TODO | TASK-023 |
| TASK-025-FE | 관리자 설정 페이지 | 부서/사용자 관리 | TODO | TASK-020 |
| TASK-026 | 고급 필터링 | 기간별, 오래된 항목 | TODO | TASK-020 |

---

## 3. Phase 3: 선택 기능 (1주+)

| ID | 작업명 | 설명 | 상태 | 의존성 |
|----|--------|------|------|--------|
| TASK-027 | SSO 연동 | 통합 인증 | TODO | TASK-020 |
| TASK-028 | 알림 기능 | 이메일/웹 알림 | TODO | TASK-020 |
| TASK-029 | 검색 기능 | 제목/메모 검색 | TODO | TASK-020 |
| TASK-030 | 고급 시각화 | 버블맵, 타임라인 | TODO | TASK-020 |

---

## 4. 작업 상세

### TASK-001: 프로젝트 초기화

**설명**: 모노레포 구조 설정 및 기본 패키지 설치

**산출물**:
- 프로젝트 폴더 구조
- package.json (루트, frontend, backend)
- TypeScript 설정
- ESLint, Prettier 설정

**완료 기준**:
- [ ] 폴더 구조 생성
- [ ] 패키지 설치 완료
- [ ] TypeScript 컴파일 확인

---

### TASK-007-BE: 인증 API

**설명**: 로그인, 로그아웃, 토큰 갱신 API 구현

**엔드포인트**:
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh

**완료 기준**:
- [ ] 로그인 API 구현
- [ ] JWT 토큰 발급
- [ ] Refresh 토큰 처리
- [ ] 로그아웃 처리

---

### TASK-011-BE: 항목 API

**설명**: 개선 항목 CRUD API 구현

**엔드포인트**:
- GET /api/v1/items
- GET /api/v1/items/:id
- POST /api/v1/items
- PATCH /api/v1/items/:id
- DELETE /api/v1/items/:id

**완료 기준**:
- [ ] 목록 조회 (필터링, 페이지네이션)
- [ ] 상세 조회
- [ ] 등록 (유효성 검증)
- [ ] 수정 (권한 확인)
- [ ] 삭제 (소프트 삭제)

---

### TASK-013-FE: 보드 페이지

**설명**: 카드 그리드 및 부서 탭 구현

**컴포넌트**:
- BoardPage
- DepartmentTabs
- CardGrid
- ImprovementCard
- StatusBadge

**완료 기준**:
- [ ] 부서 탭 네비게이션
- [ ] 카드 그리드 레이아웃
- [ ] 카드 컴포넌트 (상태, 제목, 메모, 등록자)
- [ ] 카드 클릭 시 상세 모달

---

## 5. 추적성

| 요구사항 | 설계 | 작업 |
|----------|------|------|
| REQ-FR-001 | DSN-001 | TASK-011, TASK-014 |
| REQ-FR-002 | DSN-002 | TASK-012, TASK-015 |
| REQ-FR-003 | DSN-003 | TASK-011, TASK-013 |
| REQ-FR-004 | DSN-004 | TASK-016, TASK-017 |
| REQ-FR-005 | DSN-005 | TASK-007, TASK-009 |

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19
