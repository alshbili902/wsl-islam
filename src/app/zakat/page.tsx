'use client';

import { useState } from 'react';
import { Calculator, Coins, HelpCircle, CheckCircle2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

export default function ZakatCalculatorPage() {
  // Inputs (currency: SAR/USD/General)
  const [cash, setCash] = useState<number>(0);
  const [bankSavings, setBankSavings] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(310); // SAR per gram approx
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(3.8);
  const [tradeGoods, setTradeGoods] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [debtsOwedToYou, setDebtsOwedToYou] = useState<number>(0);
  const [immediateDebtsYouOwe, setImmediateDebtsYouOwe] = useState<number>(0);

  // Currency label
  const [currency, setCurrency] = useState('ريال سعودي (SAR)');

  // Calculations
  const goldValue = goldGrams * goldPricePerGram;
  const silverValue = silverGrams * silverPricePerGram;
  const totalAssets = cash + bankSavings + goldValue + silverValue + tradeGoods + investments + debtsOwedToYou;
  const netZakatableWealth = Math.max(0, totalAssets - immediateDebtsYouOwe);

  // Nisab threshold (85 grams of 24k gold)
  const nisabThreshold = 85 * goldPricePerGram;
  const isNisabReached = netZakatableWealth >= nisabThreshold;

  // Zakat rate = 2.5% (solar/lunar base 1/40)
  const zakatDue = isNisabReached ? netZakatableWealth * 0.025 : 0;

  const handleReset = () => {
    setCash(0);
    setBankSavings(0);
    setGoldGrams(0);
    setSilverGrams(0);
    setTradeGoods(0);
    setInvestments(0);
    setDebtsOwedToYou(0);
    setImmediateDebtsYouOwe(0);
  };

  return (
    <main style={{ minHeight: '80vh', padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            background: 'var(--gold-light)',
            color: 'var(--gold)',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            border: '1px solid var(--border-gold)'
          }}>
            <Coins size={16} />
            الركن الثالث من أركان الإسلام
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-cairo)',
            marginBottom: '0.5rem'
          }}>
            حاسبة الزكاة الذكية
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
            احسب زكاة مالك بدقة وسهولة وفقاً للضوابط الشرعية المعتمدة (بلوغ النصاب وحولان الحول بنسبة 2.5%).
          </p>
        </div>

        {/* Currency & Nisab Info Banner */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>نصاب الزكاة الحالي (معيار 85 جرام ذهب):</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold)' }}>
              {nisabThreshold.toLocaleString('ar-SA')} {currency}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>سعر جرام الذهب التقديري:</label>
            <input
              type="number"
              value={goldPricePerGram}
              onChange={(e) => setGoldPricePerGram(Math.max(1, parseFloat(e.target.value) || 0))}
              style={{
                width: '90px',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          
          {/* Inputs Section */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-cairo)' }}>
                الأموال والممتلكات الزكوية
              </h3>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <RotateCcw size={14} />
                تصفير
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Cash */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  السيولة النقدية في اليد أو المنزل ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={cash || ''}
                  placeholder="0"
                  onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bank Savings */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  الحسابات البنكية والودائع والمدخرات ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={bankSavings || ''}
                  placeholder="0"
                  onChange={(e) => setBankSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Gold */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                    وزن الذهب الزكوي (جرام):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goldGrams || ''}
                    placeholder="0"
                    onChange={(e) => setGoldGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                    وزن الفضة الزكوية (جرام):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={silverGrams || ''}
                    placeholder="0"
                    onChange={(e) => setSilverGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Trade Goods */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  قيمة عروض التجارة وبضائع البيع الحالية ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={tradeGoods || ''}
                  placeholder="0"
                  onChange={(e) => setTradeGoods(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Shares & Investments */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  الأسهم الاستثمارية وصناديق الاستثمار ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={investments || ''}
                  placeholder="0"
                  onChange={(e) => setInvestments(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Immediate Debts to deduct */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#DC2626', display: 'block', marginBottom: '0.4rem' }}>
                  (يطرح) الديون العاجلة المستحقة عليك حالاً ({currency}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={immediateDebtsYouOwe || ''}
                  placeholder="0"
                  onChange={(e) => setImmediateDebtsYouOwe(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

            </div>
          </div>

          {/* Results Summary Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald-deep) 100%)',
              color: '#FAF8F5',
              borderRadius: 'var(--radius-2xl)',
              padding: '2.25rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-gold)',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                ملخص حساب الزكاة
              </span>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.85, display: 'block' }}>إجمالي الوعاء الزكوي الخاضع للزكاة:</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {netZakatableWealth.toLocaleString('ar-SA')} {currency}
                </div>
              </div>

              {/* Nisab Status Badge */}
              <div style={{
                background: isNisabReached ? 'rgba(212, 168, 83, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${isNisabReached ? 'var(--gold)' : '#EF4444'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.88rem',
                marginBottom: '1.5rem'
              }}>
                {isNisabReached ? (
                  <>
                    <CheckCircle2 size={18} style={{ color: 'var(--gold)' }} />
                    <span>بلغ المال النصاب الشرعي وتجب فيه الزكاة إذا حال عليه الحول.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} style={{ color: '#FCA5A5' }} />
                    <span>المال لم يبلغ النصاب ({nisabThreshold.toLocaleString('ar-SA')} {currency})، فلا زكاة واجبة فيه.</span>
                  </>
                )}
              </div>

              {/* Final Zakat Due */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                paddingTop: '1.25rem',
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  مقدار الزكاة الواجب إخراجها (2.5%):
                </span>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#FAF8F5',
                  fontFamily: 'var(--font-cairo)'
                }}>
                  {zakatDue.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} {currency}
                </div>
              </div>
            </div>

            {/* Conditions Box */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-2xl)',
              padding: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                💡 شروط وجوب الزكاة في المال:
              </strong>
              <ul style={{ paddingRight: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>الملك التام:</strong> أن يكون المال ملكاً مستقراً لصاحبه يتصرف فيه كيف يشاء.</li>
                <li><strong>بلوغ النصاب:</strong> ما يعادل 85 جراماً من الذهب الخالص عيار 24.</li>
                <li><strong>حولان الحول:</strong> مرور سنة قمرية كاملة (354 يوماً) على بلوغ النصاب دون أن ينقص عنه.</li>
                <li><strong>الفضل عن الحوائج الأصلية:</strong> كالمأكل والمسكن والمركب وسداد الديون الملحة.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
