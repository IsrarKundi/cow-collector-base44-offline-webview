
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HighScore } from "@/api/entities";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const fetchedScores = await HighScore.list('-score', 10);
      setScores(fetchedScores);
    } catch (error) {
      console.error('Failed to load scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />;
    return <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center font-bold text-xs sm:text-sm md:text-lg text-gray-600">#{rank}</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";  
    if (rank === 3) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4">
      <div className="max-w-md mx-auto md:max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Link to={createPageUrl('Game')}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg truncate">
              🏆 LEADERBOARD
            </h1>
            <p className="text-white/90 text-xs sm:text-sm md:text-lg">Hall of Fame</p>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-md border-white/50">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-gray-800">
              Top Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">Loading high scores...</p>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl md:text-6xl mb-4">🐄</div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">No scores yet!</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm md:text-base">Be the first to set a high score!</p>
                <Link to={createPageUrl('Game')}>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    Play Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {scores.map((score, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={score.id}
                      className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-lg border-2 transition-all hover:shadow-md ${getRankBadge(rank)}`}
                    >
                      <div className="flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-xs sm:text-sm md:text-lg text-gray-800 truncate">
                          {score.playerName}
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-4 text-[10px] sm:text-xs md:text-sm text-gray-600">
                          <span>W{score.wave}</span>
                          <span>🐄 {score.cowsCollected}</span>
                          <span>💥 {score.tanksDestroyed}</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-right">
                        <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">
                          {score.score.toLocaleString()}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 hidden md:block">
                          {new Date(score.created_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4 sm:mt-6 md:mt-8">
          <Link to={createPageUrl('Game')}>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 w-full max-w-xs"
            >
              🚀 BACK TO GAME 🚀
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
