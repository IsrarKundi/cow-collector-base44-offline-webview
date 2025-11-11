import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Home, Trophy, Milk } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GameOverScreen({ 
  score, 
  wave, 
  cowsCollected, 
  tanksDestroyed, 
  milkEarnedThisRun,
  doubleMilkActive,
  onRestart, 
  onMenu, 
  onSubmitScore,
  user 
}) {
  const [milkAwarded, setMilkAwarded] = useState(false);
  const [totalMilk, setTotalMilk] = useState(user?.milk || 0);
  const [isUpdatingMilk, setIsUpdatingMilk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);

  const finalMilkAwarded = milkEarnedThisRun * (doubleMilkActive ? 2 : 1);

  useEffect(() => {
    if (user && finalMilkAwarded > 0 && !milkAwarded && !isUpdatingMilk) {
      const awardMilk = async () => {
        setIsUpdatingMilk(true);
        const newTotal = (user.milk || 0) + finalMilkAwarded;
        try {
          await base44.auth.updateMe({ milk: newTotal });
          setTotalMilk(newTotal);
          setMilkAwarded(true);
          
          await checkAndUnlockSkins();
        } catch (error) {
          if (error.response?.status === 429) {
            console.log('Rate limited, retrying milk award in 3 seconds...');
            setTimeout(awardMilk, 3000);
          } else {
            console.error("Failed to award milk:", error);
          }
        } finally {
          setIsUpdatingMilk(false);
        }
      };
      
      setTimeout(awardMilk, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, finalMilkAwarded, milkAwarded, isUpdatingMilk, score]);

  const checkAndUnlockSkins = async () => {
    try {
      const [cowSkins, tankSkins] = await Promise.all([
        base44.entities.CowSkin.list(),
        base44.entities.TankSkin.list()
      ]);

      const unlockedCowSkins = user.unlockedCowSkins || ['default_cow'];
      const unlockedTankSkins = user.unlockedTankSkins || ['default_tank'];

      let newCowSkins = [...unlockedCowSkins];
      let newTankSkins = [...unlockedTankSkins];

      cowSkins.forEach(skin => {
        if (!unlockedCowSkins.includes(skin.skin_id) && score >= skin.unlock_score_threshold) {
          newCowSkins.push(skin.skin_id);
          console.log(`🎉 Unlocked cow skin: ${skin.name}!`);
        }
      });

      tankSkins.forEach(skin => {
        if (!unlockedTankSkins.includes(skin.skin_id) && score >= skin.unlock_score_threshold) {
          newTankSkins.push(skin.skin_id);
          console.log(`🎉 Unlocked tank skin: ${skin.name}!`);
        }
      });

      if (newCowSkins.length > unlockedCowSkins.length || newTankSkins.length > unlockedTankSkins.length) {
        await base44.auth.updateMe({
          unlockedCowSkins: newCowSkins,
          unlockedTankSkins: newTankSkins
        });
      }
    } catch (error) {
      console.error('Failed to check/unlock skins:', error);
    }
  };

  const getScoreRating = (score) => {
    if (score >= 5000) return { emoji: '🏆', text: 'LEGENDARY!', color: 'text-yellow-400' };
    if (score >= 3000) return { emoji: '👑', text: 'MASTER!', color: 'text-purple-400' };
    if (score >= 2000) return { emoji: '⭐', text: 'AMAZING!', color: 'text-blue-400' };
    if (score >= 1000) return { emoji: '🎉', text: 'Great!', color: 'text-green-400' };
    if (score >= 500) return { emoji: '👍', text: 'Good!', color: 'text-indigo-400' };
    return { emoji: '🎮', text: 'Keep trying!', color: 'text-pink-400' };
  };

  const rating = getScoreRating(score);

  const handleSubmitScore = async () => {
    if (hasSubmitted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (onSubmitScore) {
        await onSubmitScore();
      }
      setHasSubmitted(true);
      setShowSubmissionToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowSubmissionToast(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Re-enable button on error so user can try again
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full"
      >
        <Card className="bg-white/90 backdrop-blur-md border-white/50 max-w-md w-full mx-auto">
          <CardContent className="p-6 md:p-8 text-center">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-5xl md:text-6xl mb-4"
            >
              {rating.emoji}
            </motion.div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <p className={`text-lg md:text-xl font-semibold mb-6 ${rating.color}`}>
              {rating.text}
            </p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">Final Score:</span>
                <span className="text-xl md:text-2xl font-bold text-purple-600">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-600">Wave Reached:</span>
                <span className="font-bold text-blue-600">
                  {wave}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-600">Cows Collected:</span>
                <span className="font-bold text-green-600">
                  🐄 {cowsCollected}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-600">Tanks Destroyed:</span>
                <span className="font-bold text-red-600">
                  💥 {tanksDestroyed}
                </span>
              </div>

              {user && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 flex items-center gap-2"><Milk className="w-4 h-4 text-yellow-500" /> Milk Earned:</span>
                    <span className="text-lg font-bold text-yellow-600">
                      +{finalMilkAwarded.toLocaleString()}
                      {doubleMilkActive && <span className="text-xs text-green-500 ml-1">(2x bonus!)</span>}
                    </span>
                  </div>
                   <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-600">New Total:</span>
                    <span className="font-bold text-gray-700">
                      {totalMilk.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {user && score > 0 && (
              <div className="mb-6">
                <Button
                  onClick={handleSubmitScore}
                  disabled={hasSubmitted || isSubmitting}
                  className={`${
                    hasSubmitted 
                      ? 'bg-green-500 hover:bg-green-500' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-black font-semibold px-6`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : hasSubmitted ? 'Submitted!' : 'Submit to Leaderboard'}
                </Button>
              </div>
            )}

            <div className="flex gap-3 justify-center mb-6">
              <Button
                onClick={onRestart}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={onMenu}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6"
              >
                <Home className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </div>

            <div className="text-xs md:text-sm text-gray-500">
              <p>🌟 Try to beat your high score!</p>
              <p>💡 Pro tip: Guide missiles back to tanks for maximum points!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submission Toast Notification */}
      <AnimatePresence>
        {showSubmissionToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Submission Completed!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}