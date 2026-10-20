/**
 * Authentic Retro HUD Display (Score, Coins, World, Time, Lives, Sound Toggle)
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { sound } from '../game/sound';

interface GameHUDProps {
  score: number;
  highScore: number;
  coins: number;
  timeLeft: number;
  lives: number;
  worldName: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  coins,
  timeLeft,
  lives,
  worldName,
  isPaused,
  onTogglePause,
  onRestart,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const formattedScore = score.toString().padStart(6, '0');
  const formattedCoins = coins.toString().padStart(2, '0');
  const formattedTime = Math.max(0, timeLeft).toString().padStart(3, '0');

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-pixel">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] tracking-wider">MARIO</span>
          <span className="text-amber-400 tracking-widest">{formattedScore}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 animate-pulse">●</span>
          <span className="tracking-widest">x{formattedCoins}</span>
        </div>

        {/* World */}
        <div className="flex flex-col text-center">
          <span className="text-slate-400 text-[10px] tracking-wider">WORLD</span>
          <span className="tracking-widest">{worldName}</span>
        </div>

        {/* Time */}
        <div className="flex flex-col text-right">
          <span className="text-slate-400 text-[10px] tracking-wider">TIME</span>
          <span className={`${timeLeft <= 50 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'} tracking-widest`}>
            {formattedTime}
          </span>
        </div>

        {/* Lives */}
        <div className="flex flex-col text-right">
          <span className="text-slate-400 text-[10px] tracking-wider">LIVES</span>
          <span className="text-amber-300 tracking-widest">★ x{lives}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 font-sans">
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Pause or Resume"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onRestart}
            title="Restart Stage"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Restart Stage"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {highScore > 0 && (
        <div className="bg-slate-950/80 px-4 py-1 text-center text-[10px] font-pixel text-slate-400 border-t border-slate-900">
          TOP HIGH SCORE: <span className="text-yellow-400">{highScore.toString().padStart(6, '0')}</span>
        </div>
      )}
    </div>
  );
};
