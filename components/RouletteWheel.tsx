
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Restaurant } from '../types';

interface RouletteWheelProps {
  restaurants: Restaurant[];
  onWinnerSelected: (winner: Restaurant) => void;
  onReset?: () => void;
}

export interface RouletteWheelRef {
  reset: () => void;
}

const RouletteWheel = forwardRef<RouletteWheelRef, RouletteWheelProps>(({ 
  restaurants, 
  onWinnerSelected,
  onReset 
}, ref) => {
  const [rotation, setRotation] = useState(0);
  const [wheelState, setWheelState] = useState<'spinning' | 'stopping' | 'idle'>('spinning');
  const [transitionStyle, setTransitionStyle] = useState<string>('none');
  
  const rotationRef = useRef(0);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);

  const animate = useCallback((time: number) => {
    if (startTimeRef.current === undefined) {
      startTimeRef.current = time;
    }
    
    rotationRef.current += 2.5; 
    setRotation(rotationRef.current % 360);
    
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (wheelState === 'spinning') {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [wheelState, animate]);

  const handleStop = () => {
    if (wheelState !== 'spinning') return;
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    const segmentAngle = 360 / restaurants.length;
    const winnerIndex = Math.floor(Math.random() * restaurants.length);
    const winner = restaurants[winnerIndex];

    const currentRot = rotationRef.current;
    const extraTurns = 360 * 4; 
    
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    
    const currentBase = currentRot % 360;
    let distance = targetAngle - currentBase;
    if (distance <= 0) distance += 360;
    
    const finalRotation = currentRot + distance + extraTurns;
    
    setTransitionStyle('transform 4s cubic-bezier(0.15, 0, 0.2, 1)');
    setRotation(finalRotation);
    setWheelState('stopping');

    setTimeout(() => {
      setWheelState('idle');
      onWinnerSelected(winner);
    }, 4000);
  };

  const handleReset = useCallback(() => {
    if (onReset) onReset();
    setTransitionStyle('none');
    const currentRot = rotationRef.current % 360;
    rotationRef.current = currentRot;
    setRotation(currentRot);
    setWheelState('spinning');
  }, [onReset]);

  useImperativeHandle(ref, () => ({
    reset: handleReset
  }));

  if (restaurants.length === 0) return null;

  const segmentAngle = 360 / restaurants.length;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-rose-500 text-5xl drop-shadow-md">
          <i className="fas fa-caret-down"></i>
        </div>

        {/* Wheel Container */}
        <div 
          className="w-full h-full rounded-full border-[10px] border-white shadow-2xl overflow-hidden relative"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: transitionStyle
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {restaurants.map((res, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              return (
                <g key={res.id}>
                  <path d={pathData} fill={res.color} stroke="white" strokeWidth="0.4" />
                  <text
                    x="78"
                    y="50"
                    fill="white"
                    fontSize="3.5"
                    fontWeight="800"
                    textAnchor="middle"
                    className="select-none"
                    transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50)`}
                  >
                    {res.name.length > 10 ? res.name.substring(0, 9) + '..' : res.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Center Stop Button */}
        <button 
          onClick={wheelState === 'spinning' ? handleStop : undefined}
          disabled={wheelState !== 'spinning'}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-white shadow-xl z-30 flex items-center justify-center transition-all active:scale-90 ${
            wheelState === 'spinning' 
              ? 'bg-rose-500 hover:bg-rose-600 cursor-pointer' 
              : 'bg-slate-300 cursor-not-allowed opacity-50'
          }`}
        >
          {wheelState === 'spinning' ? (
            <span className="text-white font-black text-lg">STOP</span>
          ) : (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>
      </div>
    </div>
  );
});

export default RouletteWheel;
