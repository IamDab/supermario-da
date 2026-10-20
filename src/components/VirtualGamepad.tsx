/**
 * Touch Virtual Gamepad for Mobile & Touchscreens
 */

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { InputState } from '../game/types';

interface VirtualGamepadProps {
  input: InputState;
  onInputChange: (key: keyof InputState, value: boolean) => void;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  onInputChange,
}) => {
  const handleTouch = (key: keyof InputState, active: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInputChange(key, active);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4 select-none touch-none">
      {/* D-Pad */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onTouchStart={handleTouch('left', true)}
          onTouchEnd={handleTouch('left', false)}
          onMouseDown={handleTouch('left', true)}
          onMouseUp={handleTouch('left', false)}
          onMouseLeave={handleTouch('left', false)}
          className="w-13 h-13 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onTouchStart={handleTouch('down', true)}
          onTouchEnd={handleTouch('down', false)}
          onMouseDown={handleTouch('down', true)}
          onMouseUp={handleTouch('down', false)}
          onMouseLeave={handleTouch('down', false)}
          className="w-13 h-13 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Crouch"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          type="button"
          onTouchStart={handleTouch('right', true)}
          onTouchEnd={handleTouch('right', false)}
          onMouseDown={handleTouch('right', true)}
          onMouseUp={handleTouch('right', false)}
          onMouseLeave={handleTouch('right', false)}
          className="w-13 h-13 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons: B (Run) and A (Jump) */}
      <div className="flex items-center gap-3">
        {/* B Button (Sprint / Run) */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onTouchStart={handleTouch('run', true)}
            onTouchEnd={handleTouch('run', false)}
            onMouseDown={handleTouch('run', true)}
            onMouseUp={handleTouch('run', false)}
            onMouseLeave={handleTouch('run', false)}
            className="w-14 h-14 rounded-full bg-rose-700 active:bg-rose-600 border-2 border-rose-500 text-white font-pixel text-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Run Button"
          >
            B
          </button>
          <span className="text-[10px] text-slate-400 font-pixel mt-1">RUN</span>
        </div>

        {/* A Button (Jump) */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onTouchStart={handleTouch('jump', true)}
            onTouchEnd={handleTouch('jump', false)}
            onMouseDown={handleTouch('jump', true)}
            onMouseUp={handleTouch('jump', false)}
            onMouseLeave={handleTouch('jump', false)}
            className="w-14 h-14 rounded-full bg-rose-600 active:bg-rose-500 border-2 border-rose-400 text-white font-pixel text-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Jump Button"
          >
            A
          </button>
          <span className="text-[10px] text-slate-400 font-pixel mt-1">JUMP</span>
        </div>
      </div>
    </div>
  );
};
