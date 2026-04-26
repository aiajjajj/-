/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';

// 艺术风格色系配置 (Artistic Flair)
const COLORS = {
  bg: 'bg-[#f0fdfa]', 
  container: 'bg-white',
  primary: 'text-[#14b8a6]', 
  scoreBg: 'bg-[#14b8a6]',
  questionBg: 'bg-[#fdf2f8]',
  questionBorder: 'border-[#fbcfe8]',
  questionText: 'text-[#be185d]',
  optionText: 'text-[#374151]',
  btn1: { bg: 'bg-[#dcfce7]', border: 'border-[#86efac]' },
  btn2: { bg: 'bg-[#dbeafe]', border: 'border-[#93c5fd]' },
  btn3: { bg: 'bg-[#fef9c3]', border: 'border-[#fde047]' },
  btn4: { bg: 'bg-[#ede9fe]', border: 'border-[#ddd6fe]' },
};

type Question = {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  options: number[];
};

export default function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shake, setShake] = useState(false);

  // 生成下一题
  const generateQuestion = useCallback(() => {
    const isPlus = Math.random() > 0.5;
    let n1, n2, ans;

    if (isPlus) {
      n1 = Math.floor(Math.random() * 80) + 1;
      n2 = Math.floor(Math.random() * (100 - n1));
      ans = n1 + n2;
    } else {
      n1 = Math.floor(Math.random() * 90) + 10;
      n2 = Math.floor(Math.random() * n1);
      ans = n1 - n2;
    }

    // 生成干扰项
    const optionsSet = new Set<number>([ans]);
    while (optionsSet.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrongAns = ans + offset;
      if (wrongAns >= 0 && wrongAns <= 100 && wrongAns !== ans) {
        optionsSet.add(wrongAns);
      }
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setQuestion({
      num1: n1,
      num2: n2,
      operator: isPlus ? '+' : '-',
      answer: ans,
      options,
    });
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = (selected: number) => {
    if (feedback) return; // 防止连续点击

    if (selected === question?.answer) {
      setFeedback('correct');
      setScore(s => s + 10);
      // 0.8秒后自动下一题
      setTimeout(() => {
        generateQuestion();
      }, 800);
    } else {
      setFeedback('wrong');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setFeedback(null);
      }, 400);
    }
  };

  if (!question) return null;

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col items-center justify-center p-4 font-sans`}>
      {/* 游戏主容器 */}
      <div className={`relative ${COLORS.container} w-full max-w-3xl rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center p-8 md:p-12`}>
        
        {/* 得分外壳 */}
        <div className={`absolute -top-5 right-10 ${COLORS.scoreBg} text-white px-6 py-2 rounded-[20px] font-bold text-xl shadow-lg z-20`}>
          得分: {score}
        </div>

        {/* 标题 */}
        <div className={`flex items-center gap-2 mb-8 ${COLORS.primary} text-3xl font-extrabold tracking-tight`}>
          <span>✨</span> 聪明小状元：口算大王 <span>✨</span>
        </div>

        {/* 出题框 */}
        <motion.div
          animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`relative ${COLORS.questionBg} border-8 ${COLORS.questionBorder} rounded-[32px] w-full flex-1 min-h-[280px] flex items-center justify-center mb-10 overflow-hidden shadow-inner`}
        >
          <AnimatePresence mode="wait">
            {feedback === 'correct' ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30"
              >
                <div className="border-[5px] border-[#10b981] text-[#059669] px-10 py-5 rounded-full font-extrabold text-5xl shadow-xl">
                  太棒了! 🌟
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className={`text-[80px] md:text-[120px] font-black ${COLORS.questionText} drop-shadow-[4px_4px_0_#fff] tracking-tighter`}>
            {question.num1} {question.operator} {question.num2}
          </div>
        </motion.div>

        {/* 选项网格 */}
        <div className="grid grid-cols-2 gap-5 w-full">
          {question.options.map((opt, idx) => {
            const btnStyles = [COLORS.btn1, COLORS.btn2, COLORS.btn3, COLORS.btn4];
            const currentStyle = btnStyles[idx];
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.98, y: 4 }}
                onClick={() => handleAnswer(opt)}
                className={`
                  ${currentStyle.bg} border-4 ${currentStyle.border} 
                  py-6 rounded-[24px] text-4xl font-bold ${COLORS.optionText}
                  shadow-[0_8px_0_rgba(0,0,0,0.1)] active:shadow-[0_4px_0_rgba(0,0,0,0.1)]
                  transition-all duration-75
                `}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* 刷新按钮 (保留原功能) */}
        <button 
          onClick={generateQuestion}
          className="mt-8 p-3 text-gray-400 hover:text-teal-500 transition-colors"
          title="换一批题目"
        >
          <RefreshCcw className="w-8 h-8" />
        </button>
      </div>

      {/* 底部版权/装饰 */}
      <div className="mt-8 text-teal-600/40 text-sm font-medium tracking-widest">
        SUMMER CAMP CALCULATION CHALLENGE
      </div>
    </div>
  );
}
