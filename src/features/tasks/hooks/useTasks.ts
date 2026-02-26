import { useState } from 'react';
import { Task, MonthlyGoal } from '../../../types';

export const useTasks = (selectedKeywords: string[]) => {
  const today = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState<Task[]>([
    // 목표 없는 할 일들
    { id: '1', text: '아침 조깅 30분', date: today, completed: false, category: '운동' },
    { id: '2', text: '경제 뉴스 읽기', date: today, completed: true, category: '투자' },
    { id: '3', text: '명상 10분', date: today, completed: true, category: '마인드 컨트롤' },
    
    // 목표와 연결된 할 일들
    { id: '4', text: '아침 조깅 루틴 완성하기', date: today, completed: false, category: '운동', goalId: 'goal1', weekIndex: 0 },
    { id: '5', text: '스쿼트 3세트 하기', date: today, completed: false, category: '운동', goalId: 'goal1', weekIndex: 1 },
    { id: '6', text: 'React Hooks 문서 읽기', date: today, completed: true, category: '코딩', goalId: 'goal2', weekIndex: 0 },
    { id: '7', text: 'useState 예제 코드 작성', date: today, completed: false, category: '코딩', goalId: 'goal2', weekIndex: 1 },
    { id: '8', text: '영어 회화 표현 20개 암기', date: today, completed: false, category: '언어', goalId: 'goal3', weekIndex: 0 },
    
    // 추가 목표 없는 할 일들
    { id: '9', text: '독서 30분', date: today, completed: true, category: '독서' },
    { id: '10', text: '물 2L 마시기', date: today, completed: true, category: '운동' },
    { id: '11', text: '비타민 챙겨먹기', date: today, completed: true, category: '운동' },
  ]);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Task with Goal states
  const [hasGoal, setHasGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  // Monthly Goal states
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([
    {
      id: 'goal1',
      title: '건강한 생활 습관 만들기',
      category: '운동',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      weeklyGoals: [
        '매일 아침 30분 조깅하기',
        '주 3회 근력 운동 추가하기',
        '식단 관리 시작하기',
        '수면 패턴 개선하기'
      ]
    },
    {
      id: 'goal2',
      title: 'React 마스터하기',
      category: '코딩',
      startDate: '2026-02-10',
      endDate: '2026-03-09',
      weeklyGoals: [
        'React 기초 문법 복습',
        'Hooks 심화 학습',
        '상태 관리 라이브러리 학습',
        '프로젝트 완성하기'
      ]
    },
    {
      id: 'goal3',
      title: '영어 회화 실력 향상',
      category: '언어',
      startDate: '2026-02-15',
      endDate: '2026-03-07',
      weeklyGoals: [
        '기본 회화 표현 100개 암기',
        '원어민과 대화 연습 시작',
        '영어 드라마 시청하기'
      ]
    }
  ]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalStartDate, setNewGoalStartDate] = useState('');
  const [newGoalEndDate, setNewGoalEndDate] = useState('');
  const [newGoalWeeklyGoals, setNewGoalWeeklyGoals] = useState<string[]>([]);

  const addTask = (date: string) => {
    if (!newTaskText.trim()) {
      setIsAddingTask(false);
      return;
    }
    
    // If goal is selected, use goal's category
    let taskCategory = newTaskCategory || selectedKeywords[0] || '기타';
    if (hasGoal && selectedGoalId) {
      const goal = monthlyGoals.find(g => g.id === selectedGoalId);
      if (goal) {
        taskCategory = goal.category;
      }
    }
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      date: date,
      completed: false,
      category: taskCategory,
      ...(hasGoal && selectedGoalId && { 
        goalId: selectedGoalId,
        weekIndex: selectedWeekIndex ?? undefined
      })
    };
    setTasks([...tasks, newTask]);
    
    // Reset all task states
    setNewTaskText('');
    setNewTaskCategory('');
    setHasGoal(false);
    setSelectedGoalId('');
    setSelectedWeekIndex(null);
    setIsAddingTask(false);
  };

  const cancelAddingTask = () => {
    setNewTaskText('');
    setNewTaskCategory('');
    setHasGoal(false);
    setSelectedGoalId('');
    setSelectedWeekIndex(null);
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

  const calculateWeeks = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, Math.ceil(diffDays / 7));
  };

  const addMonthlyGoal = () => {
    if (!newGoalTitle.trim() || !newGoalStartDate || !newGoalEndDate) {
      setIsAddingGoal(false);
      return;
    }

    const newGoal: MonthlyGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoalTitle,
      category: newGoalCategory || selectedKeywords[0] || '기타',
      startDate: newGoalStartDate,
      endDate: newGoalEndDate,
      weeklyGoals: newGoalWeeklyGoals.filter(g => g.trim())
    };
    setMonthlyGoals([...monthlyGoals, newGoal]);
    
    // Reset all states
    setNewGoalTitle('');
    setNewGoalCategory('');
    setNewGoalStartDate('');
    setNewGoalEndDate('');
    setNewGoalWeeklyGoals([]);
    setIsAddingGoal(false);
  };

  const cancelAddingGoal = () => {
    setNewGoalTitle('');
    setNewGoalCategory('');
    setNewGoalStartDate('');
    setNewGoalEndDate('');
    setNewGoalWeeklyGoals([]);
    setIsAddingGoal(false);
  };

  // Calculate goal progress
  const calculateGoalProgress = (goalId: string): number => {
    const goalTasks = tasks.filter(t => t.goalId === goalId);
    if (goalTasks.length === 0) return 0;
    const completedTasks = goalTasks.filter(t => t.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

  // Calculate weekly progress for a specific goal and week
  const calculateWeeklyProgress = (goalId: string, weekIndex: number): number => {
    const weekTasks = tasks.filter(t => t.goalId === goalId && t.weekIndex === weekIndex);
    if (weekTasks.length === 0) return 0;
    const completedTasks = weekTasks.filter(t => t.completed).length;
    return Math.round((completedTasks / weekTasks.length) * 100);
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
    postponeTask,
    cancelAddingTask,
    // Task with Goal
    hasGoal,
    setHasGoal,
    selectedGoalId,
    setSelectedGoalId,
    selectedWeekIndex,
    setSelectedWeekIndex,
    // Monthly Goal
    monthlyGoals,
    setMonthlyGoals,
    isAddingGoal,
    setIsAddingGoal,
    newGoalTitle,
    setNewGoalTitle,
    newGoalCategory,
    setNewGoalCategory,
    newGoalStartDate,
    setNewGoalStartDate,
    newGoalEndDate,
    setNewGoalEndDate,
    newGoalWeeklyGoals,
    setNewGoalWeeklyGoals,
    calculateWeeks,
    addMonthlyGoal,
    cancelAddingGoal,
    calculateGoalProgress,
    calculateWeeklyProgress
  };
};
