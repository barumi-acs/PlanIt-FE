import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Brain, BarChart3, Rocket, Check } from 'lucide-react';

const PlanetAnimation = ({ size = 'large' }: { size?: 'small' | 'large' }) => {
  const isLarge = size === 'large';
  const containerSize = isLarge ? 'w-[220px] h-[220px]' : 'w-[160px] h-[160px]';
  const planetSize = isLarge ? 'w-[150px] h-[150px]' : 'w-[100px] h-[100px]';
  const orbitSize = isLarge ? 'w-[200px] h-[200px]' : 'w-[130px] h-[130px]';

  return (
    <div className={`relative ${containerSize} mx-auto mb-8`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={`${planetSize} rounded-full planet-gradient shadow-[0_20px_60px_rgba(124,92,255,0.35)] animate-spin-planet`} />
      </div>
      <div className={`absolute top-1/2 left-1/2 ${orbitSize} -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/20`} />
      <div className={`absolute top-1/2 left-1/2 ${orbitSize} -translate-x-1/2 -translate-y-1/2 animate-rotate-star`}>
        {[0, 120, 240].map((deg) => (
          <div key={deg} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-sky rounded-full shadow-[0_0_12px_rgba(77,211,255,0.7)] animate-twinkle" />
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="glass-card p-4 rounded-2xl mb-4 w-full max-w-[320px] flex gap-4 items-start"
  >
    <div className="p-2 bg-primary/10 rounded-xl text-primary">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

interface KeywordChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-br from-primary to-sky text-white shadow-lg shadow-primary/20' 
        : 'bg-[#EEF2FF] text-[#1A1F36] hover:bg-[#E0E7FF]'
    }`}
  >
    {label}
  </button>
);

interface OnboardingPageProps {
  onComplete: (nickname: string, keywords: string[]) => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  const keywords = ['언어', '운동', '마인드 컨트롤', '시간관리', '투자', '심리', '독서', '코딩'];

  const toggleKeyword = (k: string) => {
    if (selectedKeywords.includes(k)) {
      setSelectedKeywords(selectedKeywords.filter(item => item !== k));
    } else if (selectedKeywords.length < 4) {
      setSelectedKeywords([...selectedKeywords, k]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4FF] p-4">
      <div className="w-full max-w-[420px] h-[840px] bg-[#F7F9FF] rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-white">
        <AnimatePresence>
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onClick={() => setStep(s => s - 1)}
              className="absolute top-[46px] left-6 z-50 p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="h-full w-full relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col items-center justify-center px-8 text-center pb-32">
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <PlanetAnimation />
                  <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Plan <span className="text-primary">It</span></h1>
                  <p className="text-lg font-semibold text-gray-500">AI 기반 자기계발 투두리스트</p>
                </div>
                <button onClick={() => setStep(1)} className="absolute bottom-10 left-8 right-8 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky text-white font-bold shadow-xl shadow-primary/30 active:scale-95 transition-transform">다음</button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col items-center pt-12 px-8 pb-32">
                <div className="w-full flex justify-center mb-8"><span className="text-lg font-extrabold">Plan<span className="text-primary">It</span></span></div>
                <PlanetAnimation size="small" />
                <h2 className="text-xl font-extrabold mb-8 text-center">Plan → Do → Achieve</h2>
                <div className="w-full overflow-y-auto max-h-[380px] pr-1 scrollbar-hide">
                  <FeatureCard icon={Brain} title="AI 계획 생성" description="목표 기반으로 일·주·월 계획을 자동 구성합니다." />
                  <FeatureCard icon={BarChart3} title="실행 분석" description="완료 패턴을 분석해 전략을 다시 설계합니다." />
                  <FeatureCard icon={Rocket} title="목표 달성" description="데이터 기반 실행 루프를 통해 성취를 만듭니다." />
                </div>
                <button onClick={() => setStep(2)} className="absolute bottom-10 left-8 right-8 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 font-semibold shadow-sm active:scale-95 transition-transform">
                  <img src="https://developers.google.com/identity/images/g-logo.png" className="w-5 h-5" alt="Google" />
                  Google로 계속하기
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="p3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col pt-12 px-8 pb-32">
                <div className="w-full flex justify-center mb-10"><span className="text-lg font-extrabold">Plan<span className="text-primary">It</span></span></div>
                <h2 className="text-2xl font-extrabold mb-2">기본정보 입력</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">나를 표현할 닉네임과 관심 키워드를 선택해주세요</p>
                <div className="glass-card p-5 rounded-2xl mb-6">
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 입력해주세요" className="w-full bg-transparent border-none outline-none text-base font-medium placeholder:text-gray-300" />
                </div>
                <div className="glass-card p-5 rounded-2xl mb-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {keywords.map(k => (
                      <KeywordChip key={k} label={k} active={selectedKeywords.includes(k)} onClick={() => toggleKeyword(k)} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1"><Check size={12} /> 3~4개 선택해주세요</p>
                </div>
                <button onClick={() => onComplete(nickname, selectedKeywords)} disabled={!nickname || selectedKeywords.length < 3} className="absolute bottom-10 left-8 right-8 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky text-white font-bold shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100">시작하기</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ backgroundColor: step === i ? '#7C5CFF' : '#D1D5DB' }} className="w-2 h-2 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
