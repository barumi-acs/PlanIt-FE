/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseApiService, apiClients } from './base';

// ─── 백엔드 응답 타입 ─────────────────────────────────────────────────────────

/** 일간 할 일 단일 항목 (백엔드 DailyTaskItem) */
export interface DailyTaskItem {
  taskId: number;
  weekGoalsId: number;
  weekGoalsTitle: string;
  category?: string; // 화면 표시용 카테고리 (목표 없음 할 일에 사용)
  content: string;
  complete: boolean;
  targetDate: string; // "yyyy-MM-dd"
}

/** GET /api/v1/schedules/tasks/daily 응답 */
export interface DailyTaskResponse {
  targetDate: string;
  totalCount: number;
  completedCount: number;
  progressRate: number; // 0~100
  tasks: DailyTaskItem[];
}

/** POST /api/v1/schedules/tasks 응답 */
export interface TaskResponse {
  taskId: number;
  weekGoalsId: number;
  content: string;
  complete: boolean;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

/** PATCH /api/v1/schedules/tasks/{taskId} 응답 */
export interface UpdateTaskResponse {
  taskId: number;
  content: string;
  updatedAt: string;
}

/** PATCH /api/v1/schedules/tasks/{taskId}/complete 응답 */
export interface CompleteTaskResponse {
  taskId: number;
  complete: boolean;
  updatedAt: string;
}

/** PATCH /api/v1/schedules/tasks/{taskId}/postpone 응답 */
export interface PostponeTaskResponse {
  taskId: number;
  content: string;
  targetDate: string;
  updatedAt: string;
}

/** 친구 할 일 단일 항목 */
export interface FriendTaskItem {
  taskId: number;
  weekGoalsId: number;
  weekGoalsTitle: string;
  content: string;
  complete: boolean;
  targetDate: string;
}

/** GET /api/v1/schedules/tasks/friend/{friendUserId} 응답 */
export interface FriendTaskResponse {
  friendUserId: string;
  targetDate: string;
  tasks: FriendTaskItem[];
}

// ─── 요청 타입 ────────────────────────────────────────────────────────────────

/** POST /api/v1/schedules/tasks 요청 */
export interface CreateTaskRequest {
  weekGoalsId?: number | null; // 목표 없음이면 null
  category?: string; // 목표 없음 할 일에서 메인 목표 제목 또는 키워드
  content: string;
  targetDate: string; // "yyyy-MM-dd"
}

/** PATCH /api/v1/schedules/tasks/{taskId} 요청 */
export interface UpdateTaskRequest {
  content: string;
}

// ─── 이모지 타입 ───────────────────────────────────────────────────────────────

export interface EmojiResponse {
  emojiId: number;
  emojiChar: string;
  name: string;
}

export interface TaskEmojiGroupResponse {
  emojiId: number;
  emojiChar: string;
  name: string;
  count: number;
  myReaction: boolean;
}

export interface TaskReactionListResponse {
  taskId: number;
  reactions: TaskEmojiGroupResponse[];
}

export interface AddEmojiReactionRequest {
  emojiId: number;
}

export interface AddEmojiReactionResponse {
  taskEmojiId: number;
  taskId: number;
  emojiId: number;
  emojiChar: string;
  userId: string;
  createdAt: string;
}

// ─── Goal / WeekGoal 응답·요청 타입 ───────────────────────────────────────────

/** GET /api/v1/schedules/goals?userId=... 단일 항목 */
export interface GoalApiResponse {
  goalsId: number;
  categoryId: number | null;
  title: string;
  startDate: string; // "yyyy-MM-dd"
  endDate: string;   // "yyyy-MM-dd"
}

/** 주간 목표 + 진행률 (GoalDetailResponse 하위 항목) */
export interface BackendWeekGoal {
  weekGoalsId: number;
  title: string;
  progressRate: number; // 0~100
}

/** GET /api/v1/schedules/goals/{goalsId} 응답 */
export interface GoalDetailApiResponse {
  goalsId: number;
  title: string;
  startDate: string;
  endDate: string;
  progressRate: number; // 0~100
  weekGoals: BackendWeekGoal[];
}

/** POST /api/v1/schedules/goals 요청 */
export interface CreateGoalApiRequest {
  /** category_list.list_id 문자열 (ex. "1" = 직무/커리어) */
  category: string;
  title: string;
  startDate: string; // "yyyy-MM-dd"
  endDate: string;   // "yyyy-MM-dd"
}

/** POST /api/v1/schedules/goals/{goalsId}/week-goals 요청 */
export interface CreateWeekGoalApiRequest {
  title: string;
}

/** POST /api/v1/schedules/goals/{goalsId}/week-goals 응답 */
export interface WeekGoalApiResponse {
  weekGoalsId: number;
  goalsId: number;
  title: string;
}

// ─── userId 가져오기 (JWT 연동 전 임시) ──────────────────────────────────────

/**
 * 현재 사용자 ID 반환
 * - JWT 연동 후: localStorage에서 파싱한 JWT claim으로 교체
 * - 개발 단계: localStorage 'userId' 없으면 'dev-user-001' 기본값
 */
const getMyUserId = (): string => {
  return localStorage.getItem('userId') || 'dev-user-001';
};

// ─── Schedule Service ────────────────────────────────────────────────────────

class ScheduleService extends BaseApiService {
  constructor() {
    super(apiClients.schedule);
  }

