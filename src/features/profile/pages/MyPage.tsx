import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MyPageProps {
  nickname: string;
  setNickname: (val: string) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  tempNickname: string;
  setTempNickname: (val: string) => void;
  keywords: string[];
  tempKeywords: string[];
  setTempKeywords: (val: string[]) => void;
  selectedKeywords: string[];
  setSelectedKeywords: (val: string[]) => void;
  isDeletingAccount: boolean;
  setIsDeletingAccount: (val: boolean) => void;
  setIsStarted: (val: boolean) => void;
  setStep: (val: number) => void;
  KeywordChip: React.FC<{ label: string; active: boolean; onClick: () => void }>;
}

const MyPage: React.FC<MyPageProps> = ({
  nickname,
  setNickname,
  isEditingProfile,
  setIsEditingProfile,
  tempNickname,
  setTempNickname,
  keywords,
  tempKeywords,
  setTempKeywords,
  selectedKeywords,
  setSelectedKeywords,
  isDeletingAccount,
  setIsDeletingAccount,
  setIsStarted,
  setStep,
  KeywordChip,
}) => {
  return (
    <motion.div
      key="mypage"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col pt-4"
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-[32px] mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {nickname[0]}
            </div>
            {isEditingProfile ? (
              <input 
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="text-center text-lg font-bold bg-gray-50 rounded-xl px-4 py-2 outline-none border-2 border-primary/20"
              />
            ) : (
              <h4 className="text-lg font-bold">{nickname}</h4>
            )}
            <p className="text-xs text-gray-400 mt-1">google_user@gmail.com</p>
          </div>

          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">관심 키워드</h5>
              <div className="flex flex-wrap gap-2">
                {isEditingProfile ? (
                  keywords.map(k => (
                    <KeywordChip 
                      key={k} 
                      label={k} 
                      active={tempKeywords.includes(k)} 
                      onClick={() => {
                        if (tempKeywords.includes(k)) {
                          setTempKeywords(tempKeywords.filter(item => item !== k));
                        } else if (tempKeywords.length < 4) {
                          setTempKeywords([...tempKeywords, k]);
                        }
                      }}
                    />
                  ))
                ) : (
                  selectedKeywords.map(k => (
                    <span key={k} className="px-3 py-1.5 bg-primary/5 text-primary text-[11px] font-bold rounded-lg">
                      {k}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">연결된 계정</h5>
              <div className="flex items-center gap-3">
                <img src="https://developers.google.com/identity/images/g-logo.png" className="w-4 h-4" alt="Google" />
                <span className="text-xs font-bold text-gray-600">Google 계정 연결됨</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center mb-8"></div>
        {isEditingProfile ? (
          <button 
            onClick={() => {
              setNickname(tempNickname);
              setSelectedKeywords(tempKeywords);
              setIsEditingProfile(false);
            }}
            className="text-sm font-bold text-primary"
          >
            저장
          </button>
        ) : (
          <button 
            onClick={() => {
              setTempNickname(nickname);
              setTempKeywords(selectedKeywords);
              setIsEditingProfile(true);
            }}
            className="w-full py-2 text-sm font-bold text-gray-400"
          >
            프로필 수정
          </button>
        )}
      
        <button 
          onClick={() => setIsDeletingAccount(true)}
          className="w-full py-4 text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
        >
          계정 탈퇴
        </button>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeletingAccount && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-[32px] w-full max-w-[300px] text-center shadow-2xl"
            >
              <h3 className="font-bold mb-2">정말 탈퇴하시겠어요?</h3>
              <p className="text-xs text-gray-500 mb-6">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeletingAccount(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    setIsStarted(false);
                    setStep(0);
                    setIsDeletingAccount(false);
                    setNickname('');
                    setSelectedKeywords([]);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold"
                >
                  탈퇴하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyPage;
