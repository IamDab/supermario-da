/**
 * RetroGameCanvas: Main Canvas Manager, Loop Host, and State Overlay System
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameStatus } from '../game/types';
import { GameHUD } from './GameHUD';
import { VirtualGamepad } from './VirtualGamepad';
import { Trophy, Play, RotateCcw } from 'lucide-react';

export const RetroGameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Synced HUD / Menu State
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(400);
  const [lives, setLives] = useState(3);
  const [worldName, setWorldName] = useState('1-1');

  // Callback to sync engine state with React
  const handleEngineStateChange = useCallback((eng: GameEngine) => {
    setStatus(eng.status);
    setScore(eng.score);
    setHighScore(eng.highScore);
    setCoins(eng.coins);
    setTimeLeft(eng.timeLeft);
    setLives(eng.lives);
    setWorldName(eng.worldName);
  }, []);

  // Initialize Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fixed internal coordinate buffer
    canvas.width = 768; // 384 * 2 for sharp integer scaling
    canvas.height = 480; // 240 * 2

    const engine = new GameEngine(canvas, handleEngineStateChange);
    engineRef.current = engine;
    engine.init();

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.right = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.input.down = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (engine.status === 'TITLE') {
          engine.startNewGame();
        } else {
          engine.input.jump = true;
        }
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ' || e.code === 'KeyJ') {
        engine.input.run = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        engine.pauseGame();
      }
      if (e.code === 'Enter') {
        if (engine.status === 'TITLE' || engine.status === 'GAME_OVER' || engine.status === 'LEVEL_CLEAR') {
          engine.startNewGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.right = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.input.down = false;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.input.jump = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ' || e.code === 'KeyJ') {
        engine.input.run = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.destroy();
    };
  }, [handleEngineStateChange]);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleVirtualInput = (key: keyof GameEngine['input'], value: boolean) => {
    if (engineRef.current) {
      engineRef.current.input[key] = value;
      if (key === 'jump' && value && (status === 'TITLE' || status === 'GAME_OVER')) {
        engineRef.current.startNewGame();
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Top HUD */}
      <GameHUD
        score={score}
        highScore={highScore}
        coins={coins}
        timeLeft={timeLeft}
        lives={lives}
        worldName={worldName}
        isPaused={status === 'PAUSED'}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
      />

      {/* Screen Frame with Canvas & Overlays */}
      <div className="relative w-full aspect-16/10 bg-[#5c94fc] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full pixelated block object-contain"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Title Screen Overlay */}
        {status === 'TITLE' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="mb-2 text-rose-500 font-pixel text-xl sm:text-2xl md:text-3xl tracking-widest drop-shadow-[0_4px_0_#943200]">
              SUPER PLUMBER
            </div>
            <div className="text-yellow-400 font-pixel text-xs sm:text-sm tracking-wider mb-6">
              RETRO PLATFORM RUNNER
            </div>

            <div className="max-w-md bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-xs text-slate-300 font-sans space-y-2 mb-6">
              <div className="font-pixel text-[11px] text-amber-300 mb-2">CONTROLS:</div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div><span className="font-pixel text-[10px] text-white">A / D</span> or <span className="font-pixel text-[10px] text-white">ARROWS</span>: Move</div>
                <div><span className="font-pixel text-[10px] text-white">SPACE</span> / <span className="font-pixel text-[10px] text-white">W</span>: Jump</div>
                <div><span className="font-pixel text-[10px] text-white">SHIFT</span> / <span className="font-pixel text-[10px] text-white">Z</span>: Sprint / Run</div>
                <div><span className="font-pixel text-[10px] text-white">S</span> / <span className="font-pixel text-[10px] text-white">DOWN</span>: Crouch</div>
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                ★ Stomp Goombas & Koopas, hit <span className="text-amber-400">?</span> blocks for mushrooms & coins, slide down the flagpole to win!
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs sm:text-sm rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              PRESS ENTER TO START
            </button>
          </div>
        )}

        {/* Paused Screen Overlay */}
        {status === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="text-amber-400 font-pixel text-xl tracking-widest mb-6 animate-pulse">
              GAME PAUSED
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleTogglePause}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs rounded-lg transition-colors cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-pixel text-xs rounded-lg transition-colors cursor-pointer"
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {status === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="text-rose-500 font-pixel text-2xl tracking-widest mb-3">
              GAME OVER
            </div>
            <div className="text-sm font-pixel text-slate-300 mb-2">
              FINAL SCORE: <span className="text-yellow-400">{score.toString().padStart(6, '0')}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="text-xs font-pixel text-emerald-400 mb-6 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4" /> NEW HIGH SCORE!
              </div>
            )}
            <button
              onClick={handleRestart}
              className="mt-4 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}

        {/* Level Clear Screen Overlay */}
        {status === 'LEVEL_CLEAR' && timeLeft === 0 && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20 animate-fade-in">
            <div className="text-yellow-400 font-pixel text-2xl tracking-widest mb-2 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" /> STAGE CLEAR!
            </div>
            <div className="text-xs font-pixel text-emerald-400 mb-4">
              PEACH CASTLE REACHED!
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-pixel space-y-2 mb-6">
              <div>SCORE: <span className="text-yellow-400">{score.toString().padStart(6, '0')}</span></div>
              <div>COINS: <span className="text-amber-300">{coins}</span></div>
            </div>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              PLAY STAGE AGAIN
            </button>
          </div>
        )}
      </div>

      {/* On-screen Virtual Gamepad for Mobile/Touch */}
      <div className="w-full bg-slate-950 border-t border-slate-800/80">
        <VirtualGamepad
          input={engineRef.current?.input || { left: false, right: false, down: false, jump: false, run: false }}
          onInputChange={handleVirtualInput}
        />
      </div>
    </div>
  );
};
