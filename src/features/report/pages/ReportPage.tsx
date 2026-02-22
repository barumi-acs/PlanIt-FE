import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Rocket, ArrowRight, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task } from '../../../types';

import { useTasksContext } from '../../tasks/context/TasksContext';

interface ReportPageProps {
  selectedKeywords: string[];
  weeklyPerformance: any[];
  growthData: any[];
}

const ReportPage: React.FC<ReportPageProps> = ({
  selectedKeywords,
  weeklyPerformance,
  growthData,
}) => {
  const { tasks } = useTasksContext();
  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col pt-4"
    >
      {tasks.length < 10 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <BarChart3 size={32} className="text-gray-300" />
          </div>
          <h4 className="font-bold mb-2">데이터가 부족합니다</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            일 평균 3개 이상의 할 일을 등록하고 실천해주세요. <br/>
            충분한 데이터가 쌓이면 AI 리포트가 생성됩니다.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-10">
          {/* Growth Encouragement Card */}
          <div className="glass-card p-6 rounded-[32px] bg-gradient-to-br from-primary to-indigo-600 text-white border-none shadow-xl shadow-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={18} className="text-white" />
              <h4 className="text-sm font-bold">성장 격려 피드백</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-4">
              "3개월 전의 당신은 시작을 고민했지만, 지금은 이만큼 해냈습니다."
            </p>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
              <p className="text-[11px] font-bold opacity-90 leading-relaxed">
                이전 3개월 보다 <span className="text-sky-300">운동</span> 분야에서 <span className="text-sky-300">24%</span> 성장했어요! 정말 대단한 변화입니다.
              </p>
            </div>
          </div>

          {/* Growth Timeline Visualization */}
          <div className="glass-card p-6 rounded-[32px]">
            <h4 className="text-sm font-bold mb-6">성장 타임라인</h4>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} 
                  />
                  <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={30}>
                    {growthData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === growthData.length - 1 ? '#7C5CFF' : '#F3F4F6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-4">
              꾸준한 실천으로 역량이 매달 상승하고 있습니다.
            </p>
          </div>

          {/* Performance & Postpone Analysis */}
          <div className="glass-card p-6 rounded-[32px]">
            <h4 className="text-sm font-bold mb-6">수행 및 미룸 패턴</h4>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPerformance}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }} 
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="rate" name="수행률" fill="#7C5CFF" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="postponed" name="미룸 횟수" fill="#FF8A8A" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight size={14} className="text-red-400" />
                <h5 className="text-[11px] font-bold text-red-800">미룸 패턴 주의보</h5>
              </div>
              <p className="text-[10px] text-red-700 leading-relaxed">
                <span className="font-bold">일요일</span>에 할 일을 미루는 경향이 가장 높습니다(평균 5회). 
                일요일은 계획을 가볍게 잡거나 휴식에 집중해보세요.
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-card p-5 rounded-3xl bg-amber-50/50 border-amber-100/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                <Brain size={14} />
              </div>
              <h4 className="text-xs font-bold text-amber-800">AI 종합 피드백</h4>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              목표 대비 달성률이 지난주보다 12% 상승했습니다. 특히 아침 시간대 집중력이 좋습니다. 
              중요한 태스크는 오전 10시 이전에 배치하는 것을 추천합니다.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReportPage;
