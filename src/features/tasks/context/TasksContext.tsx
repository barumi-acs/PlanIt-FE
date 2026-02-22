import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../../../types';

interface TasksContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  newTaskText: string;
  setNewTaskText: (text: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (cat: string) => void;
  isAddingTask: boolean;
  setIsAddingTask: (val: boolean) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  addTask: (date: string) => void;
  updateTask: (id: string, newText: string) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  postponeTask: (id: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode; selectedKeywords: string[] }> = ({ children, selectedKeywords }) => {
  const task = useTasks(selectedKeywords);
  return (
    <TasksContext.Provider value={task}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
