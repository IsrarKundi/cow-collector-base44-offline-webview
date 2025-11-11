import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Sparkles, Zap } from 'lucide-react';

export default function GameUI({ gameState }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Power-up indicators */}
      <div className="absolute top-4 left-2 md:left-4 space-y-2">
        {gameState.isShielded && (
          <Badge className="bg-blue-500/80 text-white border-blue-300/50 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Shield Active
          </Badge>
        )}
        {gameState.doubleScoreActive && (
          <Badge className="bg-yellow-500/80 text-black border-yellow-300/50 text-sm">
            <Star className="w-4 h-4 mr-2" />
            2x Score
          </Badge>
        )}
        {gameState.goldenCowBonusSpawnsRemaining > 0 && (
          <Badge className="bg-amber-400/80 text-black border-amber-300/50 text-sm">
            🐄✨ x{gameState.goldenCowBonusSpawnsRemaining}
          </Badge>
        )}
        {gameState.isMilkstormActive && (
          <Badge className="bg-white/80 text-gray-800 border-blue-300/50 text-sm">
            🥛 Milkstorm
          </Badge>
        )}
        {gameState.isTimeFreezeActive && (
          <Badge className="bg-purple-500/80 text-white border-purple-300/50 text-sm">
            💫 Time Freeze
          </Badge>
        )}
        {gameState.goldenCowCharmActive && (
          <Badge className="bg-yellow-300/80 text-black border-yellow-400/50 text-sm">
            🐄✨ Slow Charm
          </Badge>
        )}
        {gameState.luckyJamActive && (
          <Badge className="bg-orange-400/80 text-black border-orange-300/50 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Lucky Jam
          </Badge>
        )}
        {gameState.jokerCowBlessingActive && (
          <Badge className="bg-purple-400/80 text-white border-purple-300/50 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Joker Blessing
          </Badge>
        )}
      </div>
    </div>
  );
}