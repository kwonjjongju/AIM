# 소프트웨어 설계 명세서 (SDS)
## 업무 개선 보드 시스템

**문서 버전**: 2.0  
**작성일**: 2026-01-19  
**상태**: Approved

---

## 1. 개요

### 1.1 문서 목적
본 문서는 업무 개선 보드 시스템의 소프트웨어 설계를 정의한다.

### 1.2 참조 문서
- [srs.md](../01_requirements/srs.md) - 요구사항 명세서
- [00_brainstorming/](../00_브레인스토밍/) - 브레인스토밍 자료

### 1.3 설계 원칙
| 원칙 | 설명 |
|------|------|
| 심플함 | 최소한의 복잡도로 요구사항 충족 |
| 캐주얼함 | 포스트잇/화이트보드 느낌의 경험 제공 |
| 확장성 | 향후 기능 추가에 유연한 구조 |
| 반응형 | 데스크톱/모바일 모두 지원 |

---

## 2. 설계 문서 인덱스

| 문서 | 용도 | 링크 |
|------|------|------|
| 아키텍처 | 시스템 구조 | [architecture.md](architecture.md) |
| 데이터 모델 | DB 설계 | [data-model.md](data-model.md) |
| API 설계 | REST API | [api-design.md](api-design.md) |
| 보안 설계 | 인증/인가 | [security-design.md](security-design.md) |
| 상태 머신 | 상태 관리 | [state-machines.md](state-machines.md) |
| 배포 설계 | 인프라 | [deployment.md](deployment.md) |

---

## 3. 기술 스택 요약

| 구분 | 기술 | 버전 | 선정 사유 |
|------|------|------|-----------|
| **Frontend** | React | 18.x | 컴포넌트 기반, 풍부한 생태계 |
| | TypeScript | 5.x | 타입 안정성 |
| | Tailwind CSS | 3.x | 빠른 스타일링, 반응형 |
| | React Query | 5.x | 서버 상태 관리 |
| | Zustand | 4.x | 클라이언트 상태 관리 |
| **Backend** | Node.js | 20.x | JS 풀스택 |
| | Express | 4.x | 경량 웹 프레임워크 |
| | Prisma | 5.x | Type-safe ORM |
| **Database** | PostgreSQL | 15.x | 안정성, JSON 지원 |
| | Redis | 7.x | 세션/캐시 |
| **Infra** | Docker | - | 컨테이너화 |
| | Nginx | - | 리버스 프록시 |

---

## 4. 설계 결정 로그 (Decision Log)

| ID | 결정 | 이유 | 날짜 |
|----|------|------|------|
| D-001 | React 선택 | 풍부한 생태계, 팀 경험 | 2026-01-19 |
| D-002 | PostgreSQL 선택 | JSON 지원, 안정성 | 2026-01-19 |
| D-003 | JWT 인증 | 확장성, 무상태 | 2026-01-19 |
| D-004 | 5단계 상태 | 캐주얼 UX, 단순함 | 2026-01-19 |
| D-005 | 소프트 삭제 | 데이터 보존, 복구 가능 | 2026-01-19 |

---

## 5. 디렉토리 구조

```
improvement-board/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/          # 재사용 컴포넌트
│   │   │   ├── common/          # 공통 (Button, Modal 등)
│   │   │   ├── card/            # 카드 관련
│   │   │   ├── board/           # 보드 관련
│   │   │   └── layout/          # 레이아웃
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── hooks/               # 커스텀 훅
│   │   ├── services/            # API 호출
│   │   ├── stores/              # Zustand 스토어
│   │   ├── types/               # TypeScript 타입
│   │   └── utils/               # 유틸리티
│   └── package.json
│
├── backend/                     # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/         # 컨트롤러
│   │   ├── services/            # 비즈니스 로직
│   │   ├── repositories/        # 데이터 접근
│   │   ├── middlewares/         # 미들웨어
│   │   ├── routes/              # 라우터
│   │   └── config/              # 설정
│   ├── prisma/
│   │   └── schema.prisma        # DB 스키마
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 6. 요구사항-설계 매핑

| 요구사항 | 설계 요소 | 설계 문서 |
|----------|-----------|-----------|
| REQ-FR-001 | DSN-001: 항목 등록 API | api-design.md |
| REQ-FR-002 | DSN-002: 상태 관리 | state-machines.md |
| REQ-FR-003 | DSN-003: 조회/필터 API | api-design.md |
| REQ-FR-004 | DSN-004: 대시보드 API | api-design.md |
| REQ-FR-005 | DSN-005: 인증 | security-design.md |
| REQ-FR-006 | DSN-006: 권한 관리 | security-design.md |

---

**문서 이력**
| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-19 | 초기 작성 |
| 2.0 | 2026-01-19 | SDD 템플릿 적용 |
