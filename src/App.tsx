/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Brain, BarChart3, Rocket, Check, Home, Calendar as CalendarIcon, Plus, MoreVertical, Edit2, Trash2, ArrowRight, Users, User, BarChart2, MessageCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Header from './components/layout/Header';
import PageRenderer from './components/layout/PageRenderer';
import BottomNav from './components/navigation/BottomNav';
import OnboardingPage, { KeywordChip } from './features/onboarding/pages/OnboardingPage';
import { Task, Friend, FriendRequest, ViewMode, Tab } from './types';
import { FriendsProvider } from './features/friends/context/FriendsContext';
import { TasksProvider } from './features/tasks/context/TasksContext';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

// --- Main App ---

export default function App() {
  const today = new Date().toISOString().split('T')[0];
  const [isStarted, setIsStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [nickname, setNickname] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  // --- My Page State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempKeywords, setTempKeywords] = useState<string[]>(selectedKeywords);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // --- Report Data ---
  const weeklyPerformance = [
    { day: '월', rate: 85, postponed: 2 },
    { day: '화', rate: 70, postponed: 1 },
    { day: '수', rate: 90, postponed: 0 },
    { day: '목', rate: 65, postponed: 4 },
    { day: '금', rate: 80, postponed: 1 },
    { day: '토', rate: 95, postponed: 0 },
    { day: '일', rate: 40, postponed: 5 },
  ];

  const growthData = [
    { month: '11월', score: 45 },
    { month: '12월', score: 62 },
    { month: '1월', score: 78 },
    { month: '현재', score: 88 },
  ];

  const keywords = ['언어', '운동', '마인드 컨트롤', '시간관리', '투자', '심리', '독서', '코딩'];

  const handleOnboardingComplete = (name: string, kws: string[]) => {
    setNickname(name);
    setSelectedKeywords(kws);
    setIsStarted(true);
  };

  // --- Render Helpers ---

  if (!isStarted) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return (
    <TasksProvider selectedKeywords={selectedKeywords}>
      <FriendsProvider>
        <div className="flex items-center justify-center min-h-screen bg-[#F0F4FF] p-4">
          <div className="w-full max-w-[420px] h-[840px] bg-[#F7F9FF] rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-white flex flex-col">
            
            {/* Header */}
            <Header nickname={nickname} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
              <PageRenderer
                today={today}
                selectedKeywords={selectedKeywords}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                viewMode={viewMode}
                setViewMode={setViewMode}
                nickname={nickname}
                setNickname={setNickname}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                tempNickname={tempNickname}
                setTempNickname={setTempNickname}
                keywords={keywords}
                tempKeywords={tempKeywords}
                setTempKeywords={setTempKeywords}
                setSelectedKeywords={setSelectedKeywords}
                isDeletingAccount={isDeletingAccount}
                setIsDeletingAccount={setIsDeletingAccount}
                setIsStarted={setIsStarted}
                KeywordChip={KeywordChip}
                weeklyPerformance={weeklyPerformance}
                growthData={growthData}
              />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

          </div>
        </div>
      </FriendsProvider>
    </TasksProvider>
  );
}

// --- Navigation Component ---
