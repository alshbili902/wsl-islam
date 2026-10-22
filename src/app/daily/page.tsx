'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Award, Sun, Moon, BookOpen, Clock } from 'lucide-react';

interface DailyTask {
  id: string;
  timeSlot: 'morning' | 'day' | 'evening' | 'night';
  title: string;
  desc: string;
}

const DAILY_TASKS: DailyTask[] = [
  { id: 'fajr', timeSlot: 'morning', title: 'صلاة الفجر في وقتها', desc: 'مع ركعتي سنة الفجر (خير من الدنيا وما فيها)' },
  { id: 'morning_adhkar', timeSlot: 'morning', title: 'أذكار الصباح', desc: 'تحصين النفس وبدء اليوم في حفظ الله ورعايته' },
  { id: 'duha', timeSlot: 'morning', title: 'صلاة الضحى (ركعتان فأكثر)', desc: 'صدقة عن كل مفصل من مفاصل الجسد (360 مفصلاً)' },
  { id: 'quran_wird', timeSlot: 'day', title: 'الورد القرآني اليومي', desc: 'تلاوة ما تيسر من كتاب الله بتدبر وحضور قلب' },
  { id: 'dhuhr', timeSlot: 'day', title: 'صلاة الظهر وسننها الرواتب', desc: 'أربع ركعات قبل الظهر وركعتان بعدها' },
  { id: 'asr', timeSlot: 'day', title: 'صلاة العصر في وقتها', desc: 'الصلاة الوسطى التي خُصّت بمزيد من التأكيد' },
  { id: 'evening_adhkar', timeSlot: 'evening', title: 'أذكار المساء', desc: 'حماية النفس ودخول الليل بذكر الله' },
  { id: 'maghrib', timeSlot: 'evening', title: 'صلاة المغرب وسنتها', desc: 'صلاة المغرب مع ركعتي السنة البعدية' },
  { id: 'isha_witr', timeSlot: 'night', title: 'صلاة العشاء وسنة الوتر', desc: 'ختام صلوات اليوم بوتر ولو بركعة واحدة' },
  { id: 'surah_mulk', timeSlot: 'night', title: 'قراءة سورة الملك', desc: 'السورة المانعة المنجية من عذاب القبر' },
  { id: 'sleep_adhkar', timeSlot: 'night', title: 'أذكار النوم والتسبيح', desc: 'آية الكرسي والمعوذات والتسبيح 33' },
  { id: 'istighfar_100', timeSlot: 'night', title: 'الاستغفار والتسبيح 100 مرة', desc: '«سبحان الله وبحمده» و«أستغفر الله وأتوب إليه»' },
];

export default function DailyPage() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const todayKey = `wasl-daily-${new Date().toISOString().slice(0, 10)}`;
      const saved = localStorage.getItem(todayKey);
      if (saved) setCheckedIds(JSON.parse(saved));
    } catch {
      // safe fallback
    }
  }, []);

  const toggleTask = (id: string) => {
    let next: string[];
    if (checkedIds.includes(id)) {
      next = checkedIds.filter((t) => t !== id);
    } else {
      next = [...checkedIds, id];
    }
    setCheckedIds(next);
    try {
      const todayKey = `wasl-daily-${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(todayKey, JSON.stringify(next));
    } catch {
      // safe fallback
    }
  };

  const handleReset = () => {
    setCheckedIds([]);
    try {
      const todayKey = `wasl-daily-${new Date().toISOString().slice(0, 10)}`;
      localStorage.removeItem(todayKey);
    } catch {
      // safe fallback
    }
  };

  const percent = Math.round((checkedIds.length / DAILY_TASKS.length) * 100);

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
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
            <Sparkles size={16} />
            الورد والروتين اليومي
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            يومي مع وصل
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            برنامج عملي متكامل لتنظيم عبادتك اليومية بين الصلوات الخمس والسنن الرواتب والأذكار وتلاوة القرآن الكريم.
          </p>
        </div>

        {/* Progress Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
          color: '#FAF8F5',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-gold)',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              معدل إنجاز العبادات اليومية
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem', fontFamily: 'var(--font-cairo)' }}>
              أنجزت {checkedIds.length} من {DAILY_TASKS.length} طاعات
            </h2>
            <p style={{ fontSize: '0.92rem', opacity: 0.9, margin: 0 }}>
              {percent === 100
                ? '🎉 هنيئاً لك! أتممت جميع عبادات اليوم، تقبل الله منك وثبتك.'
                : percent >= 70
                ? '✨ إنجاز رائع ومبارك، أكمل ما تبقى من سنن وأذكار اليوم.'
                : '🌱 خطوة بخطوة، واصل المحافظة على صلواتك وأذكارك.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '3px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800
            }}>
              {percent}%
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FAF8F5',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              تصفير
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {DAILY_TASKS.map((task) => {
            const isChecked = checkedIds.includes(task.id);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  background: isChecked ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: isChecked ? 0.8 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Custom Checkbox circle */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                  background: isChecked ? 'var(--primary)' : 'transparent',
                  color: '#FAF8F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isChecked && <Check size={16} strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isChecked ? 'var(--primary)' : 'var(--text-main)',
                    margin: '0 0 0.2rem',
                    textDecoration: isChecked ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    {task.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
