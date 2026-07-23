
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant, RouletteResult } from './types';
import { ROULETTE_COLORS } from './constants';
import RouletteWheel, { RouletteWheelRef } from './components/RouletteWheel';
import { getGeminiLunchComment } from './services/geminiService';

type ViewState = 'input' | 'roulette';

const LOCAL_STORAGE_KEY = 'lunch_roulette_list';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('input');
  
  // Load initial state from localStorage
  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
  });
  
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const wheelRef = useRef<RouletteWheelRef>(null);

  // Sync state to localStorage whenever inputText changes
  useEffect(() => {
    if (inputText) {
      localStorage.setItem(LOCAL_STORAGE_KEY, inputText);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [inputText]);

  const restaurants = useMemo(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((name, index) => ({
        id: uuidv4(),
        name,
        color: ROULETTE_COLORS[index % ROULETTE_COLORS.length]
      }));
  }, [inputText]);

  const handleStartRoulette = () => {
    if (restaurants.length < 2) {
      alert('최소 2개 이상의 식당을 입력해주세요!');
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setResult(null);
    setView('roulette');
  };

  const handleWinnerSelected = async (winner: Restaurant) => {
    setIsLoadingComment(true);
    const comment = await getGeminiLunchComment(winner.name);
    setResult({
      restaurant: winner,
      aiComment: comment
    });
    setIsLoadingComment(false);
  };

  const handleSpinAgain = () => {
    setResult(null);
    if (wheelRef.current) {
      wheelRef.current.reset();
    }
  };

  const handleEditList = () => {
    setResult(null);
    setView('input');
  };

  const isStartDisabled = restaurants.length < 2;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-rose-500"><i className="fas fa-utensils"></i></span>
          {view === 'input' ? '오늘의 점메추' : '점심 룰렛'}
        </h1>
        <p className="text-slate-500">
          {view === 'input' ? '회사 근처 식당 리스트를 입력하세요.' : '중앙의 STOP 버튼을 눌러보세요!'}
        </p>
      </div>

      <main className="w-full max-w-xl z-10">
        {view === 'input' ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-fade-in relative">
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <i className="fas fa-list-ul text-rose-400"></i>
                식당 리스트 (한 줄에 하나씩)
              </label>
            </div>
            
            <textarea
              className="w-full h-72 p-5 text-slate-700 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-rose-300 focus:bg-white transition-colors duration-200 outline-none resize-none font-medium text-lg shadow-inner"
              placeholder="제육볶음&#10;돈까스&#10;마라탕&#10;김치찌개..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="mt-6 flex flex-col gap-4">
              <button
                onClick={handleStartRoulette}
                disabled={isStartDisabled}
                className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all active:scale-[0.98] ${
                  isStartDisabled 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                }`}
              >
                룰렛 돌리러 가기
              </button>
              <p className="text-center text-xs text-slate-400 font-medium">
                {isStartDisabled 
                  ? '최소 2개 이상의 식당을 입력해주세요.' 
                  : `총 ${restaurants.length}개의 메뉴가 저장되었습니다.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in relative">
            <RouletteWheel 
              ref={wheelRef}
              restaurants={restaurants} 
              onWinnerSelected={handleWinnerSelected}
              onReset={() => setResult(null)}
            />
            
            {/* Go Back button while on Roulette page but not showing modal */}
            {!result && !isLoadingComment && (
              <button
                onClick={handleEditList}
                className="mt-12 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium border-b border-slate-200"
              >
                돌아가서 메뉴 바꾸기
              </button>
            )}

            {/* Loading Indicator for AI Comment */}
            {isLoadingComment && (
              <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-bold italic animate-pulse">오늘의 운세를 읽는 중...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Result Modal Layer */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleSpinAgain}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="h-2 w-full" style={{ backgroundColor: result.restaurant.color }}></div>
            
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 text-2xl mb-6">
                <i className="fas fa-crown"></i>
              </div>
              
              <span className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">PICKED FOR YOU</span>
              <h2 className="text-4xl font-black mb-6 break-keep leading-tight" style={{ color: result.restaurant.color }}>
                {result.restaurant.name}
              </h2>
              
              <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-rose-300">
                  <i className="fas fa-quote-left text-xs"></i>
                </div>
                <p className="text-slate-700 font-bold text-lg leading-relaxed break-keep">
                  {result.aiComment}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleSpinAgain}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-[0.97] transition-all"
                >
                  <i className="fas fa-redo-alt mr-2"></i> 다시 돌리기
                </button>
                <button
                  onClick={handleEditList}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 active:scale-[0.97] transition-all"
                >
                  <i className="fas fa-edit mr-2"></i> 리스트 수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-8 text-slate-400 text-sm z-10">
        &copy; 2025 오늘의 점메추 • Built with Gemini AI
      </footer>
    </div>
  );
};

export default App;
