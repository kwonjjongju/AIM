# 📁 02_design 인덱스

> **용도**: 요구사항을 어떻게(HOW) 구현할지 설계
> 
> **프로젝트**: 업무 개선 보드 (Fix-it Board)

## 문서 목록

### 핵심 설계
| 파일 | 용도 | 상태 |
|------|------|------|
| [sds.md](sds.md) | 설계 요약/인덱스/결정 로그 | ✅ 완료 |
| [architecture.md](architecture.md) | 시스템 아키텍처 | ✅ 완료 |
| [data-model.md](data-model.md) | 데이터 모델/ERD | ✅ 완료 |
| [state-machines.md](state-machines.md) | 상태 머신 | ✅ 완료 |

### 웹서비스 전용
| 파일 | 용도 | 상태 |
|------|------|------|
| [api-design.md](api-design.md) | REST API 설계 | ✅ 완료 |
| [security-design.md](security-design.md) | 보안 설계 | ✅ 완료 |
| [deployment.md](deployment.md) | 배포/인프라 설계 | ✅ 완료 |

### 다이어그램 (diagrams/)
| 파일 | 용도 | Mermaid 타입 |
|------|------|-------------|
| [system.mmd](diagrams/system.mmd) | 시스템 구조도 | flowchart |
| [sequence.mmd](diagrams/sequence.mmd) | 시퀀스 다이어그램 | sequenceDiagram |
| [state.mmd](diagrams/state.mmd) | 상태 다이어그램 | stateDiagram |
| [entity-relationship.mmd](diagrams/entity-relationship.mmd) | DB ERD | erDiagram |
| [user-journey.mmd](diagrams/user-journey.mmd) | 사용자 여정 | journey |

## 빠른 참조

### ID 접두사
- `DSN-###`: 설계 요소
- `DSN-###-API`: API 설계
- `DSN-###-SEC`: 보안 설계
- `D-###`: 설계 결정 (Decision)

### 기술 스택
| 계층 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + Prisma |
| Database | PostgreSQL 15 + Redis 7 |
| Infra | Docker + Nginx |

## 다음 단계
- 설계 완료 → [05_tasks/](../05_tasks/INDEX.md)로 작업 분해
