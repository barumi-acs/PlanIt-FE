import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Rocket, ArrowRight, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { insightService, FeedbackDashboard } from '../../../api';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useTasksContext } from '../../tasks/context/TasksContext';
import { COLORS, CHART_COLORS } from '../../../constants/colors';

interface ReportPageProps {
  selectedKeywords: string[];
  weeklyPerformance: any[];
  growthData: any[];
}

// 더미 데이터 (백엔드 연결 전 테스트용)
const MOCK_DASHBOARD: FeedbackDashboard = {
  targetPeriod: {
    month: '2026-02',
    week: '9',
  },
  feedbacks: {
    growth: {
      topicName: '운동',
      growthRate: 24,
      message: '이전 3개월 보다 운동 분야에서 24% 성장했어요! 정말 대단한 변화입니다.',
    },
    timeline: {
      chartData: [
        { month: '11월', rate: 45 },
        { month: '12월', rate: 60 },
        { month: '1월', rate: 84 },
      ],
    },
    pattern: {
      worstDay: 'SUNDAY',
      avgPostponeCount: 5,
      message: '일요일에 할 일을 미루는 경향이 가장 높습니다(평균 5회). 일요일은 계획을 가볍게 잡거나 휴식에 집중해보세요.',
      chart: [
        { dayOfWeek: 'MONDAY', completionRate: 85, postponeCount: 0 },
        { dayOfWeek: 'TUESDAY', completionRate: 90, postponeCount: 0 },
        { dayOfWeek: 'WEDNESDAY', completionRate: 70, postponeCount: 1 },
        { dayOfWeek: 'THURSDAY', completionRate: 80, postponeCount: 1 },
        { dayOfWeek: 'FRIDAY', completionRate: 75, postponeCount: 2 },
        { dayOfWeek: 'SATURDAY', completionRate: 50, postponeCount: 3 },
        { dayOfWeek: 'SUNDAY', completionRate: 30, postponeCount: 5 },
      ],
    },
    summary: {
      achievementTrend: '+12%',
      bestFocusTime: '08:00-10:00',
      message: '달성률이 12% 상승했습니다. 오전 10시 이전에 중요한 태스크를 배치하세요.',
    },
  },
};

// 요일 한글 변환 헬퍼
const getDayKorean = (day: string): string => {
  const dayMap: Record<string, string> = {
    'MONDAY': '월',
    'TUESDAY': '화',
    'WEDNESDAY': '수',
    'THURSDAY': '목',
    'FRIDAY': '금',
    'SATURDAY': '토',
    'SUNDAY': '일',
  };
  return dayMap[day] || day;
};

const ReportPage: React.FC<ReportPageProps> = () => {
  const { tasks } = useTasksContext();
  const [dashboard, setDashboard] = useState<FeedbackDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  // 현재 연월과 주차 계산
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const dayOfWeek = firstDay.getDay();
    return Math.ceil((dayOfMonth + dayOfWeek) / 7);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      clearError();
      
      const yearMonth = getCurrentYearMonth();
      const week = getCurrentWeek();
      
      const data = await insightService.getFeedbackDashboard(yearMonth, week);
      setDashboard(data);
      setUseMockData(false);
    } catch (err) {
      console.warn('API 호출 실패, 더미 데이터 사용:', err);
      // 네트워크 오류 시 더미 데이터 사용
      setDashboard(MOCK_DASHBOARD);
      setUseMockData(true);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // 로딩 중
  if (loading) {
    return <LoadingSpinner size="large" message="리포트를 불러오는 중..." />;
  }

  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col pt-4"
    >
      {/* 더미 데이터 사용 중 알림 */}
      {useMockData && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-xs text-amber-700 text-center">
            ⚠️ 테스트 모드: 백엔드 연결 전 더미 데이터를 표시하고 있습니다.
          </p>
        </div>
      )}

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
      ) : dashboard ? (
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
                {dashboard.feedbacks.growth.message}
              </p>
            </div>
          </div>

          {/* Growth Timeline Visualization */}
          <div className="glass-card p-6 rounded-[32px]">
            <h4 className="text-sm font-bold mb-6">성장 타임라인</h4>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.feedbacks.timeline.chartData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: CHART_COLORS.axis.text }} 
                  />
                  <Bar dataKey="rate" radius={[4, 4, 4, 4]} barSize={30}>
                    {dashboard.feedbacks.timeline.chartData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === dashboard.feedbacks.timeline.chartData.length - 1 
                          ? CHART_COLORS.bar.primary 
                          : CHART_COLORS.bar.inactive
                        } 
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
                <BarChart data={dashboard.feedbacks.pattern.chart.map(item => ({
                  day: getDayKorean(item.dayOfWeek),
                  rate: item.completionRate,
                  postponed: item.postponeCount,
                }))}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: CHART_COLORS.axis.text }} 
                  />
                  <Tooltip cursor={{ fill: COLORS.transparent }} />
                  <Bar 
                    dataKey="rate" 
                    name="수행률" 
                    fill={CHART_COLORS.bar.primary} 
                    radius={[4, 4, 0, 0]} 
                    barSize={12} 
                  />
                  <Bar 
                    dataKey="postponed" 
                    name="미룸 횟수" 
                    fill={CHART_COLORS.bar.secondary} 
                    radius={[4, 4, 0, 0]} 
                    barSize={12} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight size={14} className="text-red-400" />
                <h5 className="text-[11px] font-bold text-red-800">미룸 패턴 주의보</h5>
              </div>
              <p className="text-[10px] text-red-700 leading-relaxed">
                {dashboard.feedbacks.pattern.message}
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
              {dashboard.feedbacks.summary.message}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ReportPage;
