# API 설계
## 업무 개선 보드 시스템

---

## 1. API 기본 규칙

### 1.1 기본 정보
| 항목 | 값 |
|------|-----|
| Base URL | `/api/v1` |
| 인증 | Bearer Token (JWT) |
| 응답 형식 | JSON |
| 문자 인코딩 | UTF-8 |

### 1.2 응답 형식

**성공 응답**
```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답** (failure-policies.md 표준 포맷)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "유효하지 않은 요청입니다",
    "details": [
      {
        "field": "title",
        "message": "제목을 입력해주세요"
      }
    ]
  }
}
```
> 📌 `details` 배열은 유효성 검증 오류 시에만 포함 (선택적)

### 1.3 HTTP 상태 코드
| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 생성 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패, 재로그인 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 데이터 (동시 수정 충돌) |
| 422 | Unprocessable Entity | 데이터 유효성 오류 |
| 429 | Too Many Requests | 요청 횟수 초과 |
| 500 | Internal Server Error | 서버 에러 |
| 503 | Service Unavailable | 서비스 일시 불가 |

---

## 2. 인증 API `[Phase 1]`

### 2.1 로그인
**POST** `/api/v1/auth/login` `[P1]`

**Request**
```json
{
  "email": "hong@company.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid",
      "name": "홍길동",
      "email": "hong@company.com",
      "department": {
        "id": "uuid",
        "name": "생산팀",
        "code": "PROD",
        "color": "#F59E0B"
      },
      "role": "EMPLOYEE"
    }
  }
}
```
> ⚠️ **Refresh Token**: JSON 응답이 아닌 **HttpOnly Cookie**로 자동 설정됨

### 2.2 로그아웃
**POST** `/api/v1/auth/logout`
> Cookie에서 Refresh Token을 읽어 Redis 블랙리스트에 등록 후 삭제

### 2.3 토큰 갱신
**POST** `/api/v1/auth/refresh`
> **Request Body 없음** - HttpOnly Cookie에서 Refresh Token 자동 전송

---

## 3. 개선 항목 API `[Phase 1]`

### 3.1 항목 목록 조회
**GET** `/api/v1/items` `[P1]`

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | number | N | 페이지 번호 | 1 |
| limit | number | N | 페이지당 개수 | 20 |
| departmentId | uuid | N | 부서 필터 | - |
| status | string | N | 상태 필터 | - |
| sort | string | N | 정렬 필드 | createdAt |
| order | string | N | 정렬 순서 | desc |
| staleOnly | boolean | N | 오래된 항목만 | false |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "포장 라인 작업대 높이 조절",
        "description": "허리 아파요...",
        "status": "IDEA",
        "statusIcon": "💡",
        "statusLabel": "떠올림",
        "department": {
          "id": "uuid",
          "name": "생산팀",
          "color": "#F59E0B"
        },
        "createdBy": {
          "id": "uuid",
          "name": "홍길동"
        },
        "assignedTo": null,
        "attachmentCount": 2,
        "createdAt": "2026-01-17T09:00:00Z",
        "updatedAt": "2026-01-17T09:00:00Z",
        "daysSinceUpdate": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 3.2 항목 등록
**POST** `/api/v1/items` `[P1]`

**Request**
```json
{
  "title": "포장 라인 작업대 높이 조절",
  "description": "허리 아파요...",
  "assignedTo": "uuid (optional)",
  "relatedDepartments": ["uuid", "uuid"]
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "포장 라인 작업대 높이 조절",
    "status": "IDEA",
    "createdAt": "2026-01-19T10:00:00Z"
  }
}
```

### 3.3 항목 상세 조회
**GET** `/api/v1/items/:id` `[P1]`

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "포장 라인 작업대 높이 조절",
    "description": "허리 아파요...",
    "status": "IDEA",
    "statusIcon": "💡",
    "statusLabel": "떠올림",
    "department": { ... },
    "createdBy": { ... },
    "assignedTo": null,
    "relatedDepartments": [ ... ],
    "attachments": [
      {
        "id": "uuid",
        "fileName": "작업대_사진.jpg",
        "fileSize": 2345678,
        "mimeType": "image/jpeg",
        "uploadedAt": "2026-01-17T09:00:00Z"
      }
    ],
    "statusHistory": [
      {
        "fromStatus": null,
        "toStatus": "IDEA",
        "changedBy": { "name": "홍길동" },
        "note": null,
        "changedAt": "2026-01-17T09:00:00Z"
      }
    ],
    "createdAt": "2026-01-17T09:00:00Z",
    "updatedAt": "2026-01-17T09:00:00Z"
  }
}
```

### 3.4 항목 수정
**PATCH** `/api/v1/items/:id` `[P1]`

**Request**
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "assignedTo": "uuid"
}
```

