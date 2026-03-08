# 챗봇 API 마이그레이션 가이드 (프론트엔드)

## 변경 사항 요약

챗봇 API 호출 경로가 변경되었습니다.

| 항목 | 기존 | 신규 |
|------|------|------|
| Base URL | `VITE_INSIGHTAI_SERVICE_URL` (8085) | `VITE_INSIGHT_SERVICE_URL` (8084) |
| Endpoint | `/ai/chat/query` | `/api/v1/insight/chat/query` |
| 서버 | Python 직접 호출 | Java BFF 경유 |

## 1. 환경 변수 업데이트

### .env.development

```bash
# ✅ 신규: Java BFF 사용
VITE_INSIGHT_SERVICE_URL=http://localhost:8084

# ❌ 기존: Python 직접 호출 (Deprecated)
# VITE_INSIGHTAI_SERVICE_URL=http://localhost:8085
```

### .env.production

```bash
# ✅ 신규: Java BFF 사용
VITE_INSIGHT_SERVICE_URL=https://api.planit.com/insight

# ❌ 기존: Python 직접 호출 (Deprecated)
# VITE_INSIGHTAI_SERVICE_URL=https://api.planit.com/insightai
```

## 2. API 서비스 코드 수정

### 기존 코드 (Deprecated)

```typescript
// ❌ src/services/chatbotService.ts (기존)

const INSIGHTAI_BASE_URL = import.meta.env.VITE_INSIGHTAI_SERVICE_URL;

export const chatbotService = {
  async query(userId: string, query: string) {
    const response = await fetch(`${INSIGHTAI_BASE_URL}/ai/chat/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,  // snake_case
        query: query
      })
    });

    return response.json();
  }
};
```

### 신규 코드 (BFF)

```typescript
// ✅ src/services/chatbotService.ts (신규)

const INSIGHT_BASE_URL = import.meta.env.VITE_INSIGHT_SERVICE_URL;

export interface ChatbotRequest {
  userId: string;  // camelCase
  query: string;
}

export interface ChatbotResponse {
  answer: string;
  sources: string[];
  generatedAt: string;
}

export const chatbotService = {
  /**
   * 챗봇 질의
   * 
   * @param request 챗봇 질의 요청
   * @returns ChatbotResponse AI 생성 답변
   */
  async query(request: ChatbotRequest): Promise<ChatbotResponse> {
    const response = await fetch(`${INSIGHT_BASE_URL}/api/v1/insight/chat/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Chatbot query failed');
    }

    return response.json();
  }
};
```

## 3. React 컴포넌트 예시

### 기본 사용법

```typescript
// src/components/Chatbot.tsx

import { useState } from 'react';
import { chatbotService, ChatbotRequest, ChatbotResponse } from '@/services/chatbotService';

export function Chatbot() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const request: ChatbotRequest = {
        userId: 'user-001', // 실제로는 로그인한 사용자 ID 사용
        query: query.trim()
      };

      const result = await chatbotService.query(request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '챗봇 질의 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문을 입력하세요..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '질문하기'}
        </button>
      </form>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {response && (
        <div className="response">
          <div className="answer">{response.answer}</div>
          <div className="sources">
            출처: {response.sources.join(', ')}
          </div>
          <div className="timestamp">
            {new Date(response.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Axios 사용 예시

```typescript
// src/services/chatbotService.ts (Axios 버전)

import axios from 'axios';

const INSIGHT_BASE_URL = import.meta.env.VITE_INSIGHT_SERVICE_URL;

const apiClient = axios.create({
  baseURL: INSIGHT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초
});

export const chatbotService = {
  async query(request: ChatbotRequest): Promise<ChatbotResponse> {
    const { data } = await apiClient.post<ChatbotResponse>(
      '/api/v1/insight/chat/query',
      request
    );
    return data;
  }
};
```

### React Query 사용 예시

```typescript
// src/hooks/useChatbot.ts

import { useMutation } from '@tanstack/react-query';
import { chatbotService, ChatbotRequest, ChatbotResponse } from '@/services/chatbotService';

export function useChatbot() {
  return useMutation<ChatbotResponse, Error, ChatbotRequest>({
    mutationFn: (request) => chatbotService.query(request),
    onError: (error) => {
      console.error('Chatbot query failed:', error);
    }
  });
}

// 컴포넌트에서 사용
function ChatbotComponent() {
  const { mutate, data, isLoading, error } = useChatbot();

  const handleQuery = (query: string) => {
    mutate({
      userId: 'user-001',
      query: query
    });
  };

  return (
    // ... UI 렌더링
  );
}
```

## 4. 에러 처리

### 에러 타입

```typescript
interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

export const chatbotService = {
  async query(request: ChatbotRequest): Promise<ChatbotResponse> {
    try {
      const response = await fetch(`${INSIGHT_BASE_URL}/api/v1/insight/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        // 네트워크 에러
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      }
      throw error;
    }
  }
};
```

## 5. 테스트

### 단위 테스트 (Vitest)

```typescript
// src/services/chatbotService.test.ts

import { describe, it, expect, vi } from 'vitest';
import { chatbotService } from './chatbotService';

describe('chatbotService', () => {
  it('should query chatbot successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: '테스트 답변',
        sources: ['test'],
        generatedAt: '2026-03-08T10:00:00'
      })
    });

    const result = await chatbotService.query({
      userId: 'test-user',
      query: '테스트 질문'
    });

    expect(result.answer).toBe('테스트 답변');
    expect(result.sources).toContain('test');
  });

  it('should handle error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Error occurred'
      })
    });

    await expect(
      chatbotService.query({
        userId: 'test-user',
        query: '테스트 질문'
      })
    ).rejects.toThrow('Error occurred');
  });
});
```

## 6. 마이그레이션 체크리스트

- [ ] `.env.development` 업데이트
- [ ] `.env.production` 업데이트
- [ ] `chatbotService.ts` 코드 수정
  - [ ] Base URL 변경
  - [ ] Endpoint 경로 변경
  - [ ] Request/Response 타입 확인
- [ ] 컴포넌트 테스트
- [ ] 에러 처리 확인
- [ ] 프로덕션 배포 전 검증

## 7. 롤백 방법

문제 발생 시 기존 방식으로 롤백:

```typescript
// 1. 환경 변수 원복
VITE_INSIGHTAI_SERVICE_URL=http://localhost:8085

// 2. 코드 원복
const response = await fetch(`${INSIGHTAI_BASE_URL}/ai/chat/query`, {
  // ...
});
```

## 8. 참고 사항

### 요청/응답 포맷 변경 없음

기존과 동일한 포맷 사용:

```typescript
// Request (동일)
{
  "userId": "user-001",
  "query": "질문 내용"
}

// Response (동일)
{
  "answer": "답변 내용",
  "sources": ["출처1", "출처2"],
  "generatedAt": "2026-03-08T10:00:00"
}
```

### 성능 개선

- Java BFF를 통한 gRPC 통신으로 성능 향상
- HTTP/2 멀티플렉싱 지원
- Protobuf 바이너리 직렬화

### 보안 강화

- Python 서버 외부 노출 차단
- Java BFF에서 인증/인가 중앙 집중화
- CORS 정책 통일

---

**마이그레이션 완료 일시**: 2026-03-08  
**문의**: 백엔드 팀
