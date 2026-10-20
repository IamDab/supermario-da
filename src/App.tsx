/**
 * Main Application Component: Super Plumber Retro Run
 */

import React, { useState } from 'react';
import { RetroGameCanvas } from './components/RetroGameCanvas';
import { Gamepad2, Sparkles, Shield, Heart, Flag } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'guide' | 'enemies'>('game');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: 3 zones (Brand wordmark, nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <Gamepad2 className="w-5 h-5 text-rose-500" />
          <span className="font-pixel text-sm font-bold tracking-tight text-white whitespace-nowrap">
            Super Plumber
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('game')}
            className={`transition-colors whitespace-nowrap hover:text-white cursor-pointer ${
              activeTab === 'game' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Play Game
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors whitespace-nowrap hover:text-white cursor-pointer ${
              activeTab === 'guide' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Items & Power-ups
          </button>
          <button
            onClick={() => setActiveTab('enemies')}
            className={`transition-colors whitespace-nowrap hover:text-white cursor-pointer ${
              activeTab === 'enemies' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Enemy Guide
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('game');
              const btn = document.querySelector('canvas');
              if (btn) btn.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 text-xs font-pixel text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            Play Now
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Game Canvas Container */}
        <section aria-label="Game Screen" className="w-full flex justify-center">
          <RetroGameCanvas />
        </section>

        {/* Unboxed Metadata Strip (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 border-y border-slate-800/80 py-3">
          <span>World 1-1 Classic Stage</span>
          <span aria-hidden="true">·</span>
          <span>Authentic 60 FPS Physics</span>
          <span aria-hidden="true">·</span>
          <span>Synthesized 8-Bit Audio</span>
          <span aria-hidden="true">·</span>
          <span>Keyboard & Touch Gamepad</span>
        </div>

        {/* Features & Guide Sections */}
        {activeTab === 'guide' ? (
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Game Mechanics & Power-ups</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-pixel text-xs">
                  <Heart className="w-4 h-4 text-rose-500" /> Super Mushroom
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hit <span className="text-amber-400 font-pixel">?</span> blocks to reveal a Super Mushroom. Collecting it doubles your plumber's height, grants +1,000 points, and lets you smash brick blocks from below!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Golden Coins
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Collect coins scattered across the clouds or hidden within question mark blocks. Each coin yields 200 points, and gathering 100 coins awards a bonus 1-UP life!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-pixel text-xs">
                  <Flag className="w-4 h-4 text-emerald-400" /> The Flagpole
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Leap high from the final pyramid staircase to grab the top of the flagpole! Slide down, walk into the castle, and receive bonus points for every second remaining on the timer.
                </p>
              </div>
            </div>
          </section>
        ) : activeTab === 'enemies' ? (
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Enemies & Tactics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-500 font-pixel text-xs">
                  <Shield className="w-4 h-4 text-amber-500" /> Goomba
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stubborn mushroom minions patrolling the ground. Stomp them from above to flatten them for +100 points, or bump the underside of bricks when they walk overhead to defeat them.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-pixel text-xs">
                  <Shield className="w-4 h-4 text-emerald-400" /> Koopa Troopa
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Green-shelled patrols. Stomping a Koopa forces it into its shell. Run into the stationary shell to kick it across the stage, mowing down any enemies in its path!
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-pixel text-[11px] text-amber-400">01. Variable Jump</div>
              <p className="text-xs text-slate-400">
                Tap Jump for a quick hop or hold Jump to leap up to four blocks high over green pipes.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-pixel text-[11px] text-rose-400">02. Sprint & Skid</div>
              <p className="text-xs text-slate-400">
                Hold Shift or Run to build momentum. Turn sharply while at top speed to kick up skid dust.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-pixel text-[11px] text-emerald-400">03. Brick Shatter</div>
              <p className="text-xs text-slate-400">
                Power up with a Super Mushroom to shatter bricks into flying debris fragments.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="font-pixel text-[11px] text-sky-400">04. Turtle Shells</div>
              <p className="text-xs text-slate-400">
                Stomp Koopas into shells and kick them to clear queues of approaching Goombas.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Super Plumber Retro Run · Classic Platformer</span>
          <span>Pure Web Audio · Zero Asset Dependencies</span>
        </div>
      </footer>
    </div>
  );
}
