import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from '../../features/home/pages/HomePage';
import TodoPage from '../../features/tasks/pages/TodoPage';
import FriendsPage from '../../features/friends/pages/FriendsPage';
import AiTodoPage from '../../features/tasks/pages/AiTodoPage';
import MyPage from '../../features/profile/pages/MyPage';
import ReportPage from '../../features/report/pages/ReportPage';
import { Task, ViewMode } from '../../types';

interface PageRendererProps {
  today: string;
  selectedKeywords: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  nickname: string;
  setNickname: (name: string) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (is: boolean) => void;
  tempNickname: string;
  setTempNickname: (name: string) => void;
  keywords: string[];
  tempKeywords: string[];
  setTempKeywords: (kws: string[]) => void;
  setSelectedKeywords: (kws: string[]) => void;
  isDeletingAccount: boolean;
  setIsDeletingAccount: (is: boolean) => void;
  setIsStarted: (is: boolean) => void;
  KeywordChip: React.FC<any>;
  weeklyPerformance: any[];
  growthData: any[];
}

const PageRenderer: React.FC<PageRendererProps> = (props) => {
  const navigate = useNavigate();
  const {
    today, selectedKeywords,
    selectedDate, setSelectedDate, viewMode, setViewMode,
    nickname, setNickname, isEditingProfile,
    setIsEditingProfile, tempNickname, setTempNickname, keywords,
    tempKeywords, setTempKeywords, setSelectedKeywords, isDeletingAccount,
    setIsDeletingAccount, setIsStarted, KeywordChip, weeklyPerformance,
    growthData
  } = props;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route 
          path="/home" 
          element={
            <HomePage 
              today={today}
              selectedKeywords={selectedKeywords}
              setActiveTab={(tab: string) => navigate(`/${tab === 'ai-todo' ? 'ai' : tab}`)}
            />
          } 
        />
        <Route 
          path="/todo" 
          element={
            <TodoPage 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              today={today}
              selectedKeywords={selectedKeywords}
            />
          } 
        />
        <Route 
          path="/friends" 
          element={
            <FriendsPage />
          } 
        />
        <Route 
          path="/ai" 
          element={
            <AiTodoPage 
              selectedKeywords={selectedKeywords}
            />
          } 
        />
        <Route 
          path="/mypage" 
          element={
            <MyPage 
              nickname={nickname}
              setNickname={setNickname}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              tempNickname={tempNickname}
              setTempNickname={setTempNickname}
              keywords={keywords}
              tempKeywords={tempKeywords}
              setTempKeywords={setTempKeywords}
              selectedKeywords={selectedKeywords}
              setSelectedKeywords={setSelectedKeywords}
              isDeletingAccount={isDeletingAccount}
              setIsDeletingAccount={setIsDeletingAccount}
              setIsStarted={setIsStarted}
              KeywordChip={KeywordChip}
            />
          } 
        />
        <Route 
          path="/report" 
          element={
            <ReportPage 
              selectedKeywords={selectedKeywords}
              weeklyPerformance={weeklyPerformance}
              growthData={growthData}
            />
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

export default PageRenderer;
