
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Target, Zap, Shield, Star, Heart, Trophy } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Tutorial() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 md:p-4">
      <div className="max-w-md mx-auto md:max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Link to={createPageUrl('Game')}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
              📚 HOW TO PLAY
            </h1>
            <p className="text-white/90 text-xs md:text-lg">Master the Milky Way</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Controls Section */}
          <Card className="bg-white/90 backdrop-blur-md border-white/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-blue-500" />
                1. Ship Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕹️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Movement</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Use the <strong>virtual joystick</strong> (bottom of screen) to fly your spaceship in any direction.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Desktop: Use WASD keys or arrow keys
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cow Collection Section */}
          <Card className="bg-white/90 backdrop-blur-md border-white/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🐄</span>
                2. Collecting Cows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">Your Mission</h4>
                    <p className="text-gray-600 text-sm md:text-base mb-3">
                      Fly your ship directly <strong>over the cows</strong> to collect them with your tractor beam. This is your main objective!
                    </p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">🐄 Regular Cow:</span>
                        <span className="font-semibold">+250 points, +1 milk</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">🐄✨ Golden Cow:</span>
                        <span className="font-semibold">+800 points, +5 milk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tank Strategy Section - Most Important */}
          <Card className="bg-white/90 backdrop-blur-md border-white/50 border-2 border-orange-400">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-red-500" />
                3. Tank Strategy (KEY!)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Master This Technique!
                  </h4>
                  <p className="text-orange-700 text-sm md:text-base mb-3">
                    This is the <strong>core strategy</strong> that separates good players from great ones:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">1</div>
                      <p className="text-gray-700 text-sm">
                        <strong>Enemy tanks</strong> will appear and fire <strong>homing missiles</strong> that chase your ship.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">2</div>
                      <p className="text-gray-700 text-sm">
                        <strong>Don't just run away!</strong> Instead, fly close to the tank that fired the missile.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">3</div>
                      <p className="text-gray-700 text-sm">
                        <strong>Lure the missile into the tank</strong> - the missile will destroy its own tank! +100 points for you.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs md:text-sm font-semibold">
                      💡 Pro Tip: This technique turns dangerous situations into scoring opportunities!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups Section */}
          <Card className="bg-white/90 backdrop-blur-md border-white/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-500" />
                4. Power-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  Collect these special items for temporary advantages:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Shield</h4>
                      <p className="text-gray-600 text-sm">Absorbs one missile hit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">2x</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Double Score</h4>
                      <p className="text-gray-600 text-sm">All points doubled for 10 seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <Heart className="w-8 h-8 text-red-500" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Extra Life</h4>
                      <p className="text-gray-600 text-sm">Gain one additional life (rare!)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <span className="text-2xl">🐄✨</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Golden Cow Bonus</h4>
                      <p className="text-gray-600 text-sm">Next 5 cows will be golden!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Progression Section */}
          <Card className="bg-white/90 backdrop-blur-md border-white/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                5. Game Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">📈</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Waves Get Harder</h4>
                    <p className="text-gray-600 text-sm">
                      Every 30-35 seconds, you advance to the next wave. Missiles become faster and more aggressive.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">🥛</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Earn Milk</h4>
                    <p className="text-gray-600 text-sm">
                      Use collected milk in the shop to buy power-ups for your next run.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">🏆</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">High Scores</h4>
                    <p className="text-gray-600 text-sm">
                      Submit your best scores to compete on the leaderboard!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips Section */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                💡 Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm md:text-base">
                <p className="text-gray-700">
                  ✅ <strong>Stay calm</strong> when missiles are chasing you - use them as weapons!
                </p>
                <p className="text-gray-700">
                  ✅ <strong>Golden cows</strong> move faster but give much more milk and points.
                </p>
                <p className="text-gray-700">
                  ✅ <strong>Power-ups</strong> can completely change your strategy - grab them when safe.
                </p>
                <p className="text-gray-700">
                  ✅ <strong>Higher waves</strong> = faster missiles but also more golden cows!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link to={createPageUrl('Game')}>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4"
            >
              🚀 READY TO PLAY 🚀
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
