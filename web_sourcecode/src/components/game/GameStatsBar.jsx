import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Pause, Play, RotateCcw, Volume2, VolumeX, Satellite, Zap } from 'lucide-react';

export default function GameStatsBar({ gameState, onPause, onRestart, soundEnabled, onToggleSound }) {
  const cowStreakProgress = Math.min((gameState.cowStreakCount / 10) * 100, 100); // Changed from 11 to 10

  return (
    <div className="bg-black/80 backdrop-blur-sm border-2 border-green-400 rounded-lg p-1.5 sm:p-2 md:p-3 mb-1 sm:mb-2">
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          <Satellite className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400 flex-shrink-0" />
          <span className="text-purple-400 font-bold text-xs sm:text-sm md:text-lg whitespace-nowrap">W{gameState.wave}</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 bg-yellow-400 rounded-lg px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0" />
          <span className="text-black font-bold text-sm sm:text-base md:text-xl whitespace-nowrap">
            {gameState.score.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="text-base sm:text-xl md:text-2xl">🐄</span>
            <span className="text-cyan-400 font-bold text-xs sm:text-sm md:text-lg">{gameState.cowsCollected}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="text-base sm:text-xl md:text-2xl">💥</span>
            <span className="text-red-400 font-bold text-xs sm:text-sm md:text-lg">{gameState.tanksDestroyed}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 transition-all ${
          gameState.counterAttackReady 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-cyan-400/50' 
            : 'bg-black/50'
        }`}>
          <Zap className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
            gameState.counterAttackReady 
              ? 'text-white animate-pulse' 
              : 'text-white/50'
          }`} />
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className={`font-bold text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap ${
              gameState.counterAttackReady ? 'text-white' : 'text-white/70'
            }`}>
              SHOT O' MILK
            </div>
            <div className="relative w-16 sm:w-20 md:w-24 h-2 sm:h-2.5 bg-gray-800/80 rounded-full overflow-hidden border-2 border-white/40 shadow-inner">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-full ${
                  gameState.counterAttackReady 
                    ? 'bg-gradient-to-r from-white via-blue-100 to-cyan-200 animate-pulse shadow-lg shadow-cyan-300/50' 
                    : 'bg-gradient-to-r from-blue-200 via-white to-blue-100'
                }`}
                style={{ 
                  width: `${cowStreakProgress}%`,
                  boxShadow: gameState.counterAttackReady ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none'
                }}
              >
                {gameState.counterAttackReady && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <span className={`font-bold text-xs sm:text-sm ${
            gameState.counterAttackReady ? 'text-white' : 'text-white/70'
          }`}>
            {gameState.cowStreakCount}/10
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 bg-black/50 rounded-lg px-1 sm:px-2 py-0.5 sm:py-1">
          {[...Array(Math.min(gameState.lives, 5))].map((_, i) => (
            <Heart
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 fill-red-400"
            />
          ))}
        </div>
        
        <div className="flex gap-0.5 sm:gap-1 md:gap-2">
          <Button
            onClick={onPause}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            {gameState.isPaused ? <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> : <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />}
          </Button>
          
          <Button
            onClick={onToggleSound}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            {soundEnabled ? <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> : <VolumeX className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />}
          </Button>
          
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}