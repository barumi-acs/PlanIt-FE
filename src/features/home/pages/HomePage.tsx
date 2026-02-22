import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Rocket, Plus } from 'lucide-react';
import TaskList from '../../tasks/components/TaskList';
import { useTasksContext } from '../../tasks/context/TasksContext';
import { Task } from '../../../types';

interface HomePageProps {
  today: string;
  selectedKeywords: string[];
  setActiveTab: (tab: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  today,
  selectedKeywords,
  setActiveTab,
}) => {
  const task = useTasksContext();
  const {
    tasks, editingTaskId, setEditingTaskId, newTaskText, setNewTaskText,
    newTaskCategory, setNewTaskCategory, isAddingTask, setIsAddingTask,
    activeMenuId, setActiveMenuId, addTask, updateTask, deleteTask,
    toggleComplete, postponeTask
  } = task;

  const filteredTasks = tasks.filter(t => t.date === today);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Feedback Message Box */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-2xl mb-6 bg-white border-primary/5 flex items-start gap-3 cursor-pointer hover:bg-white/90 transition-all"
        onClick={() => setActiveTab('report')}
      >
        <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
          <MessageCircle size={18} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-gray-800">오늘의 피드백</h4>
            <span className="text-[10px] text-amber-500 font-bold">리포트 보기</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            금요일은 평소보다 수행률이 <span className="text-primary font-bold">15% 높아요!</span> 이 기세를 몰아 오늘 계획도 완수해볼까요?
          </p>
        </div>
      </motion.div>

      {/* Progress Card */}
      <div className="glass-card p-5 rounded-3xl mb-6 bg-gradient-to-br from-primary to-sky text-white border-none">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs opacity-80 mb-1">오늘의 진행도</p>
            <h3 className="text-2xl font-bold">
              {Math.round((tasks.filter(t => t.date === today && t.completed).length / (tasks.filter(t => t.date === today).length || 1)) * 100)}%
            </h3>
          </div>
          <Rocket size={32} className="opacity-50" />
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(tasks.filter(t => t.date === today && t.completed).length / (tasks.filter(t => t.date === today).length || 1)) * 100}%` }}
            className="h-full bg-white" 
          />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">오늘 할 일</h3>
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

      <div className="space-y-6">
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
              onAdd={() => addTask(today)}
              newTaskText={newTaskText}
              setNewTaskText={setNewTaskText}
              newTaskCategory={newTaskCategory}
              setNewTaskCategory={setNewTaskCategory}
              categories={selectedKeywords}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HomePage;
