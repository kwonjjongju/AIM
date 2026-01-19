# 불변 조건 (Invariants)
## 업무 개선 보드 시스템

---

## 1. 개요

불변 조건(Invariant)은 시스템이 **항상 유지해야 하는 조건**이다.
이 조건이 위반되면 시스템이 비정상 상태임을 의미한다.

---

## 2. 데이터 불변 조건

### 2.1 개선 항목 (ImprovementItem)

| ID | 불변 조건 | 검증 시점 |
|----|-----------|-----------|
| INV-ITEM-01 | 항목은 반드시 하나의 유효한 상태를 가진다 | 생성/수정 시 |
| INV-ITEM-02 | 항목은 반드시 등록 부서를 가진다 | 생성 시 |
| INV-ITEM-03 | 항목은 반드시 등록자를 가진다 | 생성 시 |
| INV-ITEM-04 | 제목은 비어있을 수 없다 | 생성/수정 시 |
| INV-ITEM-05 | 제목은 100자를 초과할 수 없다 | 생성/수정 시 |
| INV-ITEM-06 | created_at은 updated_at보다 이후일 수 없다 | 항상 |

### 2.2 상태 이력 (StatusHistory)

| ID | 불변 조건 | 검증 시점 |
|----|-----------|-----------|
| INV-HIST-01 | 이력의 to_status는 항상 존재한다 | 생성 시 |
| INV-HIST-02 | 이력의 changed_by는 유효한 사용자여야 한다 | 생성 시 |
| INV-HIST-03 | from_status와 to_status가 같을 수 없다 | 생성 시 |

### 2.3 사용자 (User)

| ID | 불변 조건 | 검증 시점 |
|----|-----------|-----------|
| INV-USER-01 | 이메일은 고유해야 한다 | 생성/수정 시 |
| INV-USER-02 | 사번은 고유해야 한다 | 생성/수정 시 |
| INV-USER-03 | 사용자는 반드시 하나의 역할을 가진다 | 생성/수정 시 |
| INV-USER-04 | 사용자는 반드시 하나의 부서에 속한다 | 생성/수정 시 |

### 2.4 부서 (Department)

| ID | 불변 조건 | 검증 시점 |
|----|-----------|-----------|
| INV-DEPT-01 | 부서 코드는 고유해야 한다 | 생성/수정 시 |
| INV-DEPT-02 | 부서명은 비어있을 수 없다 | 생성/수정 시 |

---

## 3. 상태 불변 조건

### 3.1 항목 상태

| ID | 불변 조건 | 설명 |
|----|-----------|------|
| INV-STATUS-01 | 상태는 정의된 5가지 중 하나여야 한다 | IDEA, REVIEWING, IN_PROGRESS, ON_HOLD, DONE |
| INV-STATUS-02 | 상태 변경 시 이력이 기록되어야 한다 | 누락 불가 |

### 3.2 인증 상태

| ID | 불변 조건 | 설명 |
|----|-----------|------|
| INV-AUTH-01 | 유효한 JWT 없이 보호된 리소스 접근 불가 | 401 반환 |
| INV-AUTH-02 | 만료된 토큰으로 접근 불가 | 401 반환 |

---

## 4. 비즈니스 불변 조건

### 4.1 권한 불변 조건

| ID | 불변 조건 | 설명 |
|----|-----------|------|
| INV-PERM-01 | 일반 직원은 본인 항목만 수정/삭제 가능 | 타인 항목 수정 불가 |
| INV-PERM-02 | 부서 담당자는 부서 내 항목만 수정/삭제 가능 | 타 부서 수정 불가 |
| INV-PERM-03 | 경영자는 조회만 가능 | 수정/삭제 권한 없음 |

### 4.2 캐주얼 정책 불변 조건

| ID | 불변 조건 | 설명 |
|----|-----------|------|
| INV-CASUAL-01 | 시스템에 KPI/점수/평가 기능이 없어야 한다 | 핵심 철학 |
| INV-CASUAL-02 | 부서 간 성과 비교 기능이 없어야 한다 | 경쟁 배제 |
| INV-CASUAL-03 | 달성률/퍼센트 표시가 없어야 한다 | 압박감 배제 |

---

## 5. 검증 코드 예시

```typescript
// 항목 생성 시 불변 조건 검증
const validateItemInvariants = (item: CreateItemDto): void => {
  // INV-ITEM-04: 제목 필수
  if (!item.title || item.title.trim() === '') {
    throw new ValidationError('제목은 필수입니다');
  }
  
  // INV-ITEM-05: 제목 길이
  if (item.title.length > 100) {
    throw new ValidationError('제목은 100자를 초과할 수 없습니다');
  }
};

// 상태 변경 시 불변 조건 검증
const validateStatusTransition = (
  fromStatus: ItemStatus,
  toStatus: ItemStatus
): void => {
  // INV-HIST-03: 같은 상태로 전이 불가
  if (fromStatus === toStatus) {
    throw new ValidationError('같은 상태로 변경할 수 없습니다');
  }
  
  // INV-STATUS-01: 유효한 상태인지 확인
  if (!Object.values(ItemStatus).includes(toStatus)) {
    throw new ValidationError('유효하지 않은 상태입니다');
  }
};
```

---

## 6. 테스트 체크리스트

- [ ] INV-ITEM-01 ~ 06 테스트
- [ ] INV-HIST-01 ~ 03 테스트
- [ ] INV-USER-01 ~ 04 테스트
- [ ] INV-PERM-01 ~ 03 테스트
- [ ] INV-CASUAL-01 ~ 03 테스트

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19
