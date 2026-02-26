export interface Task {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  category: string;
  goalId?: string; // 연결된 목표 ID (optional)
  weekIndex?: number; // 연결된 주차 인덱스 (optional)
}

export interface MonthlyGoal {
  id: string;
  title: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  weeklyGoals: string[];
}

export interface Friend {
  id: string;
  nickname: string;
  tasks: Task[];
}

export interface FriendRequest {
  id: string;
  nickname: string;
}

export type ViewMode = 'daily' | 'weekly' | 'goals';
export type Tab = 'friends' | 'todo' | 'home' | 'mypage' | 'report' | 'ai-todo';

export interface UserProfile {
  id: string;
  nickname: string;
  keywords: string[];
  email: string;
}
