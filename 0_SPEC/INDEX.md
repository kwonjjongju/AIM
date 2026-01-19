# 📚 SDD 문서 마스터 인덱스
## 업무 개선 보드 (Fix-it Board)

> **AI 가이드**: 이 파일을 먼저 읽고, 작업에 필요한 폴더의 INDEX.md만 참조하세요.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 업무 개선 보드 (Fix-it Board) |
| 핵심 컨셉 | 화이트보드 + 포스트잇을 온라인으로 옮긴 캐주얼 업무 개선 리스트 |
| 핵심 원칙 | **성과관리가 아닌 리스트 관리** |
| 예상 기간 | MVP 2주 + 고도화 2주 = 총 4주 |

---

## 폴더 구조

| 폴더 | 용도 | 상태 |
|------|------|------|
| [00_브레인스토밍/](00_브레인스토밍/INDEX.md) | 아이디어 탐색, 문제 정의 | ✅ 완료 |
| [01_requirements/](01_requirements/INDEX.md) | 요구사항 명세 (WHAT) | ✅ 완료 |
| [02_design/](02_design/INDEX.md) | 설계 명세 (HOW) | ✅ 완료 |
| [03_system_guards/](03_system_guards/INDEX.md) | 시스템 제약/안전 규칙 | ✅ 완료 |
| [04_mvp/](04_mvp/INDEX.md) | MVP 정의 | ✅ 완료 |
| [05_tasks/](05_tasks/INDEX.md) | 작업 분해 | ✅ 완료 |
| [06_verification/](06_verification/INDEX.md) | 검증 체계 | ✅ 완료 |

---

## 빠른 참조

### ID 체계
| 접두사 | 용도 | 예시 |
|--------|------|------|
| REQ-### | 요구사항 | REQ-FR-001 |
| DSN-### | 설계 | DSN-001 |
| TASK-### | 작업 | TASK-001 |
| TC-### | 테스트 | TC-001 |

### 핵심 문서
- **요구사항 명세**: [01_requirements/srs.md](01_requirements/srs.md)
- **설계 요약**: [02_design/sds.md](02_design/sds.md)
- **작업 분해**: [05_tasks/task-breakdown.md](05_tasks/task-breakdown.md)
- **추적성 매트릭스**: [06_verification/traceability.md](06_verification/traceability.md)

### 핵심 금지 사항 (Anti-Requirements)
- ❌ KPI/점수/평가 기능
- ❌ 부서 간 성과 랭킹
- ❌ 개인 평가 연동
- ❌ 달성률/퍼센트 표시

---

## 문서 상태 요약

| 폴더 | 문서 수 | 상태 |
|------|---------|------|
| 00_브레인스토밍 | 8 | ✅ 완료 |
| 01_requirements | 5 | ✅ 완료 |
| 02_design | 12 | ✅ 완료 |
| 03_system_guards | 5 | ✅ 완료 |
| 04_mvp | 4 | ✅ 완료 |
| 05_tasks | 4 | ✅ 완료 |
| 06_verification | 5 | ✅ 완료 |
| **총계** | **43** | **✅ 완료** |

---

## 기술 스택

| 계층 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + Prisma |
| Database | PostgreSQL 15 + Redis 7 |
| Infra | Docker + Nginx |

---

## 일정 요약

```
Week 1-2: MVP (17 MD)
├── 프로젝트 설정
├── 인증 기능
├── 항목 CRUD
├── 대시보드
└── 배포

Week 3: 고도화 (5 MD)
├── 파일 첨부
├── 담당자 지정
└── 관리자 설정

Week 4: 선택 기능 (10 MD)
├── SSO 연동
├── 알림 기능
└── 고급 시각화
```

---

## 다음 단계

1. ✅ 브레인스토밍 완료
2. ✅ 요구사항 정의 완료
3. ✅ 설계 완료
4. ✅ 작업 분해 완료
5. ✅ 검증 계획 완료
6. ⏳ **개발 시작** → [05_tasks/task-breakdown.md](05_tasks/task-breakdown.md) 참조

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19  
**프로젝트 상태**: 설계 완료, 개발 준비
