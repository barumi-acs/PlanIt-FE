import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../../../types';

export const useAiPlan = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const today = new Date().toISOString().split('T')[0];
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStartDate, setAiStartDate] = useState(today);
  const [aiEndDate, setAiEndDate] = useState(today);
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  const generateAiPlan = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `목표: ${aiPrompt}, 기간: ${aiStartDate} ~ ${aiEndDate}. 이 목표를 달성하기 위한 구체적인 할 일 목록을 3-5개 정도 생성해줘. 한국어로 답변해줘.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const generated = JSON.parse(response.text || "[]");
      setAiGeneratedTasks(generated);
    } catch (error) {
      console.error("AI Generation Error:", error);
      // Fallback mock
      setAiGeneratedTasks([`[${aiPrompt}] 기초 다지기`, `[${aiPrompt}] 실전 연습`, `[${aiPrompt}] 보완 및 마무리`]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const addAiTasksToMyList = () => {
    const newTasks: Task[] = aiGeneratedTasks.map(text => ({
      id: Math.random().toString(36).substr(2, 9),
      text,
      date: aiStartDate,
      completed: false,
      category: 'AI 추천'
    }));
    setTasks([...tasks, ...newTasks]);
    setAiGeneratedTasks([]);
    setAiPrompt('');
  };

  return {
    aiPrompt,
    setAiPrompt,
    aiStartDate,
    setAiStartDate,
    aiEndDate,
    setAiEndDate,
    aiGeneratedTasks,
    isAiGenerating,
    isAiExpanded,
    setIsAiExpanded,
    generateAiPlan,
    addAiTasksToMyList
  };
};
