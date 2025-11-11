
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import GameCanvas from '../components/game/GameCanvas';
import GameUI from '../components/game/GameUI';
import GameOverScreen from '../components/game/GameOverScreen';
import VirtualJoystick from '../components/game/VirtualJoystick';
import GameStatsBar from '../components/game/GameStatsBar';
import PauseMenu from '../components/game/PauseMenu';

export default function Game() {
  const [gameState, setGameState] = useState({
    score: 0,
    cowsCollected: 0,
    tanksDestroyed: 0,
    milkEarnedThisRun: 0,
    wave: 1,
    lives: 3,
    isGameOver: false,
    isPaused: false,
    isStarted: false,
    doubleMilkActive: false,
    isShielded: false,
    shieldTimer: 0,
    doubleScoreActive: false,
    doubleScoreTimer: 0,
    goldenCowBonusSpawnsRemaining: 0,
    isMilkstormActive: false,
    milkstormTimer: 0,
    isTimeFreezeActive: false,
    timeFreezeTimer: 0,
    cowStreakCount: 0,
    counterAttackReady: false,
    triggerCounterAttack: false,
    goldenCowCharmActive: false,
    antiGravityFieldActive: false,
    jokerCowBlessingActive: false,
    luckyJamActive: false, // Added luckyJamActive
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [user, setUser] = useState(null);
  const [equippedSpaceship, setEquippedSpaceship] = useState(null);
  const [equippedCowSkin, setEquippedCowSkin] = useState(null);
  const [equippedTankSkin, setEquippedTankSkin] = useState(null);
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameId, setGameId] = useState(0); // Added for forcing GameCanvas remount
  const [hasRevivedThisRun, setHasRevivedThisRun] = useState(false);
  const gameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const userUpdateTimeoutRef = useRef(null);

  const loadUser = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      
      if (!userData.ownedSpaceships || userData.ownedSpaceships.length === 0) {
        await base44.auth.updateMe({ ownedSpaceships: ['ufo'], equippedSpaceshipId: 'ufo' });
        userData.ownedSpaceships = ['ufo'];
        userData.equippedSpaceshipId = 'ufo';
      }
      if (!userData.equippedSpaceshipId) {
        await base44.auth.updateMe({ equippedSpaceships: ['ufo'], equippedSpaceshipId: 'ufo' });
        userData.equippedSpaceshipId = 'ufo';
      }

      if (!userData.unlockedCowSkins || userData.unlockedCowSkins.length === 0) {
        await base44.auth.updateMe({ 
          unlockedCowSkins: ['default_cow'],
          equippedCowSkinId: 'default_cow'
        });
        userData.unlockedCowSkins = ['default_cow'];
        userData.equippedCowSkinId = 'default_cow';
      }
      if (!userData.equippedCowSkinId) {
        await base44.auth.updateMe({ equippedCowSkinId: 'default_cow' });
        userData.equippedCowSkinId = 'default_cow';
      }
      
      if (!userData.unlockedTankSkins || userData.unlockedTankSkins.length === 0) {
        await base44.auth.updateMe({ 
          unlockedTankSkins: ['default_tank'],
          equippedTankSkinId: 'default_tank'
        });
        userData.unlockedTankSkins = ['default_tank'];
        userData.equippedTankSkinId = 'default_tank';
      }
      if (!userData.equippedTankSkinId) {
        await base44.auth.updateMe({ equippedTankSkinId: 'default_tank' });
        userData.equippedTankSkinId = 'default_tank';
      }
      
      setUser(userData);
      
      const ships = await base44.entities.Spaceship.list();
      const equippedShip = ships.find(s => s.ship_id === userData.equippedSpaceshipId);
      if (equippedShip) {
        setEquippedSpaceship(equippedShip);
      } else {
        const ufo = ships.find(s => s.ship_id === 'ufo');
        if (ufo) setEquippedSpaceship(ufo);
      }
      
      const cowSkins = await base44.entities.CowSkin.list();
      const equippedCow = cowSkins.find(s => s.skin_id === userData.equippedCowSkinId);
      if (equippedCow) {
        setEquippedCowSkin(equippedCow);
      }
      
      const tankSkins = await base44.entities.TankSkin.list();
      const equippedTank = tankSkins.find(s => s.skin_id === userData.equippedTankSkinId);
      if (equippedTank) {
        setEquippedTankSkin(equippedTank);
      }

    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limited, retrying loadUser in 5 seconds...');
        setTimeout(loadUser, 5000);
      } else {
        console.log('User not logged in', error);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.mozFullScreenElement || !!document.msFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      if (userUpdateTimeoutRef.current) {
        clearTimeout(userUpdateTimeoutRef.current);
      }
    };
  }, [loadUser]);

  const debouncedUpdateUser = useCallback((updates) => {
    if (userUpdateTimeoutRef.current) {
      clearTimeout(userUpdateTimeoutRef.current);
    }
    
    userUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await base44.auth.updateMe(updates);
        setUser(prev => ({ ...prev, ...updates }));
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('Rate limited, will retry user update in 5 seconds...');
          setTimeout(() => debouncedUpdateUser(updates), 5000);
        } else {
          console.error("Failed to update user data:", error);
        }
      }
    }, 1000);
  }, []);

  const startGame = async () => {
    console.log('🎮 Starting new game');
    
    let startingLives = 3;
    
    // Check if equipped spaceship overrides starting lives
    if (equippedSpaceship?.starting_lives) {
      startingLives = equippedSpaceship.starting_lives;
    }
    
    let doubleMilkForRun = false;
    let goldenCowCharmForRun = false;
    let antiGravityFieldForRun = false;
    let jokerCowBlessingForRun = false;
    let luckyJamForRun = false; // Added luckyJamForRun

    const userUpdates = {};

    if (user?.bonusLifeForNextRun) {
        startingLives = startingLives + 1;
        userUpdates.bonusLifeForNextRun = false;
    }
    
    // Check if equipped spaceship has bonus starting life
    if (equippedSpaceship?.bonus_starting_life) {
        startingLives += 1;
    }
    
    if (user?.doubleMilkForNextRun) {
        doubleMilkForRun = true;
        userUpdates.doubleMilkForNextRun = false;
    }

    if (user?.goldenCowCharmActive) {
        goldenCowCharmForRun = true;
        userUpdates.goldenCowCharmActive = false;
    }

    if (user?.antiGravityFieldActive) {
        antiGravityFieldForRun = true;
        userUpdates.antiGravityFieldActive = false;
    }

    if (user?.jokerCowBlessingActive) {
        jokerCowBlessingForRun = true;
        userUpdates.jokerCowBlessingActive = false;
    }

    // New check for luckyJamActive
    if (user?.luckyJamActive) {
        luckyJamForRun = true;
        userUpdates.luckyJamActive = false;
    }

    if (Object.keys(userUpdates).length > 0) {
      debouncedUpdateUser(userUpdates);
    }

    setGameId(prev => prev + 1); // Increment gameId to force GameCanvas remount
    setHasRevivedThisRun(false); // Reset revive flag

    setGameState({
      score: 0,
      cowsCollected: 0,
      tanksDestroyed: 0,
      milkEarnedThisRun: 0,
      wave: 1,
      lives: startingLives,
      isGameOver: false,
      isPaused: false,
      isStarted: true,
      doubleMilkActive: doubleMilkForRun,
      isShielded: false,
      shieldTimer: 0,
      doubleScoreActive: false,
      doubleScoreTimer: 0,
      goldenCowBonusSpawnsRemaining: 0,
      isMilkstormActive: false,
      milkstormTimer: 0,
      isTimeFreezeActive: false,
      timeFreezeTimer: 0,
      cowStreakCount: 0,
      counterAttackReady: false,
      triggerCounterAttack: false,
      goldenCowCharmActive: goldenCowCharmForRun,
      antiGravityFieldActive: antiGravityFieldForRun,
      jokerCowBlessingActive: jokerCowBlessingForRun,
      luckyJamActive: luckyJamForRun, // Set luckyJamActive in gameState
    });
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const restartGame = () => {
    startGame();
  };

  const goToMenu = () => {
    setGameState(prev => ({ 
      ...prev, 
      isStarted: false, 
      isGameOver: false,
      isPaused: false
    }));
  };

  const submitScore = async () => {
    if (!user) return;
    
    try {
      await base44.entities.HighScore.create({
        score: gameState.score,
        wave: gameState.wave,
        cowsCollected: gameState.cowsCollected,
        tanksDestroyed: gameState.tanksDestroyed,
        playerName: user.full_name || user.email
      });
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limited, please try submitting score again later');
      } else {
        console.error('Failed to submit score:', error);
      }
    }
  };

  const handleRevive = useCallback((milkLost) => {
    console.log('💫 St Suzzy revive triggered! Losing', milkLost, 'milk');
    setHasRevivedThisRun(true);
    
    // Update user's total milk by deducting the lost portion
    if (user) {
      const newTotalMilk = Math.max(0, (user.milk || 0) - milkLost);
      debouncedUpdateUser({ milk: newTotalMilk });
      setUser(prev => ({ ...prev, milk: newTotalMilk }));
    }
  }, [user, debouncedUpdateUser]);

  const handleJoystickMove = useCallback((x, y) => {
    setJoystickInput({ x, y });
  }, []);

  const updateGameState = useCallback((newState) => {
    if (typeof newState === 'function') {
      setGameState(newState);
    } else {
      setGameState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const triggerCounterAttackAction = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      triggerCounterAttack: true,
      counterAttackReady: false
    }));
  }, []);

  const resetCounterAttackTrigger = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      triggerCounterAttack: false,
      cowStreakCount: 0
    }));
  }, []);

  return (
    <div ref={gameContainerRef} className={`${isFullscreen ? 'fixed inset-0 w-full h-full bg-black flex z-50' : 'h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex'}`}>
      {isFullscreen && gameState.isStarted && (
        <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 p-4 border-r-2 border-cyan-400 overflow-y-auto">
          {/* Left control panel content */}
        </div>
      )}

      <div className={isFullscreen ? 'flex items-center justify-center flex-grow px-4' : 'flex items-center justify-center flex-grow'}>
        <div className={`${isFullscreen ? 'w-full h-full max-w-none aspect-[9/16]' : 'w-full h-full flex flex-col'}`}>
          <div className={isFullscreen ? 'w-full h-full' : 'flex-1 flex flex-col'}>
            {gameState.isStarted && !gameState.isGameOver && (
              <GameStatsBar
                gameState={gameState}
                onPause={pauseGame}
                onRestart={restartGame}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
              />
            )}

            <Card className={`${isFullscreen ? 'bg-transparent border-0 w-full h-full' : 'bg-white/10 backdrop-blur-md border-white/20 flex-1'} overflow-hidden`}>
              <CardContent className="p-0 relative w-full h-full">
                {!gameState.isStarted ? (
                  <div 
                    className="w-full relative h-full"
                    style={{
                      aspectRatio: '9 / 16',
                      backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/27255d313_file_00000000b73461f69ee416156fbde0892.png')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="absolute inset-0">
                      {/* START GAME Button */}
                      <div 
                        className="absolute"
                        style={{
                          top: '48%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '75%',
                          maxWidth: '280px'
                        }}
                      >
                        <Button
                          onClick={startGame}
                          size="lg"
                          className="w-full text-2xl font-bold bg-transparent hover:bg-white/10 border-0 h-16 rounded-full transition-all"
                        >
                          <span className="sr-only">START GAME</span>
                        </Button>
                      </div>

                      {/* MILK SHOP and LEADERBOARD buttons */}
                      <div 
                        className="absolute flex gap-3"
                        style={{
                          top: '62%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '80%',
                          maxWidth: '300px'
                        }}
                      >
                        <Link to={createPageUrl('Shop')} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full font-bold bg-transparent hover:bg-white/10 border-0 h-14 rounded-full transition-all"
                          >
                            <span className="sr-only">MILK SHOP</span>
                          </Button>
                        </Link>
                        
                        <Link to={createPageUrl('Leaderboard')} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full font-bold bg-transparent hover:bg-white/10 border-0 h-14 rounded-full transition-all"
                          >
                            <span className="sr-only">LEADERBOARD</span>
                          </Button>
                        </Link>
                      </div>
                      
                      {/* SETTINGS and SHOWROOM buttons */}
                      <div 
                        className="absolute flex gap-3"
                        style={{
                          top: '73%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '80%',
                          maxWidth: '300px',
                          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0rem))'
                        }}
                      >
                        <Link to={createPageUrl('Settings')} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full font-bold bg-transparent hover:bg-white/10 border-0 h-14 rounded-full transition-all"
                          >
                            <span className="sr-only">SETTINGS</span>
                          </Button>
                        </Link>

                        <Link to={createPageUrl('ShowRoom')} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full font-bold bg-transparent hover:bg-white/10 border-0 h-14 rounded-full transition-all"
                          >
                            <span className="sr-only">SHOWROOM</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-black w-full h-full" style={{ touchAction: 'none' }}>
                    <GameCanvas
                      key={gameId} // Added key to force remount on game restart
                      ref={gameRef}
                      gameState={gameState}
                      updateGameState={updateGameState}
                      soundEnabled={soundEnabled}
                      user={user}
                      equippedSpaceship={equippedSpaceship}
                      equippedCowSkin={equippedCowSkin}
                      equippedTankSkin={equippedTankSkin}
                      joystickInput={joystickInput}
                      onTriggerCounterAttack={triggerCounterAttackAction}
                      onResetCounterAttackTrigger={resetCounterAttackTrigger}
                      hasRevivedThisRun={hasRevivedThisRun}
                      onRevive={handleRevive}
                    />
                    <GameUI gameState={gameState} />
                    {gameState.isStarted && !gameState.isGameOver && user?.controlMethod !== 'direct_touch' && (
                      <VirtualJoystick
                        position="middle"
                        onMove={handleJoystickMove}
                        visible={true}
                      />
                    )}
                    
                    {gameState.isPaused && (
                      <PauseMenu
                        onResume={pauseGame}
                        onReturnToMenu={goToMenu}
                      />
                    )}
                  </div>
                )}
                
                {gameState.isGameOver && (
                  <GameOverScreen
                    score={gameState.score}
                    wave={gameState.wave}
                    cowsCollected={gameState.cowsCollected}
                    tanksDestroyed={gameState.tanksDestroyed}
                    milkEarnedThisRun={gameState.milkEarnedThisRun}
                    doubleMilkActive={gameState.doubleMilkActive}
                    onRestart={restartGame}
                    onMenu={goToMenu}
                    onSubmitScore={submitScore}
                    user={user}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isFullscreen && gameState.isStarted && (
        <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 p-4 border-l-2 border-cyan-400 overflow-y-auto">
          {/* Right control panel content */}
        </div>
      )}
    </div>
  );
}
