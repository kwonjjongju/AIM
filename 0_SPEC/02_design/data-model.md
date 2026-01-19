# 데이터 모델
## 업무 개선 보드 시스템

---

## 1. ERD (Entity Relationship Diagram)

```
┌─────────────────────┐       ┌─────────────────────┐
│     departments     │       │       users         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │◄──┐   │ id (PK)             │
│ name                │   │   │ employee_id (UK)    │
│ code (UK)           │   │   │ name                │
│ color               │   │   │ email (UK)          │
│ is_active           │   ├───┤ department_id (FK)  │
│ created_at          │   │   │ role                │
│ updated_at          │   │   │ password_hash       │
└─────────────────────┘   │   │ is_active           │
                          │   │ created_at          │
                          │   │ updated_at          │
                          │   └──────────┬──────────┘
                          │              │
                          │              │ created_by (FK)
                          │              │ assigned_to (FK)
                          │              ▼
┌─────────────────────────┴───────────────────────────────────┐
│                    improvement_items                         │
├──────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ title                                                        │
│ description                                                  │
│ department_id (FK)                                           │
│ status                                                       │
│ created_by (FK)                                              │
│ assigned_to (FK)                                             │
│ is_deleted                                                   │
│ created_at                                                   │
│ updated_at                                                   │
└──────────────────────────────────────────────────────────────┘
         │                              │
         │ 1:N                          │ 1:N
         ▼                              ▼
┌─────────────────────┐       ┌─────────────────────┐
│   status_histories  │       │    attachments      │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ item_id (FK)        │       │ item_id (FK)        │
│ from_status         │       │ file_name           │
│ to_status           │       │ file_path           │
│ changed_by (FK)     │       │ file_size           │
│ note                │       │ mime_type           │
│ changed_at          │       │ uploaded_by (FK)    │
└─────────────────────┘       │ uploaded_at         │
                              └─────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                item_related_departments (N:M)                 │
├──────────────────────────────────────────────────────────────┤
│ item_id (FK, PK)                                             │
│ department_id (FK, PK)                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 테이블 상세 정의

### 2.1 departments (부서)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 부서 ID |
| name | VARCHAR(50) | NOT NULL | 부서명 |
| code | VARCHAR(20) | NOT NULL, UNIQUE | 부서 코드 |
| color | VARCHAR(7) | DEFAULT '#6366F1' | 부서 대표 색상 |
| is_active | BOOLEAN | DEFAULT true | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.2 users (사용자)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 사용자 ID |
| employee_id | VARCHAR(20) | NOT NULL, UNIQUE | 사번 |
| name | VARCHAR(50) | NOT NULL | 이름 |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 이메일 |
| department_id | UUID | FK(departments) | 소속 부서 |
| role | user_role | NOT NULL | 역할 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 해시 |
| is_active | BOOLEAN | DEFAULT true | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.3 improvement_items (개선 항목)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 항목 ID |
| title | VARCHAR(100) | NOT NULL | 제목 |
| description | TEXT | | 상세 설명 |
| department_id | UUID | FK, NOT NULL | 등록 부서 |
| status | item_status | NOT NULL, DEFAULT 'IDEA' | 상태 |
| created_by | UUID | FK, NOT NULL | 등록자 |
| assigned_to | UUID | FK | 담당자 |
| is_deleted | BOOLEAN | DEFAULT false | 삭제 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2.4 status_histories (상태 이력)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 이력 ID |
| item_id | UUID | FK, NOT NULL | 항목 ID |
| from_status | item_status | | 이전 상태 |
| to_status | item_status | NOT NULL | 변경 상태 |
| changed_by | UUID | FK, NOT NULL | 변경자 |
| note | TEXT | | 변경 메모 |
| changed_at | TIMESTAMPTZ | DEFAULT NOW() | 변경일시 |

### 2.5 attachments (첨부파일)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 첨부파일 ID |
| item_id | UUID | FK, NOT NULL | 항목 ID |
| file_name | VARCHAR(255) | NOT NULL | 원본 파일명 |
| file_path | VARCHAR(500) | NOT NULL | 저장 경로 |
| file_size | INTEGER | NOT NULL | 파일 크기 (bytes) |
| mime_type | VARCHAR(100) | NOT NULL | MIME 타입 |
| uploaded_by | UUID | FK, NOT NULL | 업로드한 사용자 |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() | 업로드일시 |

---

## 3. ENUM 정의

### 3.1 item_status (상태)

```sql
CREATE TYPE item_status AS ENUM (
    'IDEA',        -- 💡 떠올림
    'REVIEWING',   -- 👀 보고 있음
    'IN_PROGRESS', -- 🛠️ 만지는 중
    'ON_HOLD',     -- ⏸️ 잠깐 멈춤
    'DONE'         -- ✅ 정리됨
);
```

### 3.2 user_role (역할)

```sql
CREATE TYPE user_role AS ENUM (
    'EMPLOYEE',      -- 일반 직원
    'DEPT_MANAGER',  -- 부서 담당자
    'EXECUTIVE',     -- 경영자/임원
    'ADMIN'          -- 시스템 관리자
);
```

---

## 4. 동시성 제어 (P2-1)

### 4.1 Optimistic Lock 구현 방식

> 📌 **결정**: `updatedAt` 컬럼 기반 Optimistic Lock

```typescript
// 항목 수정 시 동시 수정 충돌 방지
const updateItem = async (id: string, data: UpdateItemDto, expectedUpdatedAt: Date) => {
  const result = await prisma.improvementItem.updateMany({
    where: {
      id,
      updatedAt: expectedUpdatedAt  // 조건부 업데이트
    },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
  
  if (result.count === 0) {
    throw new ConflictError('다른 사용자가 수정했습니다. 새로고침 후 다시 시도해주세요.');
  }
};
```

### 4.2 적용 대상

| API | 적용 여부 | 비고 |
|-----|----------|------|
| PATCH /items/:id | ✅ | 항목 수정 |
| PATCH /items/:id/status | ✅ | 상태 변경 |
| DELETE /items/:id | ❌ | 삭제는 충돌 무관 |

---

## 5. 인덱스 설계

```sql
-- improvement_items
CREATE INDEX idx_items_department ON improvement_items(department_id);
CREATE INDEX idx_items_status ON improvement_items(status);
CREATE INDEX idx_items_created_by ON improvement_items(created_by);
CREATE INDEX idx_items_created_at ON improvement_items(created_at DESC);
CREATE INDEX idx_items_updated_at ON improvement_items(updated_at DESC);
CREATE INDEX idx_items_is_deleted ON improvement_items(is_deleted);

-- 복합 인덱스
CREATE INDEX idx_items_dept_status ON improvement_items(department_id, status)
    WHERE is_deleted = false;

-- status_histories
CREATE INDEX idx_history_item ON status_histories(item_id);
CREATE INDEX idx_history_changed_at ON status_histories(changed_at DESC);

-- users
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_email ON users(email);

-- attachments
CREATE INDEX idx_attachments_item ON attachments(item_id);
```

---

## 6. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ItemStatus {
  IDEA
  REVIEWING
  IN_PROGRESS
  ON_HOLD
  DONE
}

enum UserRole {
  EMPLOYEE
  DEPT_MANAGER
  EXECUTIVE
  ADMIN
}

model Department {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(50)
  code      String   @unique @db.VarChar(20)
  color     String   @default("#6366F1") @db.VarChar(7)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users               User[]
  items               ImprovementItem[]
  relatedItems        ItemRelatedDepartment[]

  @@map("departments")
}

model User {
  id           String   @id @default(uuid())
  employeeId   String   @unique @map("employee_id") @db.VarChar(20)
  name         String   @db.VarChar(50)
  email        String   @unique @db.VarChar(100)
  departmentId String   @map("department_id")
  role         UserRole
  passwordHash String   @map("password_hash") @db.VarChar(255)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  department      Department        @relation(fields: [departmentId], references: [id])
  createdItems    ImprovementItem[] @relation("CreatedBy")
  assignedItems   ImprovementItem[] @relation("AssignedTo")
  statusHistories StatusHistory[]
  attachments     Attachment[]

  @@map("users")
}

model ImprovementItem {
  id           String     @id @default(uuid())
  title        String     @db.VarChar(100)
  description  String?    @db.Text
  departmentId String     @map("department_id")
  status       ItemStatus @default(IDEA)
  createdBy    String     @map("created_by")
  assignedTo   String?    @map("assigned_to")
  isDeleted    Boolean    @default(false) @map("is_deleted")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  department         Department              @relation(fields: [departmentId], references: [id])
  creator            User                    @relation("CreatedBy", fields: [createdBy], references: [id])
  assignee           User?                   @relation("AssignedTo", fields: [assignedTo], references: [id])
  statusHistories    StatusHistory[]
  attachments        Attachment[]
  relatedDepartments ItemRelatedDepartment[]

  @@index([departmentId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("improvement_items")
}

model StatusHistory {
  id         String     @id @default(uuid())
  itemId     String     @map("item_id")
  fromStatus ItemStatus? @map("from_status")
  toStatus   ItemStatus @map("to_status")
  changedBy  String     @map("changed_by")
  note       String?    @db.Text
  changedAt  DateTime   @default(now()) @map("changed_at")

  item    ImprovementItem @relation(fields: [itemId], references: [id])
  changer User            @relation(fields: [changedBy], references: [id])

  @@index([itemId])
  @@map("status_histories")
}

model Attachment {
  id         String   @id @default(uuid())
  itemId     String   @map("item_id")
  fileName   String   @map("file_name") @db.VarChar(255)
  filePath   String   @map("file_path") @db.VarChar(500)
  fileSize   Int      @map("file_size")
  mimeType   String   @map("mime_type") @db.VarChar(100)
  uploadedBy String   @map("uploaded_by")
  uploadedAt DateTime @default(now()) @map("uploaded_at")

  item     ImprovementItem @relation(fields: [itemId], references: [id])
  uploader User            @relation(fields: [uploadedBy], references: [id])

  @@index([itemId])
  @@map("attachments")
}

model ItemRelatedDepartment {
  itemId       String @map("item_id")
  departmentId String @map("department_id")

  item       ImprovementItem @relation(fields: [itemId], references: [id])
  department Department      @relation(fields: [departmentId], references: [id])

  @@id([itemId, departmentId])
  @@map("item_related_departments")
}
```

---

**문서 버전**: 1.1  
**작성일**: 2026-01-19  
**변경 이력**: P2-1 검토사항 반영 (Optimistic Lock 구현 방식 명시)
