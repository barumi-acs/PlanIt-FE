import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { Friend, FriendRequest } from '../../../types';
import FriendTodoView from '../components/FriendTodoView';
import { useFriendsContext } from '../context/FriendsContext';

const FriendsPage: React.FC = () => {
  const {
    selectedFriendId,
    setSelectedFriendId,
    friends,
    setFriends,
    friendRequests,
    setFriendRequests,
    friendSearchQuery,
    setFriendSearchQuery,
    reactionTaskId,
    setReactionTaskId,
    friendToRemoveId,
    setFriendToRemoveId
  } = useFriendsContext();

  return (
    <motion.div
      key="friends"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col"
    >
      {selectedFriendId ? (
        <FriendTodoView 
          friend={friends.find(f => f.id === selectedFriendId)!} 
          onBack={() => setSelectedFriendId(null)}
          reactionTaskId={reactionTaskId}
          setReactionTaskId={setReactionTaskId}
        />
      ) : (
        <>
          {/* Search Section */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">친구 추가</h4>
            <div className="glass-card p-4 rounded-2xl mb-4 flex items-center gap-3">
              <Plus size={18} className="text-gray-300" />
              <input 
                placeholder="친구의 닉네임을 검색하세요"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              />
            </div>
            
            {friendSearchQuery.length > 0 && (
              <div className="space-y-3 mb-6">
                {['이민수', '최유진', '강동원']
                  .filter(n => n.includes(friendSearchQuery))
                  .map(name => (
                    <div key={name} className="glass-card p-4 rounded-2xl flex justify-between items-center bg-primary/5 border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm">
                          {name[0]}
                        </div>
                        <span className="font-bold text-sm">{name}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setFriendRequests([...friendRequests, { id: Math.random().toString(), nickname: name }]);
                          setFriendSearchQuery('');
                        }}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20"
                      >
                        추가
                      </button>
                    </div>
                  ))}
                {['이민수', '최유진', '강동원'].filter(n => n.includes(friendSearchQuery)).length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-4">검색 결과가 없습니다.</p>
                )}
              </div>
            )}
          </div>

          {/* Requested Friends */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">요청된 친구</h4>
            <div className="space-y-3">
              {friendRequests.length > 0 ? friendRequests.map(req => (
                <div key={req.id} className="glass-card p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                      {req.nickname[0]}
                    </div>
                    <span className="font-bold text-sm">{req.nickname}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setFriends([...friends, { id: req.id, nickname: req.nickname, tasks: [] }]);
                        setFriendRequests(friendRequests.filter(r => r.id !== req.id));
                      }}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"
                    >
                      수락
                    </button>
                    <button 
                      onClick={() => setFriendRequests(friendRequests.filter(r => r.id !== req.id))}
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg"
                    >
                      거절
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-4">새로운 요청이 없습니다.</p>
              )}
            </div>
          </div>

          {/* My Friends */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">친구</h4>
            <div className="space-y-3">
              {friends.map(friend => (
                <div key={friend.id} className="glass-card p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white transition-colors" onClick={() => setSelectedFriendId(friend.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {friend.nickname[0]}
                    </div>
                    <span className="font-bold text-sm">{friend.nickname}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFriendToRemoveId(friend.id);
                    }}
                    className="text-[10px] font-bold text-gray-300 hover:text-red-400"
                  >
                    친구 취소
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {friendToRemoveId && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-[32px] w-full max-w-[300px] text-center shadow-2xl"
            >
              <h3 className="font-bold mb-2">친구를 취소할까요?</h3>
              <p className="text-xs text-gray-500 mb-6">취소하면 친구의 소식을 볼 수 없습니다.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setFriendToRemoveId(null)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    setFriends(friends.filter(f => f.id !== friendToRemoveId));
                    setFriendToRemoveId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FriendsPage;
