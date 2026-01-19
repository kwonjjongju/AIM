# 검증 계획 (Verification Plan)
## 업무 개선 보드 시스템

---

## 1. 개요

### 1.1 목적
본 문서는 시스템의 품질을 보장하기 위한 검증 전략과 계획을 정의한다.

### 1.2 범위
- 단위 테스트
- 통합 테스트
- E2E 테스트
- 성능 테스트
- 보안 테스트

---

## 2. 테스트 전략

### 2.1 테스트 피라미드

```
           /\
          /  \
         / E2E\          적음 (핵심 시나리오)
        /______\
       /        \
      / 통합     \       중간
     /____________\
    /              \
   /    단위        \    많음 (70%+)
  /__________________\
```

### 2.2 테스트 유형별 전략

| 유형 | 범위 | 도구 | 커버리지 목표 |
|------|------|------|---------------|
| 단위 테스트 | 함수, 서비스 | Jest | 70%+ |
| 통합 테스트 | API 엔드포인트 | Jest + Supertest | 주요 API |
| E2E 테스트 | 사용자 시나리오 | Playwright | 핵심 플로우 |
| 성능 테스트 | 부하/응답시간 | k6 | 요구사항 충족 |

---

## 3. 단위 테스트 계획

### 3.1 대상

**백엔드**
| 대상 | 테스트 항목 |
|------|------------|
| AuthService | 로그인, 토큰 생성/검증 |
| ItemService | CRUD, 상태 변경, 권한 검사 |
| Validators | 입력 유효성 검증 |
| Utils | 유틸리티 함수 |

**프론트엔드**
| 대상 | 테스트 항목 |
|------|------------|
| StatusBadge | 상태별 렌더링 |
| ImprovementCard | 카드 정보 표시 |
| useAuth | 인증 상태 관리 |
| utils | 유틸리티 함수 |

### 3.2 예시

```typescript
// services/item.service.test.ts
describe('ItemService', () => {
  describe('create', () => {
    it('should create item with IDEA status', async () => {
      const item = await itemService.create({
        title: '테스트 항목',
        createdBy: userId
      });
      
      expect(item.status).toBe('IDEA');
      expect(item.title).toBe('테스트 항목');
    });
    
    it('should throw error when title is empty', async () => {
      await expect(itemService.create({
        title: '',
        createdBy: userId
      })).rejects.toThrow('제목은 필수입니다');
    });
  });
});
```

---

## 4. 통합 테스트 계획

### 4.1 대상

| API | 테스트 항목 |
|-----|------------|
| POST /auth/login | 정상 로그인, 잘못된 자격증명 |
| GET /items | 목록 조회, 필터링, 페이지네이션 |
| POST /items | 항목 생성, 유효성 검증 |
| PATCH /items/:id/status | 상태 변경, 권한 검사 |
| GET /dashboard/summary | 통계 조회 |

### 4.2 예시

```typescript
// tests/integration/items.test.ts
describe('GET /api/v1/items', () => {
  it('should return items with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toBeInstanceOf(Array);
    expect(response.body.data.pagination.page).toBe(1);
  });
  
  it('should filter by department', async () => {
    const response = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .query({ departmentId: deptId });
    
    response.body.data.items.forEach(item => {
      expect(item.department.id).toBe(deptId);
    });
  });
});
```

---

## 5. E2E 테스트 계획

### 5.1 핵심 시나리오

| ID | 시나리오 | 우선순위 |
|----|----------|----------|
| E2E-001 | 로그인 → 대시보드 조회 | P1 |
| E2E-002 | 항목 등록 플로우 | P1 |
| E2E-003 | 상태 변경 플로우 | P1 |
| E2E-004 | 부서별 필터링 | P1 |
| E2E-005 | 권한별 UI 표시 | P2 |

### 5.2 예시

```typescript
// tests/e2e/item-registration.spec.ts
test('직원이 새 항목을 등록할 수 있다', async ({ page }) => {
  // 로그인
  await page.goto('/login');
  await page.fill('[name="email"]', 'employee@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 대시보드 확인
  await expect(page).toHaveURL('/dashboard');
  
  // 등록 모달 열기
  await page.click('text=일단 올리기');
  
  // 제목 입력 후 등록
  await page.fill('[name="title"]', '새로운 개선 항목');
  await page.click('text=등록');
  
  // 등록 확인
  await expect(page.locator('text=새로운 개선 항목')).toBeVisible();
});
```

---

## 6. 성능 테스트 계획

### 6.1 테스트 시나리오

| ID | 시나리오 | 목표 |
|----|----------|------|
| PERF-001 | 동시 50명 로그인 | 응답 < 2s |
| PERF-002 | 동시 100명 목록 조회 | 응답 < 1s |
| PERF-003 | 1시간 지속 부하 | 에러율 < 1% |

### 6.2 k6 스크립트 예시

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  let res = http.get('http://localhost:4000/api/v1/items', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
```

---

## 7. 보안 테스트 계획

### 7.1 체크리스트

| 항목 | 테스트 내용 |
|------|------------|
| 인증 | 토큰 없이 API 접근 차단 |
| 인가 | 권한 없는 리소스 접근 차단 |
| 입력 검증 | XSS, SQL Injection 시도 |
| 세션 | 만료된 토큰 거부 |

### 7.2 테스트 케이스

```typescript
describe('Security Tests', () => {
  it('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/v1/items');
    
    expect(response.status).toBe(401);
  });
  
  it('should prevent XSS in title', async () => {
    const response = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '<script>alert("xss")</script>' });
    
    // 이스케이프 또는 거부 확인
  });
});
```

---

## 8. 테스트 일정

| 단계 | 기간 | 활동 |
|------|------|------|
| MVP 개발 중 | Week 1-2 | 단위 테스트 작성 |
| MVP 완료 후 | Week 2 마지막 | 통합 테스트, E2E |
| 배포 전 | Week 2 마지막 | 성능, 보안 테스트 |

---

## 9. 테스트 환경

| 환경 | 용도 | 데이터 |
|------|------|--------|
| 개발 (local) | 단위/통합 테스트 | 테스트 DB |
| 스테이징 | E2E, 성능 테스트 | 샘플 데이터 |
| 운영 | 스모크 테스트만 | 실제 데이터 |

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19
