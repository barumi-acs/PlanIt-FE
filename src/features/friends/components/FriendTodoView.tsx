import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Friend } from '../../../types';
import {
  scheduleService,
  FriendTaskItem,
  EmojiResponse,
  TaskEmojiGroupResponse,
} from '../../../api/schedule.service';

interface FriendTodoViewProps {
  friend: Friend;
  onBack: () => void;
  reactionTaskId: string | null;
  setReactionTaskId: (id: string | null) => void;
}

// friend.tasks(더미) → FriendTaskItem 변환 헬퍼
const toFriendTaskItems = (friend: Friend): FriendTaskItem[] =>
  (friend.tasks || []).map((t, i) => ({
    taskId: -(i + 1),            // 음수 ID = 더미 (이모지 API 호출 안 함)
    weekGoalsId: 0,
    weekGoalsTitle: t.category,
    content: t.text,
    complete: t.completed,
    targetDate: t.date,
  }));

const FriendTodoView: React.FC<FriendTodoViewProps> = ({ friend, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState<FriendTaskItem[]>(() => toFriendTaskItems(friend));
  const [isLoading, setIsLoading] = useState(false);
  const [emojiList, setEmojiList] = useState<EmojiResponse[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<number, TaskEmojiGroupResponse[]>>({});
  const [openPickerTaskId, setOpenPickerTaskId] = useState<number | null>(null);

  // 친구 할 일 + 이모지 반응 로드 (API 실패 시 더미 유지)
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await scheduleService.getFriendTasks(friend.id, today);
        if (res.tasks.length > 0) {
          setTasks(res.tasks);
          const results = await Promise.allSettled(
            res.tasks.map(t => scheduleService.getTaskReactions(t.taskId))
          );
          const newMap: Record<number, TaskEmojiGroupResponse[]> = {};
          results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
              newMap[res.tasks[i].taskId] = result.value.reactions;
            }
          });
          setReactionsMap(newMap);
        } else {
          // 백엔드에 데이터 없으면 더미 유지
          setTasks(toFriendTaskItems(friend));
        }
      } catch (err) {
        // API 오류 시에도 더미 유지
        setTasks(toFriendTaskItems(friend));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [friend.id]);

  // 이모지 목록 로드
  useEffect(() => {
    scheduleService
      .getEmojiList()
      .then(setEmojiList)
      .catch(err => console.error('[FriendTodoView] 이모지 목록 조회 실패:', err));
  }, []);

  const handleEmojiClick = async (taskId: number, emoji: EmojiResponse) => {
    // 더미 태스크(음수 ID)는 이모지 API 미연동, 로컬 토글만
    if (taskId < 0) {
      setReactionsMap(prev => {
        const cur = prev[taskId] || [];
        const exists = cur.find(r => r.emojiId === emoji.emojiId);
        if (exists) {
          return {
            ...prev,
            [taskId]: cur.map(r => r.emojiId === emoji.emojiId
              ? { ...r, count: Math.max(0, r.count - 1), myReaction: false }
              : r
            ).filter(r => r.count > 0),
          };
        }
        return {
          ...prev,
          [taskId]: [...cur, { emojiId: emoji.emojiId, emojiChar: emoji.emojiChar, name: emoji.name, count: 1, myReaction: true }],
        };
      });
      setOpenPickerTaskId(null);
      return;
    }
    const reactions = reactionsMap[taskId] || [];
    const existing = reactions.find(r => r.emojiId === emoji.emojiId);
    const isRemoving = existing?.myReaction ?? false;

    // Optimistic update
    setReactionsMap(prev => {
      const cur = prev[taskId] || [];
      if (isRemoving) {
        return {
          ...prev,
          [taskId]: cur.map(r => r.emojiId === emoji.emojiId
            ? { ...r, count: Math.max(0, r.count - 1), myReaction: false }
            : r
          ).filter(r => r.count > 0),
        };
      }
      const already = cur.find(r => r.emojiId === emoji.emojiId);
      return {
        ...prev,
        [taskId]: already
          ? cur.map(r => r.emojiId === emoji.emojiId ? { ...r, count: r.count + 1, myReaction: true } : r)
          : [...cur, { emojiId: emoji.emojiId, emojiChar: emoji.emojiChar, name: emoji.name, count: 1, myReaction: true }],
      };
    });
    setOpenPickerTaskId(null);

    try {
      if (isRemoving) {
        await scheduleService.deleteEmojiReaction(taskId, emoji.emojiId);
      } else {
        await scheduleService.addEmojiReaction(taskId, { emojiId: emoji.emojiId });
      }
      // 서버 실제값으로 동기화
      const updated = await scheduleService.getTaskReactions(taskId);
      setReactionsMap(prev => ({ ...prev, [taskId]: updated.reactions }));
    } catch (err) {
      console.error('[FriendTodoView] 이모지 반응 실패:', err);
      // Rollback: 실패 시 이전 상태로 복원
      setReactionsMap(prev => ({ ...prev, [taskId]: reactions }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-gray-400"><ChevronLeft size={24} /></button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
            {friend.nickname[0]}
          </div>
          <h3 className="text-lg font-bold">{friend.nickname}의 TODO</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-400">할 일을 불러오는 중...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-400">오늘 등록된 할 일이 없습니다.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pb-16">
          {tasks.map(task => {
            const reactions = (reactionsMap[task.taskId] || []).filter(r => r.count > 0);
            const isOpen = openPickerTaskId === task.taskId;
            return (
              <div key={task.taskId} className="relative">
                {/* 할 일 카드 */}
                <div
                  className={`glass-card p-4 rounded-[24px] transition-all ${isOpen ? 'ring-2 ring-primary/30' : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${task.complete ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      <span className={`font-bold text-sm truncate ${task.complete ? 'text-gray-400 line-through' : ''
                        }`}>
                        {task.content}
                      </span>
                    </div>
                    <button
                      onClick={() => setOpenPickerTaskId(isOpen ? null : task.taskId)}
                      className={`text-xs px-2 py-1 rounded-lg font-bold transition-colors shrink-0 ml-2 ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      응원하기
                    </button>
                  </div>

                  {/* 등록된 이모지 반응 뱃지 */}
                  {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
                      {reactions.map(r => (
                        <span
                          key={r.emojiId}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${r.myReaction
                            ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                            : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          <span>{r.emojiChar}</span>
                          <span className="text-[10px]">{r.count}</span>
                          {r.myReaction && (
                            <span className="text-[9px] font-bold text-primary/80">나</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 이모지 피커 */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 z-50 mt-1.5 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-1 flex-wrap"
                    >
                      {(emojiList.length > 0 ? emojiList : [
                        { emojiId: -1, emojiChar: '🔥', name: '불' },
                        { emojiId: -2, emojiChar: '👏', name: '박수' },
                        { emojiId: -3, emojiChar: '🙌', name: '만세' },
                        { emojiId: -4, emojiChar: '💪', name: '파이팅' },
                        { emojiId: -5, emojiChar: '✨', name: '반짝' },
                      ] as EmojiResponse[]).map(emoji => {
                        const cur = reactionsMap[task.taskId]?.find(r => r.emojiId === emoji.emojiId);
                        const myReaction = cur?.myReaction ?? false;
                        const count = cur?.count ?? 0;
                        return (
                          <button
                            key={emoji.emojiId}
                            onClick={e => {
                              e.stopPropagation();
                              handleEmojiClick(task.taskId, emoji);
                            }}
                            className={`flex flex-col items-center px-2 py-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${myReaction
                              ? 'bg-primary/10 ring-1 ring-primary/40'
                              : 'hover:bg-gray-50'
                              }`}
                          >
                            <span className="text-xl leading-none">{emoji.emojiChar}</span>
                            {count > 0 && (
                              <span className={`text-[9px] font-bold mt-0.5 ${myReaction ? 'text-primary' : 'text-gray-400'
                                }`}>{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FriendTodoView;
