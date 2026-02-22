import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Friend } from '../../../types';

interface FriendTodoViewProps {
  friend: Friend;
  onBack: () => void;
  reactionTaskId: string | null;
  setReactionTaskId: (id: string | null) => void;
}

const FriendTodoView: React.FC<FriendTodoViewProps> = ({ friend, onBack, reactionTaskId, setReactionTaskId }) => {
  const emojis = ['🔥', '👏', '🙌', '💪', '✨'];

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

      <div className="flex-1 space-y-4">
        {friend.tasks.map(task => (
          <div key={task.id} className="relative">
            <div 
              onClick={() => setReactionTaskId(reactionTaskId === task.id ? null : task.id)}
              className="glass-card p-5 rounded-[24px] flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-400' : 'bg-gray-200'}`} />
                <span className={`font-bold text-sm ${task.completed ? 'text-gray-400 line-through' : ''}`}>{task.text}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-xs bg-gray-50 px-2 py-1 rounded-lg text-gray-400 font-bold">응원하기</span>
              </div>
            </div>

            <AnimatePresence>
              {reactionTaskId === task.id && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute left-0 right-0 -bottom-14 z-50 flex justify-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50"
                >
                  {emojis.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => setReactionTaskId(null)}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendTodoView;