### 3.5 상태 변경
**PATCH** `/api/v1/items/:id/status` `[P1]`

**Request**
```json
{
  "status": "IN_PROGRESS",
  "note": "담당자 지정 후 진행 시작"
}
```

### 3.6 항목 삭제
**DELETE** `/api/v1/items/:id` `[P1]`

---

## 4. 대시보드 API `[Phase 1]`

### 4.1 전체 현황 요약
**GET** `/api/v1/dashboard/summary` `[P1]`

**Response (200)**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "IDEA": 12,
      "REVIEWING": 8,
      "IN_PROGRESS": 15,
      "ON_HOLD": 5,
      "DONE": 5
    },
    "byDepartment": [
      { "id": "uuid", "name": "생산팀", "color": "#F59E0B", "count": 15 },
      { "id": "uuid", "name": "품질팀", "color": "#10B981", "count": 10 }
    ],
    "staleItems": [
      {
        "id": "uuid",
        "title": "오래된 항목",
        "daysSinceUpdate": 45,
        "department": { "name": "IT팀" }
      }
    ]
  }
}
```

---

## 5. 부서 API `[Phase 1]`

### 5.1 부서 목록 조회
**GET** `/api/v1/departments` `[P1]`

### 5.2 부서 등록 (Admin)
**POST** `/api/v1/departments` `[P2]`

### 5.3 부서 수정 (Admin)
**PATCH** `/api/v1/departments/:id` `[P2]`

---

## 6. 사용자 API `[Phase 1/2]`

### 6.1 사용자 목록 조회
**GET** `/api/v1/users` `[P1]`

### 6.2 내 정보 조회
**GET** `/api/v1/users/me` `[P1]`

### 6.3 사용자 등록 (Admin)
**POST** `/api/v1/users` `[P2]`

### 6.4 사용자 수정
**PATCH** `/api/v1/users/:id` `[P2]`

---

## 7. 파일 API `[Phase 2]`
> ⚠️ MVP(Phase 1)에서는 제외, Phase 2에서 구현 예정

### 7.1 첨부파일 업로드
**POST** `/api/v1/items/:id/attachments` `[P2]`

**Request**: multipart/form-data
- file: 업로드 파일 (최대 10MB)

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "document.pdf",
    "fileSize": 1234567,
    "mimeType": "application/pdf"
  }
}
```

### 7.2 첨부파일 다운로드
**GET** `/api/v1/attachments/:id/download` `[P2]`

### 7.3 첨부파일 삭제
**DELETE** `/api/v1/attachments/:id` `[P2]`

---

## 8. API 권한 매트릭스

| API | EMPLOYEE | DEPT_MANAGER | EXECUTIVE | ADMIN |
|-----|----------|--------------|-----------|-------|
| GET /items | ✅ | ✅ | ✅ | ✅ |
| POST /items | ✅ | ✅ | ❌ | ✅ |
| PATCH /items/:id | 본인만 | 부서 내 | ❌ | ✅ |
| DELETE /items/:id | 본인만 | 부서 내 | ❌ | ✅ |
| GET /dashboard | ✅ | ✅ | ✅ | ✅ |
| POST /departments | ❌ | ❌ | ❌ | ✅ |
| POST /users | ❌ | ❌ | ❌ | ✅ |

---

---

## 9. 대시보드 표현 가이드 (P1-2)

> ⚠️ **성과/랭킹으로 오해되지 않도록 주의**

### 금지 표현
- ❌ "TOP 5", "1위", "순위" 등 경쟁 유발 용어
- ❌ 부서별 차트를 값 기준 내림차순 정렬
- ❌ "성과", "실적", "달성률" 용어

### 권장 표현
- ✅ "오래된 항목 5개" (TOP이 아닌 중립적 표현)
- ✅ 부서별 차트는 **조직코드 순** 또는 **가나다순** 고정 정렬
- ✅ "현황", "흐름", "훑어보기" 용어 사용

### 정렬 기준
| 대상 | 정렬 기준 | 비고 |
|------|-----------|------|
| 부서별 바 차트 | 부서 코드(code) 오름차순 | 가나다순 |
| 오래된 항목 | updatedAt 오름차순 | 오래된 순 |
| 카드 리스트 | createdAt 내림차순 | 최신순 |

---

**문서 버전**: 1.1  
**작성일**: 2026-01-19  
**변경 이력**: P0-1/P0-2/P1-1/P1-2 검토사항 반영
