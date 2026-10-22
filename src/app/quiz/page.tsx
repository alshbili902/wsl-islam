'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Trophy, Sparkles, ChevronLeft } from 'lucide-react';
import { QUIZ_QUESTIONS, type QuizQuestion } from '@/data/quiz';

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <HelpCircle size={16} />
            المسابقات الثقافية
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            مسابقة وصل الإسلامية
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            اختبر معلوماتك في علوم القرآن الكريم، والسنة النبوية، وقصص الأنبياء، والتاريخ الإسلامي.
          </p>
        </div>

        {/* Finished Screen */}
        {quizFinished ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-2xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--gold-light)',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid var(--border-gold)'
            }}>
              <Trophy size={42} />
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem', fontFamily: 'var(--font-cairo)' }}>
              أحسنت! أكملت المسابقة بنجاح
            </h2>

            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              نتيجتك النهائية: <strong style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{score}</strong> من أصل {QUIZ_QUESTIONS.length}
            </p>

            <div style={{
              maxWidth: '400px',
              margin: '0 auto 2rem',
              background: 'var(--bg-card-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-xl)',
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              lineHeight: 1.6
            }}>
              {score >= 8
                ? '🌟 ما شاء الله! معرفة متميزة وثقافة إسلامية واسعة، زادك الله علماً وهدى.'
                : score >= 5
                ? '👍 نتيجة جيدة جداً، استمر في مدارسة كتاب الله وسنة نبيه ﷺ.'
                : '📖 بداية موفقة، ننصحك بتصفح أقسام المنصة لإثراء حصيلتك المعرفية.'}
            </div>

            <button
              onClick={handleRestart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary)',
                color: '#FAF8F5',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                fontFamily: 'inherit'
              }}
            >
              <RotateCcw size={18} />
              إعادة المسابقة من جديد
            </button>
          </div>
        ) : (
          /* Active Question Card */
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
          }}>
            {/* Progress Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <span>السؤال {currentIndex + 1} من {QUIZ_QUESTIONS.length}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>النقاط: {score}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-card-subtle)', borderRadius: '6px', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{
                width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Question Text */}
            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-cairo)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                let bg = 'var(--bg-main)';
                let border = 'var(--border-color)';
                let textColor = 'var(--text-main)';

                if (isAnswered) {
                  if (isCorrect) {
                    bg = 'rgba(16, 185, 129, 0.15)';
                    border = '#10B981';
                    textColor = 'var(--primary)';
                  } else if (isSelected) {
                    bg = 'rgba(239, 68, 68, 0.15)';
                    border = '#EF4444';
                    textColor = '#DC2626';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-xl)',
                      border: `1.5px solid ${border}`,
                      background: bg,
                      color: textColor,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      cursor: isAnswered ? 'default' : 'pointer',
                      textAlign: 'right',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 size={20} style={{ color: '#10B981' }} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle size={20} style={{ color: '#EF4444' }} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {isAnswered && (
              <div>
                <div style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-tajawal)'
                }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>
                    💡 التوضيح والبيان:
                  </strong>
                  {currentQuestion.explanation}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <button
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.75rem 1.75rem',
                      borderRadius: 'var(--radius-xl)',
                      background: 'var(--primary)',
                      color: '#FAF8F5',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span>{currentIndex + 1 < QUIZ_QUESTIONS.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
