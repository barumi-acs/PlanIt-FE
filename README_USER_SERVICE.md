# PlanIt Frontend - User Service Integration

User Service와 연동된 프론트엔드 기능 문서입니다.

## 구현된 기능

### 인증 (Authentication)
- ✅ 회원가입 페이지 (`/signup`)
- ✅ 로그인 페이지 (`/login`)
- ✅ AuthContext (전역 인증 상태 관리)
- ✅ JWT 토큰 관리 (localStorage)

### 프로필 (Profile)
- ✅ 프로필 페이지 (`/profile`)
- ✅ 프로필 수정 (닉네임, 관심 카테고리)
- ✅ 로그아웃
- ✅ 계정 삭제

### 친구 (Friends)
- ✅ 친구 페이지 (`/friends`)
- ✅ 친구 목록 조회 (페이지네이션)
- ✅ 받은 친구 요청 목록
- ✅ 친구 요청 수락/거절
- ✅ 친구 삭제

## 파일 구조

```
src/
├── api/
│   └── user.service.ts          # User Service API 클라이언트
├── features/
│   ├── auth/
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # 인증 Context
│   │   ├── hooks/
│   │   │   └── useCategories.ts # 카테고리 조회 Hook
│   │   └── pages/
│   │       ├── SignupPage.tsx   # 회원가입 페이지
│   │       └── LoginPage.tsx    # 로그인 페이지
│   ├── profile/
│   │   └── pages/
│   │       └── ProfilePage.tsx  # 프로필 페이지
│   └── friends/
│       ├── hooks/
│       │   └── useFriends.ts    # 친구 관련 Hooks
│       └── pages/
│           └── FriendsPage.tsx  # 친구 페이지
```

## API 사용 예시

### 회원가입
```typescript
import { userService } from '../api/user.service';

const response = await userService.signup({
  nickname: '홍길동',
  email: 'hong@example.com',
  cognitoIdToken: 'cognito-id-token',
  agreedTermIds: [1, 2],
  interestCategoryIds: [1, 3, 5],
  isRetentionAgreed: true,
});

// response: { userId, nickname, email, accessToken, refreshToken }
```

### 로그인
```typescript
const response = await userService.login({
  cognitoIdToken: 'cognito-id-token',
});

// response: { userId, nickname, email, accessToken, refreshToken }
```

### 프로필 수정
```typescript
const response = await userService.updateProfile({
  nickname: '새로운닉네임',
  interestCategoryIds: [2, 4, 6],
});

// response: { userId, nickname, email, interests }
```

### 친구 목록 조회
```typescript
const response = await userService.getFriends(0, 20);

// response: { content: [...], totalElements, totalPages, size, number }
```

## Custom Hooks 사용법

### useAuth
```typescript
import { useAuth } from '../features/auth/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>로그인이 필요합니다.</div>;
  }
  
  return <div>안녕하세요, {user?.nickname}님!</div>;
}
```

### useCategories
```typescript
import { useCategories } from '../features/auth/hooks/useCategories';

function CategorySelector() {
  const { data: categories, isLoading } = useCategories();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {categories?.map(cat => (
        <div key={cat.categoryId}>{cat.name}</div>
      ))}
    </div>
  );
}
```

### useFriends
```typescript
import { useFriends } from '../features/friends/hooks/useFriends';

function FriendsList() {
  const { data, isLoading } = useFriends(0, 20);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {data?.content.map(friend => (
        <div key={friend.friendshipId}>{friend.nickname}</div>
      ))}
    </div>
  );
}
```

### useProcessFriendRequest
```typescript
import { useProcessFriendRequest } from '../features/friends/hooks/useFriends';

function FriendRequestItem({ request }) {
  const processMutation = useProcessFriendRequest();
  
  const handleAccept = () => {
    processMutation.mutate({
      friendshipId: request.friendshipId,
      action: 'ACCEPTED',
    });
  };
  
  return (
    <div>
      <span>{request.nickname}</span>
      <button onClick={handleAccept}>수락</button>
    </div>
  );
}
```

## 환경 변수

`.env.development` 파일에 다음 변수를 설정하세요:

```env
VITE_USER_SERVICE_URL=http://localhost:8080
```

## 라우팅 설정

`App.tsx`에 다음 라우트를 추가하세요:

```typescript
import { SignupPage } from './features/auth/pages/SignupPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { FriendsPage } from './features/friends/pages/FriendsPage';

<Routes>
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/friends" element={<FriendsPage />} />
</Routes>
```

## AuthProvider 설정

`main.tsx` 또는 `App.tsx`에서 AuthProvider로 앱을 감싸세요:

```typescript
import { AuthProvider } from './features/auth/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryClientProvider>
```

## 타입 정의

모든 타입은 `user.service.ts`에 정의되어 있습니다:

- `Category` - 관심 카테고리
- `UserProfile` - 사용자 프로필
- `SignupRequest` - 회원가입 요청
- `LoginRequest` - 로그인 요청
- `AuthResponse` - 인증 응답
- `UpdateProfileRequest` - 프로필 수정 요청
- `Friend` - 친구 정보
- `FriendRequest` - 친구 요청
- `ProcessFriendRequestRequest` - 친구 요청 처리
- `Term` - 약관
- `PageResponse<T>` - 페이지네이션 응답

## 에러 처리

모든 API 호출은 try-catch로 감싸거나 React Query의 onError를 사용하여 에러를 처리하세요:

```typescript
const mutation = useMutation({
  mutationFn: userService.signup,
  onError: (error) => {
    console.error('회원가입 실패:', error);
    alert(error.message || '회원가입에 실패했습니다.');
  },
});
```

## 다음 단계

1. AWS Cognito 연동 구현
2. 유저 검색 기능 추가
3. 친구 요청 보내기 기능 추가
4. 프로필 이미지 업로드
5. 알림 기능 (친구 요청 알림)
