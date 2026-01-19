# 보안 설계
## 업무 개선 보드 시스템

---

## 1. 인증 (Authentication)

### 1.1 JWT 토큰 구조

**Access Token Payload**
```json
{
  "sub": "user-uuid",
  "name": "홍길동",
  "email": "hong@company.com",
  "departmentId": "dept-uuid",
  "role": "EMPLOYEE",
  "iat": 1705654800,
  "exp": 1705658400
}
```

### 1.2 토큰 정책

| 토큰 | 유효기간 | 저장위치 | 용도 |
|------|----------|----------|------|
| Access Token | 1시간 | 메모리 (변수) | API 인증 |
| Refresh Token | 7일 | HttpOnly Cookie | 토큰 갱신 |

### 1.3 인증 흐름

```
[로그인]
    │
    ▼
[AuthService.login]
    │
    ├─→ 이메일로 사용자 조회
    │
    ├─→ bcrypt.compare(password, hash)
    │       │
    │       ├─ 실패 → 401 Unauthorized
    │       │
    │       └─ 성공 ↓
    │
    ├─→ Access Token 생성 (JWT)
    │
    ├─→ Refresh Token 생성 (JWT)
    │
    └─→ Response: { accessToken, refreshToken, user }
```

### 1.4 토큰 갱신 흐름

```
[Access Token 만료]
    │
    ▼
[POST /api/v1/auth/refresh]
    │
    ├─→ Refresh Token 검증
    │       │
    │       ├─ 유효하지 않음 → 401 (재로그인 필요)
    │       │
    │       └─ 유효함 ↓
    │
    ├─→ 새 Access Token 발급
    │
    └─→ Response: { accessToken }
```

---

## 2. 인가 (Authorization)

### 2.1 역할 기반 접근 제어 (RBAC)

| 역할 | 코드 | 권한 수준 |
|------|------|-----------|
| 일반 직원 | EMPLOYEE | 본인 데이터 관리 |
| 부서 담당자 | DEPT_MANAGER | 부서 내 데이터 관리 |
| 경영자 | EXECUTIVE | 조회 전용 |
| 시스템 관리자 | ADMIN | 전체 관리 |

### 2.2 권한 매트릭스

| 리소스 | 액션 | EMPLOYEE | DEPT_MANAGER | EXECUTIVE | ADMIN |
|--------|------|----------|--------------|-----------|-------|
| Item | CREATE | ✅ | ✅ | ❌ | ✅ |
| Item | READ | ✅ | ✅ | ✅ | ✅ |
| Item | UPDATE | 본인만 | 부서 내 | ❌ | ✅ |
| Item | DELETE | 본인만 | 부서 내 | ❌ | ✅ |
| User | CREATE | ❌ | ❌ | ❌ | ✅ |
| User | READ | 본인만 | 부서 내 | ✅ | ✅ |
| Dept | MANAGE | ❌ | ❌ | ❌ | ✅ |

### 2.3 권한 검사 미들웨어

```typescript
// middlewares/authorize.ts
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// 사용 예시
router.post('/departments', 
  authenticate,
  authorize('ADMIN'),
  deptController.create
);
```

---

## 3. 데이터 보안

### 3.1 비밀번호 정책

| 항목 | 정책 |
|------|------|
| 해싱 알고리즘 | bcrypt |
| Salt Rounds | 12 |
| 최소 길이 | 8자 |
| 복잡도 | 영문+숫자 필수 |

### 3.2 민감 데이터 처리

| 데이터 | 처리 방식 |
|--------|-----------|
| 비밀번호 | bcrypt 해싱 후 저장 |
| 토큰 | 응답에서 refresh token은 HttpOnly cookie로 |
| 로그 | 비밀번호, 토큰 마스킹 |

### 3.3 SQL Injection 방지

- Prisma ORM 사용 (파라미터화 쿼리 자동 적용)
- Raw Query 사용 금지 원칙

---

## 4. 통신 보안

### 4.1 HTTPS

- 모든 통신 TLS 1.3 적용
- HTTP → HTTPS 리다이렉트

### 4.2 CORS 정책

```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // 허용된 도메인만
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 4.3 보안 헤더

```typescript
// Helmet.js 설정
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

---

## 5. 입력 검증

### 5.1 검증 규칙

| 필드 | 규칙 |
|------|------|
| email | 이메일 형식, 최대 100자 |
| password | 최소 8자, 영문+숫자 |
| title | 필수, 최대 100자 |
| description | 최대 10000자 |
| file | 최대 10MB, 허용된 MIME 타입만 |

### 5.2 파일 업로드 검증

```typescript
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const maxFileSize = 10 * 1024 * 1024; // 10MB
```

---

## 6. 세션 관리

### 6.1 세션 정책

| 항목 | 정책 |
|------|------|
| 세션 저장소 | Redis |
| 타임아웃 | 1시간 (비활성) |
| 최대 세션 | 사용자당 5개 |
| 동시 로그인 | 허용 |

### 6.2 로그아웃 처리

- Access Token: 클라이언트에서 삭제
- Refresh Token: 서버에서 무효화 (Redis 블랙리스트)

---

## 7. 로깅 및 감사

### 7.1 로그 수준

| 수준 | 내용 |
|------|------|
| INFO | 로그인/로그아웃, API 호출 |
| WARN | 인증 실패, 권한 거부 |
| ERROR | 시스템 에러 |

### 7.2 감사 로그 (P2-2)

> 📌 **결정**: 감사 로그는 **DB 테이블**에 저장

| 이벤트 | 기록 항목 | 저장 위치 |
|--------|-----------|-----------|
| 로그인 | 사용자, 시간, IP, User-Agent | audit_logs 테이블 |
| 데이터 변경 | 사용자, 시간, 변경 전/후 | audit_logs 테이블 |
| 권한 거부 | 사용자, 시간, 요청 리소스 | audit_logs 테이블 |

**audit_logs 테이블 구조** (Phase 2 구현 예정):
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,  -- LOGIN, LOGOUT, DATA_CHANGE, ACCESS_DENIED
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  resource_type VARCHAR(50),        -- ITEM, USER, DEPARTMENT
  resource_id UUID,
  action VARCHAR(20),               -- CREATE, UPDATE, DELETE
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. 보안 체크리스트

- [ ] HTTPS 적용
- [ ] JWT 서명 키 안전하게 관리 (환경변수)
- [ ] 비밀번호 bcrypt 해싱
- [ ] SQL Injection 방지 (Prisma ORM)
- [ ] XSS 방지 (React 자동 이스케이프)
- [ ] CORS 설정
- [ ] Rate Limiting 적용
- [ ] 보안 헤더 설정 (Helmet)
- [ ] 입력 검증
- [ ] 에러 메시지 노출 최소화

---

---

## 9. 직원 전체 조회 정책 (P2-3)

> 📌 **현재 정책**: 일반 직원(EMPLOYEE)도 **전체 항목 조회 가능**

### 현재 설계
- 개선 항목은 전사적으로 공유되어야 한다는 서비스 철학
- 모든 사용자가 전체 항목 조회 가능

### 향후 옵션 (리스크 대비)
조직 보안 요구 발생 시 아래 옵션 검토:

| 옵션 | 설명 | 구현 난이도 |
|------|------|-------------|
| 부서 제한 | 본인 부서 + 관련 부서만 조회 | 중 |
| 익명화 | 타 부서 항목은 등록자명 마스킹 | 하 |
| 승인 기반 | 부서별 공개/비공개 설정 | 상 |

---

**문서 버전**: 1.1  
**작성일**: 2026-01-19  
**변경 이력**: P2-2/P2-3 검토사항 반영
