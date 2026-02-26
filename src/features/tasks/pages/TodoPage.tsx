import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar as CalendarIcon, X, Check, MoreVertical, Edit2, ArrowRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, ViewMode } from '../../../types';
import { useTasksContext } from '../context/TasksContext';
import AddTaskForm from '../components/AddTaskForm';

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
    toggleComplete, postponeTask, cancelAddingTask,
    // Task with Goal
    hasGoal, setHasGoal, selectedGoalId, setSelectedGoalId,
    selectedWeekIndex, setSelectedWeekIndex,
    // Monthly Goal
    monthlyGoals, isAddingGoal, setIsAddingGoal, newGoalTitle, setNewGoalTitle,
    newGoalCategory, setNewGoalCategory, newGoalStartDate, setNewGoalStartDate,
    newGoalEndDate, setNewGoalEndDate, newGoalWeeklyGoals, setNewGoalWeeklyGoals,
    calculateWeeks, addMonthlyGoal, cancelAddingGoal,
    calculateGoalProgress, calculateWeeklyProgress
  } = task;

  const filteredTasks = tasks.filter(t => t.date === selectedDate);

  // State for expanded goal cards in monthly view
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Calculate weeks when dates change
  const weeksCount = calculateWeeks(newGoalStartDate, newGoalEndDate);
  
  useEffect(() => {
    if (weeksCount > 0 && newGoalWeeklyGoals.length !== weeksCount) {
      setNewGoalWeeklyGoals(Array(weeksCount).fill(''));
    }
  }, [weeksCount]);

  // Get selected goal's weekly goals
  const selectedGoal = monthlyGoals.find(g => g.id === selectedGoalId);
  const weeklyGoalsOptions = selectedGoal?.weeklyGoals || [];

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
        {(['daily', 'weekly', 'goals'] as ViewMode[]).map(mode => (
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
            ).map(([category, categoryTasks]) => {
              // Group tasks by goal within category
              const tasksWithGoal = (categoryTasks as Task[]).filter(t => t.goalId);
              const tasksWithoutGoal = (categoryTasks as Task[]).filter(t => !t.goalId);
              
              // Group tasks with goals by goalId
              const tasksByGoal = tasksWithGoal.reduce((acc: Record<string, Task[]>, task) => {
                const goalId = task.goalId!;
                if (!acc[goalId]) acc[goalId] = [];
                acc[goalId].push(task);
                return acc;
              }, {});

              return (
                <div key={category} className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-3 bg-primary rounded-full" />
                    {category}
                  </h4>

                  {/* Tasks grouped by goals */}
                  {Object.entries(tasksByGoal).map(([goalId, goalTasks]) => {
                    const goal = monthlyGoals.find(g => g.id === goalId);
                    if (!goal) return null;

                    return (
                      <div key={goalId} className="ml-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-[11px] font-bold">{goal.title}</h5>
                        </div>
                        
                        <div className="ml-3 space-y-2">
                          {(goalTasks as Task[]).map(task => (
                            <div key={task.id} className="relative group">
                              <div className={`glass-card p-3 rounded-xl flex items-center gap-3 transition-all ${task.completed ? 'opacity-50' : ''}`}>
                                <button 
                                  onClick={() => toggleComplete(task.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-primary border-primary text-white' : 'border-gray-200'}`}
                                >
                                  {task.completed && <Check size={12} />}
                                </button>
                                
                                <div className="flex-1">
                                  {editingTaskId === task.id ? (
                                    <input
                                      autoFocus
                                      defaultValue={task.text}
                                      onBlur={(e) => updateTask(task.id, e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && updateTask(task.id, e.currentTarget.value)}
                                      className="w-full bg-transparent border-none outline-none text-sm font-medium"
                                    />
                                  ) : (
                                    <span className={`block text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                      {task.text}
                                    </span>
                                  )}
                                </div>

                                <button 
                                  onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVertical size={16} />
                                </button>
                              </div>

                              {/* Kebab Menu */}
                              {activeMenuId === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-12 z-50 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                                >
                                  <button onClick={() => setEditingTaskId(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
                                    <Edit2 size={14} /> 수정
                                  </button>
                                  <button onClick={() => postponeTask(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
                                    <ArrowRight size={14} /> 미루기
                                  </button>
                                  <button onClick={() => deleteTask(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl">
                                    <Trash2 size={14} /> 삭제
                                  </button>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tasks without goals */}
                  {tasksWithoutGoal.length > 0 && (
                    <div className="ml-3 space-y-2">
                      {tasksWithoutGoal.map(task => (
                        <div key={task.id} className="relative group">
                          <div className={`glass-card p-4 rounded-2xl flex items-center gap-3 transition-all ${task.completed ? 'opacity-50' : ''}`}>
                            <button 
                              onClick={() => toggleComplete(task.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-primary border-primary text-white' : 'border-gray-200'}`}
                            >
                              {task.completed && <Check size={14} />}
                            </button>
                            
                            <div className="flex-1">
                              {editingTaskId === task.id ? (
                                <input
                                  autoFocus
                                  defaultValue={task.text}
                                  onBlur={(e) => updateTask(task.id, e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && updateTask(task.id, e.currentTarget.value)}
                                  className="w-full bg-transparent border-none outline-none text-sm font-medium"
                                />
                              ) : (
                                <span className={`block text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                  {task.text}
                                </span>
                              )}
                            </div>

                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>

                          {/* Kebab Menu */}
                          {activeMenuId === task.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-14 z-50 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                            >
                              <button onClick={() => setEditingTaskId(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
                                <Edit2 size={14} /> 수정
                              </button>
                              <button onClick={() => postponeTask(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
                                <ArrowRight size={14} /> 미루기
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl">
                                <Trash2 size={14} /> 삭제
                              </button>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isAddingTask && (
            <div className="glass-card p-4 rounded-2xl border-2 border-dashed border-primary/30 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-primary">새로운 할 일 추가</h4>
                <button 
                  onClick={cancelAddingTask}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Goal Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 ml-1">목표 연동</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setHasGoal(false);
                      setSelectedGoalId('');
                      setSelectedWeekIndex(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      !hasGoal 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    목표 없음
                  </button>
                  <button
                    onClick={() => setHasGoal(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      hasGoal 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    목표 있음
                  </button>
                </div>
              </div>

              {/* Goal Selection (Conditional) */}
              {hasGoal && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-1">전체 목표</label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => {
                        setSelectedGoalId(e.target.value);
                        setSelectedWeekIndex(null);
                      }}
                      className="w-full bg-gray-50 p-2 rounded-xl border border-gray-100 text-xs outline-none focus:border-primary transition-all"
                    >
                      <option value="">목표를 선택하세요</option>
                      {monthlyGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title} ({goal.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weekly Goal Selection (Conditional) */}
                  {selectedGoalId && weeklyGoalsOptions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 ml-1">주간 목표</label>
                      <select
                        value={selectedWeekIndex ?? ''}
                        onChange={(e) => setSelectedWeekIndex(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-gray-50 p-2 rounded-xl border border-gray-100 text-xs outline-none focus:border-primary transition-all"
                      >
                        <option value="">주간 목표를 선택하세요</option>
                        {weeklyGoalsOptions.map((weekGoal, idx) => (
                          <option key={idx} value={idx}>
                            {idx + 1}주차: {weekGoal}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Category Selection */}
              {!hasGoal && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 ml-1">카테고리</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedKeywords.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewTaskCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          newTaskCategory === cat 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Text Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 ml-1">할 일 내용</label>
                <input
                  autoFocus
                  placeholder="할 일을 입력하세요"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask(selectedDate)}
                  className="w-full bg-gray-50 p-2 rounded-xl border border-gray-100 text-sm outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={cancelAddingTask}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={() => addTask(selectedDate)}
                  disabled={!newTaskText.trim() || (hasGoal && !selectedGoalId)}
                  className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  추가
                </button>
              </div>
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

      {viewMode === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">목표</h3>
            <button 
              onClick={() => {
                setNewGoalCategory(selectedKeywords[0] || '기타');
                setIsAddingGoal(true);
              }}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Existing Monthly Goals with Toggle */}
          {monthlyGoals.map(goal => {
            const progress = calculateGoalProgress(goal.id);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div key={goal.id} className="glass-card rounded-2xl overflow-hidden">
                {/* Card Header - Summary View */}
                <button
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                  className="w-full p-4 text-left hover:bg-gray-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold mb-1">{goal.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <CalendarIcon size={10} />
                        <span>{goal.startDate} ~ {goal.endDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-bold">
                        {goal.category}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold">전체 진행률</span>
                      <span className="text-xs text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Content - Weekly Goals */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          주차별 목표
                        </h5>
                        {goal.weeklyGoals.map((weekGoal, idx) => {
                          const weekProgress = calculateWeeklyProgress(goal.id, idx);
                          const weekTaskCount = tasks.filter(t => t.goalId === goal.id && t.weekIndex === idx).length;

                          return (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">{weekGoal}</span>
                                </div>
                                {weekTaskCount > 0 && (
                                  <span className="text-[10px] font-bold text-primary">{weekProgress}%</span>
                                )}
                              </div>
                              
                              {weekTaskCount > 0 && (
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${weekProgress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="h-full bg-primary rounded-full"
                                  />
                                </div>
                              )}
                              
                              {weekTaskCount === 0 && (
                                <p className="text-[9px] text-gray-400 italic">할 일이 등록되지 않았습니다</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Add New Goal Form */}
          {isAddingGoal && (
            <div className="glass-card p-4 rounded-2xl border-2 border-dashed border-primary/30 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-primary">새로운 목표 추가</h4>
                <button 
                  onClick={cancelAddingGoal}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 ml-1">카테고리</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedKeywords.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewGoalCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        newGoalCategory === cat 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 ml-1">목표 제목</label>
                <input
                  placeholder="목표 제목을 입력하세요"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full bg-gray-50 p-2 rounded-xl border border-gray-100 text-sm outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 ml-1">시작일</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <CalendarIcon size={12} className="text-gray-400" />
                    <input 
                      type="date" 
                      value={newGoalStartDate}
                      onChange={(e) => setNewGoalStartDate(e.target.value)}
                      className="flex-1 bg-transparent text-[11px] outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 ml-1">완료일</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <CalendarIcon size={12} className="text-gray-400" />
                    <input 
                      type="date" 
                      value={newGoalEndDate}
                      onChange={(e) => setNewGoalEndDate(e.target.value)}
                      className="flex-1 bg-transparent text-[11px] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Warning */}
              {newGoalStartDate && newGoalEndDate && new Date(newGoalEndDate) < new Date(newGoalStartDate) && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2 rounded-lg">
                  완료일은 시작일보다 늦어야 합니다.
                </div>
              )}

              {/* Weekly Goals */}
              {weeksCount > 0 && new Date(newGoalEndDate) >= new Date(newGoalStartDate) && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 ml-1">
                    주차별 상세 목표 (총 {weeksCount}주)
                  </label>
                  <div className="space-y-2">
                    {Array.from({ length: weeksCount }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-12">{idx + 1}주차</span>
                        <input
                          placeholder={`${idx + 1}주차 목표를 입력하세요`}
                          value={newGoalWeeklyGoals[idx] || ''}
                          onChange={(e) => {
                            const updated = [...newGoalWeeklyGoals];
                            updated[idx] = e.target.value;
                            setNewGoalWeeklyGoals(updated);
                          }}
                          className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 text-xs outline-none focus:border-primary transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={cancelAddingGoal}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={addMonthlyGoal}
                  disabled={!newGoalTitle.trim() || !newGoalStartDate || !newGoalEndDate || new Date(newGoalEndDate) < new Date(newGoalStartDate)}
                  className="px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  추가
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {monthlyGoals.length === 0 && !isAddingGoal && (
            <div className="text-center py-10">
              <p className="text-xs text-gray-400">등록된 목표가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TodoPage;
