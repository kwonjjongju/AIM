# 시스템 구조도
## 업무 개선 보드 시스템

---

## 시스템 아키텍처 다이어그램

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#FF6B6B'}}}%%
flowchart TB
    subgraph Client["클라이언트 계층"]
        Browser[("🖥️ 브라우저<br/>Desktop/Mobile")]
    end

    subgraph Frontend["프론트엔드 계층"]
        React["⚛️ React SPA<br/>TypeScript + Tailwind"]
    end

    subgraph Backend["백엔드 계층"]
        API["🚀 Express API<br/>Node.js"]
        Auth["🔐 Auth Service"]
        Item["📝 Item Service"]
        User["👤 User Service"]
    end

    subgraph Data["데이터 계층"]
        PG[("🐘 PostgreSQL<br/>Main Database")]
        Redis[("⚡ Redis<br/>Cache/Session")]
        Files[("📁 File Storage<br/>Attachments")]
    end

    Browser -->|HTTPS| React
    React -->|REST API| API
    API --> Auth
    API --> Item
    API --> User
    Auth --> PG
    Auth --> Redis
    Item --> PG
    Item --> Files
    User --> PG
```

---

## 계층 설명

| 계층 | 구성요소 | 역할 |
|------|----------|------|
| 클라이언트 | 브라우저 | 사용자 인터페이스 |
| 프론트엔드 | React SPA | UI 렌더링, 상태 관리 |
| 백엔드 | Express API | 비즈니스 로직, 인증 |
| 데이터 | PostgreSQL, Redis | 데이터 저장, 캐싱 |

---

## 데이터 흐름

1. **사용자** → 브라우저에서 요청
2. **React SPA** → API 호출 (REST)
3. **Express API** → 서비스 레이어 처리
4. **서비스** → 데이터베이스 조회/저장
5. **응답** → 역순으로 반환
