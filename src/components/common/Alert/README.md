# Alert 공통 모듈

Toast 스타일의 Alert 컴포넌트입니다. Context + Hook 방식으로 전역에서 사용 가능합니다.

## 📁 파일 구조

```
Alert/
├── Alert.tsx           # Alert UI 컴포넌트
├── AlertProvider.tsx   # Context Provider
├── useAlert.ts         # Custom Hook
├── types.ts            # 타입 정의
├── index.ts            # Export
└── README.md           # 이 파일
```

## 🎨 Alert 타입

- **success**: 성공 메시지 (초록색, ✓ 아이콘)
- **error**: 에러 메시지 (빨간색, ✕ 아이콘)
- **warning**: 경고 메시지 (노란색, ⚠ 아이콘)
- **info**: 정보 메시지 (파란색, ℹ 아이콘)

## 🚀 사용 방법

### 1. Provider 설정 (이미 완료)

`App.tsx`에 `AlertProvider`가 추가되어 있습니다:

```tsx
<AuthProvider>
  <AlertProvider>
    <Routes>
      ...
    </Routes>
  </AlertProvider>
</AuthProvider>
```

### 2. 컴포넌트에서 사용

```tsx
import { useAlert } from '@/components/common/Alert';

function MyComponent() {
  const { success, error, warning, info } = useAlert();

  const handleSave = async () => {
    try {
      await saveData();
      success('저장되었습니다!');
    } catch (err) {
      error('저장에 실패했습니다.');
    }
  };

  const handleValidation = () => {
    if (items.length < 3) {
      warning('최소 3개 이상 선택해주세요.');
      return;
    }
  };

  return <button onClick={handleSave}>저장</button>;
}
```

## 📝 API

### useAlert Hook

```typescript
const {
  success,  // (message: string, duration?: number) => void
  error,    // (message: string, duration?: number) => void
  warning,  // (message: string, duration?: number) => void
  info,     // (message: string, duration?: number) => void
} = useAlert();
```

### 메서드

#### success(message, duration?)
성공 메시지를 표시합니다.

```tsx
success('계획이 저장되었습니다!');
success('처리 완료', 5000); // 5초 동안 표시
```

#### error(message, duration?)
에러 메시지를 표시합니다.

```tsx
error('로그인에 실패했습니다.');
error('네트워크 오류가 발생했습니다.', 4000);
```

#### warning(message, duration?)
경고 메시지를 표시합니다.

```tsx
warning('카테고리를 3개 이상 선택해주세요.');
warning('입력값을 확인해주세요.');
```

#### info(message, duration?)
정보 메시지를 표시합니다.

```tsx
info('처리 중입니다...');
info('잠시만 기다려주세요.', 2000);
```

## 🔄 기존 alert() 대체 방법

### Before (기존 코드)
```tsx
alert('저장되었습니다!');
alert('카테고리를 3개 이상 선택해주세요.');
```

### After (새로운 코드)
```tsx
import { useAlert } from '@/components/common/Alert';

const { success, warning } = useAlert();

success('저장되었습니다!');
warning('카테고리를 3개 이상 선택해주세요.');
```

## 🎯 실제 적용 예시

### 예시 1: MyPage.tsx

```tsx
// Before
const handleSaveProfile = async () => {
  if (tempCategoryIds.length < 3) {
    alert('카테고리를 최소 3개 이상 선택해주세요.');
    return;
  }
  // ...
};

// After
import { useAlert } from '@/components/common/Alert';

const MyPage = () => {
  const { warning, success, error } = useAlert();

  const handleSaveProfile = async () => {
    if (tempCategoryIds.length < 3) {
      warning('카테고리를 최소 3개 이상 선택해주세요.');
      return;
    }

    try {
      await saveProfile();
      success('프로필이 저장되었습니다!');
    } catch (err) {
      error('프로필 저장에 실패했습니다.');
    }
  };
};
```

### 예시 2: useAiPlan.ts

```tsx
// Before
alert("AI 계획 생성에 실패했습니다. 다시 시도해주세요.");
alert(`계획이 저장되었습니다! (Goal ID: ${response.goalId})`);

// After
import { useAlert } from '@/components/common/Alert';

const useAiPlan = () => {
  const { error, success } = useAlert();

  const generatePlan = async () => {
    try {
      // ...
    } catch (err) {
      error("AI 계획 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const savePlan = async () => {
    const response = await strategyService.savePlan(saveRequest);
    success(`계획이 저장되었습니다! (Goal ID: ${response.goalId})`);
  };
};
```

## ⚙️ 설정

### 기본 duration
기본값: 3000ms (3초)

### 최대 표시 개수
최대 3개까지 동시 표시 (오래된 것부터 자동 제거)

### 위치
화면 상단 중앙 (fixed position)

### z-index
9999 (다른 요소 위에 표시)

## 🎨 디자인

프로젝트의 색상 시스템을 따릅니다:
- Primary: #7C5CFF
- Success: #10B981 (green)
- Error: #EF4444 (red)
- Warning: #F59E0B (amber)
- Info: #3B82F6 (blue)

## ♿ 접근성

- `role="alert"` 속성으로 스크린 리더 지원
- `aria-live="polite"` 로 알림 읽기
- 키보드로 닫기 가능
- 충분한 색상 대비

## 📊 마이그레이션 현황

총 17곳의 alert() 사용:
- [ ] useAiPlan.ts (4곳)
- [ ] MyPage.tsx (3곳)
- [ ] ProfilePage.tsx (4곳)
- [ ] OnboardingPage.tsx (4곳)
- [ ] FriendsPage.tsx (1곳)
- [ ] CallbackPage.tsx (4곳)
- [ ] useCognitoAuth.ts (1곳)

## 🔧 트러블슈팅

### Alert가 표시되지 않는 경우
1. `AlertProvider`가 `App.tsx`에 추가되었는지 확인
2. `useAlert`를 Provider 내부에서 호출하는지 확인
3. 브라우저 콘솔에서 에러 확인

### 스타일이 깨지는 경우
1. Tailwind CSS가 제대로 설정되었는지 확인
2. `index.css`가 import 되었는지 확인

## 📚 참고

- Context API: React 공식 문서
- Tailwind CSS: https://tailwindcss.com
- 접근성: WCAG 2.1 AA 기준
