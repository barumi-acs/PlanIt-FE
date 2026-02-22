import { useState } from 'react';
import { Task } from '../../../types';

export const useTasks = (selectedKeywords: string[]) => {
  const today = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: '아침 조깅 30분', date: today, completed: false, category: '운동' },
    { id: '2', text: '경제 뉴스 읽기', date: today, completed: true, category: '투자' },
    { id: '3', text: '명상 10분', date: today, completed: true, category: '마인드 컨트롤' },
    { id: '4', text: '코딩 강의 수강', date: today, completed: false, category: '코딩' },
    { id: '5', text: '독서 30분', date: today, completed: true, category: '독서' },
    { id: '6', text: '영어 회화 연습', date: today, completed: false, category: '언어' },
    { id: '7', text: '플랭크 3분', date: today, completed: true, category: '운동' },
    { id: '8', text: '일기 쓰기', date: today, completed: true, category: '심리' },
    { id: '9', text: '내일 계획 세우기', date: today, completed: true, category: '시간관리' },
    { id: '10', text: '물 2L 마시기', date: today, completed: true, category: '운동' },
    { id: '11', text: '비타민 챙겨먹기', date: today, completed: true, category: '운동' },
  ]);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const addTask = (date: string) => {
    if (!newTaskText.trim()) {
      setIsAddingTask(false);
      return;
    }
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      date: date,
      completed: false,
      category: newTaskCategory || selectedKeywords[0] || '기타'
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskCategory('');
    setIsAddingTask(false);
  };

  const updateTask = (id: string, newText: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
    setEditingTaskId(null);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setActiveMenuId(null);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const postponeTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const date = new Date(t.date);
        date.setDate(date.getDate() + 1);
        return { ...t, date: date.toISOString().split('T')[0] };
      }
      return t;
    }));
    setActiveMenuId(null);
  };

  return {
    tasks,
    setTasks,
    editingTaskId,
    setEditingTaskId,
    newTaskText,
    setNewTaskText,
    newTaskCategory,
    setNewTaskCategory,
    isAddingTask,
    setIsAddingTask,
    activeMenuId,
    setActiveMenuId,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    postponeTask
  };
};
