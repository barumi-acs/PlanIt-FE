/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseApiService, apiClients } from './base';
import { Task } from '../types';

/**
 * Task 생성 요청 타입
 */
export interface CreateTaskRequest {
  text: string;
  date: string;
  category: string;
  completed?: boolean;
}

/**
 * Task 수정 요청 타입
 */
export interface UpdateTaskRequest {
  text?: string;
  date?: string;
  category?: string;
  completed?: boolean;
}

// Mock 데이터 (개발용)
let mockTasks: Task[] = [
  { id: '1', text: '아침 조깅 30분', date: new Date().toISOString().split('T')[0], completed: false, category: '운동' },
  { id: '2', text: '경제 뉴스 읽기', date: new Date().toISOString().split('T')[0], completed: true, category: '투자' },
];

/**
 * Schedule Service API
 * 일정 및 할일 관리를 담당
 */
class ScheduleService extends BaseApiService {
  // Mock 모드 여부 (개발 환경에서는 true)
  private useMock = import.meta.env.DEV;

  constructor() {
    super(apiClients.schedule);
  }

  /**
   * 할일 목록 조회
   */
  async getTasks(date?: string): Promise<Task[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (date) {
        return mockTasks.filter(t => t.date === date);
      }
      return mockTasks;
    }
    const params = date ? { date } : undefined;
    return this.get<Task[]>('/api/v1/tasks', { params });
  }

  /**
   * 특정 할일 조회
   */
  async getTask(taskId: string): Promise<Task> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      return task;
    }
    return this.get<Task>(`/api/v1/tasks/${taskId}`);
  }

  /**
   * 할일 생성
   */
  async createTask(task: CreateTaskRequest): Promise<Task> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        completed: task.completed || false,
      };
      mockTasks = [...mockTasks, newTask];
      return newTask;
    }
    return this.post<Task>('/api/v1/tasks', task);
  }

  /**
   * 할일 수정
   */
  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockTasks = mockTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      const updated = mockTasks.find(t => t.id === taskId);
      if (!updated) throw new Error('Task not found');
      return updated;
    }
    return this.patch<Task>(`/api/v1/tasks/${taskId}`, updates);
  }

  /**
   * 할일 삭제
   */
  async deleteTask(taskId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockTasks = mockTasks.filter(t => t.id !== taskId);
      return;
    }
    return this.delete<void>(`/api/v1/tasks/${taskId}`);
  }

  /**
   * 할일 완료 상태 토글
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockTasks = mockTasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const updated = mockTasks.find(t => t.id === taskId);
      if (!updated) throw new Error('Task not found');
      return updated;
    }
    return this.post<Task>(`/api/v1/tasks/${taskId}/toggle`);
  }

  /**
   * 할일 미루기 (다음날로 연기)
   */
  async postponeTask(taskId: string): Promise<Task> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const date = new Date(task.date);
      date.setDate(date.getDate() + 1);
      const newDate = date.toISOString().split('T')[0];

      return this.updateTask(taskId, { date: newDate });
    }
    return this.post<Task>(`/api/v1/tasks/${taskId}/postpone`);
  }

  /**
   * 기간별 할일 조회
   */
  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTasks.filter(t => t.date >= startDate && t.date <= endDate);
    }
    return this.get<Task[]>('/api/v1/tasks/range', {
      params: { startDate, endDate },
    });
  }

  /**
   * 친구의 할일 조회
   */
  async getFriendTasks(friendId: string, date?: string): Promise<Task[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock: 친구의 할일 샘플 데이터
      const today = new Date().toISOString().split('T')[0];
      return [
        { id: 'f1', text: '아침 러닝 5km', date: today, completed: true, category: '운동' },
        { id: 'f2', text: 'TypeScript 공부 1시간', date: today, completed: false, category: '개발' },
        { id: 'f3', text: '영어 단어 50개 암기', date: today, completed: false, category: '학습' },
        { id: 'f4', text: '독서 30분', date: today, completed: true, category: '자기계발' },
        { id: 'f5', text: '명상 10분', date: today, completed: false, category: '건강' },
      ];
    }
    const params = date ? { date } : undefined;
    return this.get<Task[]>(`/api/v1/tasks/friends/${friendId}`, { params });
  }
}

export const scheduleService = new ScheduleService();

// 하위 호환성을 위한 별칭 export
export const tasksApi = {
  getTasks: (date?: string) => scheduleService.getTasks(date),
  addTask: (task: Omit<Task, 'id'>) => scheduleService.createTask(task),
  updateTask: (id: string, updates: Partial<Task>) => scheduleService.updateTask(id, updates),
  deleteTask: (id: string) => scheduleService.deleteTask(id),
  postponeTask: (id: string) => scheduleService.postponeTask(id),
};