  // ── Task CRUD ─────────────────────────────────────────────────────────────

  /** 일간 할 일 조회 */
  async getDailyTasks(targetDate: string): Promise<DailyTaskResponse> {
    return this.get<DailyTaskResponse>('/api/v1/schedules/tasks/daily', {
      params: { myUserId: getMyUserId(), targetDate },
    });
  }

  /** 할 일 생성 */
  async createTask(req: CreateTaskRequest): Promise<TaskResponse> {
    return this.post<TaskResponse>('/api/v1/schedules/tasks', req);
  }

  /** 할 일 내용 수정 */
  async updateTask(taskId: number, req: UpdateTaskRequest): Promise<UpdateTaskResponse> {
    return this.patch<UpdateTaskResponse>(`/api/v1/schedules/tasks/${taskId}`, req);
  }

  /** 할 일 완료 토글 */
  async toggleTaskCompletion(taskId: number): Promise<CompleteTaskResponse> {
    return this.patch<CompleteTaskResponse>(`/api/v1/schedules/tasks/${taskId}/complete`);
  }

  /** 할 일 삭제 (Soft Delete) */
  async deleteTask(taskId: number): Promise<void> {
    return this.delete<void>(`/api/v1/schedules/tasks/${taskId}`);
  }

  /** 할 일 미루기 (+1일) */
  async postponeTask(taskId: number): Promise<PostponeTaskResponse> {
    return this.patch<PostponeTaskResponse>(`/api/v1/schedules/tasks/${taskId}/postpone`);
  }

  /** 친구의 일간 할 일 조회 */
  async getFriendTasks(friendUserId: string, targetDate: string): Promise<FriendTaskResponse> {
    return this.get<FriendTaskResponse>(`/api/v1/schedules/tasks/friend/${friendUserId}`, {
      params: { myUserId: getMyUserId(), targetDate },
    });
  }

  // ── 이모지 ───────────────────────────────────────────────────────────────

  /** 이모지 목록 전체 조회 */
  async getEmojiList(): Promise<EmojiResponse[]> {
    return this.get<EmojiResponse[]>('/api/v1/schedules/emojis');
  }

  /** 할 일의 이모지 반응 목록 조회 (이모지별 그룹) */
  async getTaskReactions(taskId: number): Promise<TaskReactionListResponse> {
    return this.get<TaskReactionListResponse>(`/api/v1/schedules/tasks/${taskId}/emojis`, {
      params: { userId: getMyUserId() },
    });
  }

  /** 이모지 리액션 등록 */
  async addEmojiReaction(taskId: number, req: AddEmojiReactionRequest): Promise<AddEmojiReactionResponse> {
    return this.post<AddEmojiReactionResponse>(`/api/v1/schedules/tasks/${taskId}/emojis`, req, {
      params: { userId: getMyUserId() },
    });
  }

  /** 이모지 리액션 삭제 */
  async deleteEmojiReaction(taskId: number, emojiId: number): Promise<void> {
    return this.delete<void>(`/api/v1/schedules/tasks/${taskId}/emojis/${emojiId}`, {
      params: { userId: getMyUserId() },
    });
  }

  // ── Goal & WeekGoal ───────────────────────────────────────────────────────

  /** 내 목표 목록 조회 */
  async getGoals(): Promise<GoalApiResponse[]> {
    return this.get<GoalApiResponse[]>('/api/v1/schedules/goals', {
      params: { userId: getMyUserId() },
    });
  }

  /** 목표 상세 조회 (주간 목표 + 진행률 포함) */
  async getGoalDetail(goalsId: number): Promise<GoalDetailApiResponse> {
    return this.get<GoalDetailApiResponse>(`/api/v1/schedules/goals/${goalsId}`);
  }

  /** 목표 생성 */
  async createGoal(req: CreateGoalApiRequest): Promise<GoalApiResponse> {
    return this.post<GoalApiResponse>('/api/v1/schedules/goals', req, {
      params: { userId: getMyUserId() },
    });
  }

  /** 목표 삭제 */
  async deleteGoal(goalsId: number): Promise<void> {
    return this.delete<void>(`/api/v1/schedules/goals/${goalsId}`);
  }

  /** 주간 목표 생성 */
  async createWeekGoal(goalsId: number, req: CreateWeekGoalApiRequest): Promise<WeekGoalApiResponse> {
    return this.post<WeekGoalApiResponse>(`/api/v1/schedules/goals/${goalsId}/week-goals`, req);
  }
}

export const scheduleService = new ScheduleService();
