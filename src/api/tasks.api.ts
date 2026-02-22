/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';

// Mock database in memory for the demo
let mockTasks: Task[] = [
  { id: '1', text: '아침 조깅 30분', date: new Date().toISOString().split('T')[0], completed: false, category: '운동' },
  { id: '2', text: '경제 뉴스 읽기', date: new Date().toISOString().split('T')[0], completed: true, category: '투자' },
];

export const tasksApi = {
  getTasks: async (date?: string): Promise<Task[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    if (date) {
      return mockTasks.filter(t => t.date === date);
    }
    return mockTasks;
  },

  addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    mockTasks = [...mockTasks, newTask];
    return newTask;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    mockTasks = mockTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    const updated = mockTasks.find(t => t.id === id);
    if (!updated) throw new Error('Task not found');
    return updated;
  },

  deleteTask: async (id: string): Promise<void> => {
    mockTasks = mockTasks.filter(t => t.id !== id);
  },

  postponeTask: async (id: string): Promise<Task> => {
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    
    const date = new Date(task.date);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    
    return tasksApi.updateTask(id, { date: newDate });
  }
};
