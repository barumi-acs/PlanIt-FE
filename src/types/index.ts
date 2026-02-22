export interface Task {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  category: string;
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

export type ViewMode = 'daily' | 'weekly' | 'monthly';
export type Tab = 'friends' | 'todo' | 'home' | 'mypage' | 'report' | 'ai-todo';

export interface UserProfile {
  id: string;
  nickname: string;
  keywords: string[];
  email: string;
}
