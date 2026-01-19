# 📁 06_verification 인덱스

> **용도**: 검증 체계 및 추적성 관리
> 
> **프로젝트**: 업무 개선 보드 (Fix-it Board)

## 문서 목록

| 파일 | 용도 | 상태 |
|------|------|------|
| [acceptance-criteria.md](acceptance-criteria.md) | 인수 기준 | ✅ 완료 |
| [verification-plan.md](verification-plan.md) | 검증 계획 | ✅ 완료 |
| [test-matrix.md](test-matrix.md) | 요구사항-테스트 매핑 | ✅ 완료 |
| [traceability.md](traceability.md) | 추적성 매트릭스 | ✅ 완료 |

## 빠른 참조

### ID 접두사
- `TC-###`: 테스트 케이스
- `TC-###-UNIT`: 단위 테스트
- `TC-###-INT`: 통합 테스트
- `TC-###-E2E`: E2E 테스트

### 추적성 체인
```
REQ-### → DSN-### → TASK-### → TC-###
   ↓          ↓          ↓         ↓
요구사항    설계      작업     테스트
```

### 테스트 유형
| 유형 | 설명 | 도구 |
|------|------|------|
| 단위 테스트 | 개별 함수/모듈 | Jest |
| 통합 테스트 | 모듈 간 연동 | Jest + Supertest |
| E2E 테스트 | 전체 시나리오 | Playwright |
| 성능 테스트 | 부하/응답시간 | k6 |
