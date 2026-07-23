
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

// Default spinning speed in degrees per millisecond
// 1.0 deg/ms = ~60 deg/frame at 60fps = 1000 deg/s (~2.78 RPS)
const V_DEFAULT = 1.0;

const RouletteWheel = forwardRef<RouletteWheelRef, RouletteWheelProps>(({ 
  restaurants, 
  onWinnerSelected,
  onReset 
}, ref) => {
  const [rotation, setRotation] = useState(0);
  const [wheelState, setWheelState] = useState<'spinning' | 'stopping' | 'idle'>('spinning');
  
  const rotationRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Stopping animation refs
  const stopStartTimeRef = useRef<number>(0);
  const stopStartAngleRef = useRef<number>(0);
  const stopTotalDistRef = useRef<number>(0);
  const stopDurationRef = useRef<number>(0);
  const winnerRef = useRef<Restaurant | null>(null);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
    }
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (wheelState === 'spinning') {
      rotationRef.current += V_DEFAULT * delta;
      setRotation(rotationRef.current % 360);
      requestRef.current = requestAnimationFrame(animate);
    } else if (wheelState === 'stopping') {
      const elapsed = time - stopStartTimeRef.current;
      const duration = stopDurationRef.current;
      const p = Math.min(1, elapsed / duration);
      
      // Quadratic ease-out: initial velocity at p=0 matches V_DEFAULT exactly
      const easeOut = 1 - (1 - p) * (1 - p);
      
      const currentRot = stopStartAngleRef.current + stopTotalDistRef.current * easeOut;
      rotationRef.current = currentRot;
      setRotation(currentRot);

      if (p < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setWheelState('idle');
        if (winnerRef.current) {
          onWinnerSelected(winnerRef.current);
        }
      }
    }
  }, [wheelState, onWinnerSelected]);

  useEffect(() => {
    lastTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [wheelState, animate]);

  const handleStop = () => {
    if (wheelState !== 'spinning') return;
    
    const segmentAngle = 360 / restaurants.length;
    const winnerIndex = Math.floor(Math.random() * restaurants.length);
    const winner = restaurants[winnerIndex];
    winnerRef.current = winner;

    const startAngle = rotationRef.current;
    
    // Target angle so pointer at 12 o'clock points to winner center
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    
    let distance = (targetAngle - (startAngle % 360) + 360) % 360;
    if (distance < 30) {
      distance += 360;
    }

    const extraTurns = 360 * 3; // 3 full rotations for satisfying stop
    const totalDistance = distance + extraTurns;

    // Calculate stop duration so initial speed at p=0 equals V_DEFAULT
    // For easeOut = 1 - (1-p)^2, derivative at p=0 is 2.
    // v(0) = (2 * totalDistance) / stopDuration = V_DEFAULT => stopDuration = (2 * totalDistance) / V_DEFAULT
    const stopDuration = (2 * totalDistance) / V_DEFAULT;

    stopStartTimeRef.current = performance.now();
    stopStartAngleRef.current = startAngle;
    stopTotalDistRef.current = totalDistance;
    stopDurationRef.current = stopDuration;

    setWheelState('stopping');
  };

  const handleReset = useCallback(() => {
    if (onReset) onReset();
    rotationRef.current = rotationRef.current % 360;
    setRotation(rotationRef.current % 360);
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 text-rose-500 text-5xl drop-shadow-md">
          <i className="fas fa-caret-down"></i>
        </div>

        {/* Static Wheel Shadow Base (Separated from rotating element) */}
        <div className="absolute inset-0 rounded-full shadow-2xl bg-white" />

        {/* Rotating Wheel Container */}
        <div 
          className="w-full h-full rounded-full border-[10px] border-white overflow-hidden relative z-10"
          style={{ 
            transform: `rotate(${rotation}deg)`
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
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-white shadow-xl z-30 flex items-center justify-center transition-all ${
            wheelState === 'spinning' 
              ? 'bg-rose-500 hover:bg-rose-600 cursor-pointer active:scale-90' 
              : 'bg-rose-500 cursor-wait'
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
