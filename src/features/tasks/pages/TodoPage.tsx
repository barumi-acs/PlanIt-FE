import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Task, ViewMode } from '../../../types';
import TaskList from '../components/TaskList';
import { useTasksContext } from '../context/TasksContext';

interface TodoPageProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  today: string;
  selectedKeywords: string[];
}

const TodoPage: React.FC<TodoPageProps> = ({
  selectedDate,
  setSelectedDate,
  viewMode,
  setViewMode,
  today,
  selectedKeywords,
}) => {
  const task = useTasksContext();
  const {
    tasks, editingTaskId, setEditingTaskId, newTaskText, setNewTaskText,
    newTaskCategory, setNewTaskCategory, isAddingTask, setIsAddingTask,
    activeMenuId, setActiveMenuId, addTask, updateTask, deleteTask,
    toggleComplete, postponeTask
  } = task;

  const filteredTasks = tasks.filter(t => t.date === selectedDate);

  return (
    <motion.div
      key="todo"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Full Month Calendar */}
      <div className="glass-card p-4 rounded-3xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">
            {new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <span key={d} className="text-[10px] text-gray-400 font-bold mb-2">{d}</span>
          ))}
          {/* Empty slots for days before the 1st of the month */}
          {Array.from({ length: new Date(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Days of the month */}
          {Array.from({ length: new Date(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth() + 1, 0).getDate() }).map((_, i) => {
            const day = i + 1;
            const year = new Date(selectedDate).getFullYear();
            const month = (new Date(selectedDate).getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const hasTasks = tasks.some(t => t.date === dateStr);
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all ${
                  isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold">{day}</span>
                {hasTasks && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === mode ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      {viewMode === 'daily' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{selectedDate === today ? '오늘' : selectedDate} 할 일</h3>
            <button 
              onClick={() => {
                setNewTaskCategory(selectedKeywords[0] || '기타');
                setIsAddingTask(true);
              }}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-gray-400">등록된 할 일이 없습니다.</p>
            </div>
          ) : (
            Object.entries(
              filteredTasks.reduce((acc: Record<string, Task[]>, task) => {
                if (!acc[task.category]) acc[task.category] = [];
                acc[task.category].push(task);
                return acc;
              }, {})
            ).map(([category, categoryTasks]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  {category}
                </h4>
                <TaskList 
                  tasks={categoryTasks as Task[]}
                  onToggle={toggleComplete}
                  onDelete={deleteTask}
                  onPostpone={postponeTask}
                  onEdit={(id: string) => setEditingTaskId(id)}
                  editingId={editingTaskId}
                  onUpdate={updateTask}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  isAdding={false}
                  onAdd={() => {}}
                  newTaskText={''}
                  setNewTaskText={() => {}}
                />
              </div>
            ))
          )}

          {isAddingTask && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                새로운 할 일
              </h4>
              <TaskList 
                tasks={[]}
                onToggle={() => {}}
                onDelete={() => {}}
                onPostpone={() => {}}
                onEdit={() => {}}
                editingId={null}
                onUpdate={() => {}}
                activeMenuId={null}
                setActiveMenuId={() => {}}
                isAdding={true}
                onAdd={() => addTask(selectedDate)}
                newTaskText={newTaskText}
                setNewTaskText={setNewTaskText}
                newTaskCategory={newTaskCategory}
                setNewTaskCategory={setNewTaskCategory}
                categories={selectedKeywords}
              />
            </div>
          )}
        </div>
      )}

      {viewMode === 'weekly' && (
        <div className="space-y-4">
          {selectedKeywords.map(keyword => (
            <div key={keyword} className="glass-card p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold">{keyword}</h4>
                <span className="text-xs text-primary font-bold">75%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="space-y-4">
          {selectedKeywords.map(keyword => (
            <div key={keyword} className="glass-card p-4 rounded-2xl">
              <h4 className="text-sm font-bold mb-3 border-b border-gray-50 pb-2">{keyword}</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.category === keyword).slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-green-400' : 'bg-gray-300'}`} />
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TodoPage;
