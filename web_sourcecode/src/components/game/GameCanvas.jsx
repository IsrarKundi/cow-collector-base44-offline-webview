
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

const GameCanvas = forwardRef(({ gameState, updateGameState, soundEnabled, user, equippedSpaceship, equippedCowSkin, equippedTankSkin, joystickInput, onTriggerCounterAttack, onResetCounterAttackTrigger, hasRevivedThisRun, onRevive }, ref) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameEngineRef = useRef(null);
  const latestGameState = useRef(gameState);
  const joystickInputRef = useRef(joystickInput);
  const equippedSpaceshipRef = useRef(equippedSpaceship);
  const equippedCowSkinRef = useRef(equippedCowSkin);
  const equippedTankSkinRef = useRef(equippedTankSkin);
  const userRef = useRef(user);
  const hasRevivedThisRunRef = useRef(hasRevivedThisRun);
  const onReviveRef = useRef(onRevive);

  const playerFlyingImageRef = useRef(null);
  const playerTractorImageRef = useRef(null);
  const cowImageRef = useRef(null);
  const goldenCowImageRef = useRef(null);
  const jokerCowImageRef = useRef(null);
  const tankImageRef = useRef(null);
  const missileImageRef = useRef(null);
  const backgroundImagesRef = useRef([]);

  const imagesLoaded = useRef({
    playerFlying: false,
    playerTractor: false,
    cow: false,
    goldenCow: false,
    jokerCow: false,
    backgrounds: [],
    tank: false,
    missile: false
  });

  // Utility function to load images, made into a useCallback to be reusable across effects
  const loadImage = useCallback((ref, url, flag) => {
    if (!url) {
      console.error(`❌ No URL provided for ${flag}`);
      imagesLoaded.current[flag] = false; // Ensure flag is reset if URL is invalid
      if (ref.current) ref.current.src = ''; // Clear image src if invalid URL
      return;
    }

    // Only load if the URL is different or the image hasn't been loaded yet
    if (!ref.current || ref.current.src !== url) {
      if (ref.current && ref.current.src && ref.current.src !== url) {
         imagesLoaded.current[flag] = false; // Reset flag if changing image
      }
      ref.current = new Image();
      ref.current.src = url;
      ref.current.onload = () => {
        imagesLoaded.current[flag] = true;
        console.log(`✅ Image loaded successfully: ${flag} (${url})`);
      };
      ref.current.onerror = (e) => {
        imagesLoaded.current[flag] = false;
        console.error(`❌ Failed to load image: ${flag}`, {
          url: url,
          error: e,
          errorType: e.type,
          target: e.target
        });
      };
    } else if (ref.current.src === url && !imagesLoaded.current[flag]) {
      // If the URL is the same but the image isn't marked as loaded (e.g., due to previous error), try to reload
      ref.current.src = ''; // Clear and re-assign to trigger reload
      ref.current.src = url;
    }
  }, []); // imagesLoaded is a ref, so it's stable and doesn't need to be in dependencies

  // Update refs when props change
  useEffect(() => {
    latestGameState.current = gameState;
  }, [gameState]);

  useEffect(() => {
    joystickInputRef.current = joystickInput;
  }, [joystickInput]);

  useEffect(() => {
    equippedSpaceshipRef.current = equippedSpaceship;
    if (gameEngineRef.current && equippedSpaceship) {
      const game = gameEngineRef.current;
      game.player.width = equippedSpaceship.base_player_width || 55;
      game.player.height = equippedSpaceship.base_player_height || 55;
      game.player.speed = 4 * (equippedSpaceship.speed_modifier || 1);
      game.player.lightBeamSize = equippedSpaceship.tractor_beam_size || 60;
    }

    // Load spaceship images when equippedSpaceship changes
    const DEFAULT_PLAYER_FLYING_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/0b7d89908_file_00000000243861f59ec2b2c614aa36a1.png';
    const DEFAULT_PLAYER_TRACTOR_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/283db7187_file_0000000033a061f9bb7b5355e4e2fb78.png';

    if (!equippedSpaceship) {
        console.log('🚀 equippedSpaceship is null or undefined, using default player images.');
        imagesLoaded.current.playerFlying = false;
        imagesLoaded.current.playerTractor = false;
        loadImage(playerFlyingImageRef, DEFAULT_PLAYER_FLYING_IMAGE, 'playerFlying');
        loadImage(playerTractorImageRef, DEFAULT_PLAYER_TRACTOR_IMAGE, 'playerTractor');
        return;
    }

    console.log('🚀 Loading spaceship images for:', equippedSpaceship.name);
    loadImage(playerFlyingImageRef, equippedSpaceship.normal_image_url || DEFAULT_PLAYER_FLYING_IMAGE, 'playerFlying');
    loadImage(playerTractorImageRef, equippedSpaceship.tractor_image_url || DEFAULT_PLAYER_TRACTOR_IMAGE, 'playerTractor');
  }, [equippedSpaceship, loadImage]); // loadImage is a dependency now

  useEffect(() => {
    equippedCowSkinRef.current = equippedCowSkin;
    
    // Dynamically reload cow skin image when it changes
    const defaultCowSkinUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/37f1c0578_IMG_20250902_224559.png';
    const cowSkinImageUrl = equippedCowSkin?.image_url || defaultCowSkinUrl;
    loadImage(cowImageRef, cowSkinImageUrl, 'cow');
  }, [equippedCowSkin, loadImage]); // loadImage is a dependency now

  useEffect(() => {
    equippedTankSkinRef.current = equippedTankSkin;
    
    // Dynamically reload tank and missile skin images when they change
    const defaultTankSkinUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/7e09305d2_file_00000000166c61f985a5ea659acd6072.png';
    const defaultMissileSkinUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/3e4dbf3dd_file_00000000107c61f9bbe14886b58f018d.png';

    const tankSkinImageUrl = equippedTankSkin?.image_url || defaultTankSkinUrl;
    const missileSkinImageUrl = equippedTankSkin?.missile_image_url || defaultMissileSkinUrl;
    
    loadImage(tankImageRef, tankSkinImageUrl, 'tank');
    loadImage(missileImageRef, missileSkinImageUrl, 'missile');
  }, [equippedTankSkin, loadImage]); // loadImage is a dependency now

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    hasRevivedThisRunRef.current = hasRevivedThisRun;
  }, [hasRevivedThisRun]);

  useEffect(() => {
    onReviveRef.current = onRevive;
  }, [onRevive]);

  useImperativeHandle(ref, () => ({
    getEngine: () => gameEngineRef.current
  }));

  const handleMouseMove = useCallback((e) => {
    const game = gameEngineRef.current;
    if (!game) return;

    const currentUser = userRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentUser?.controlMethod === 'direct_touch' && game.directTouchActive) {
      const rect = canvas.getBoundingClientRect();
      game.lastTouchX = ((e.clientX - rect.left) / rect.width) * game.width;
      game.lastTouchY = ((e.clientY - rect.top) / rect.height) * game.height;
    }
  }, [gameEngineRef, userRef, canvasRef]);

  const handleMouseUp = useCallback(() => {
    const game = gameEngineRef.current;
    if (!game) return;

    const currentUser = userRef.current;
    if (currentUser?.controlMethod === 'direct_touch') {
      game.directTouchActive = false;
    }
  }, [gameEngineRef, userRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!gameState.isStarted) return;

    console.log('🎮 Initializing game engine');

    const DEFAULT_PLAYER_SPEED = 4;
    const DEFAULT_PLAYER_WIDTH = 55;
    const DEFAULT_PLAYER_HEIGHT = 55;
    const DEFAULT_LIGHT_BEAM_SIZE = 60;
    const DEFAULT_INVINCIBLE_DURATION = 1500;
    const DEFAULT_SHIELD_DURATION = 10000;

    const BACKGROUNDS = [
      { minWave: 1, maxWave: 2, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/0a3296b10_file_0000000067346230bdbe92448292808a.png' },
      { minWave: 3, maxWave: 4, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/d6291dda8_file_00000000381c622fa054b9e56390227c.png' },
      { minWave: 5, maxWave: 7, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/8a3e77522_file_00000000494c622f90818bbeda956da2.png' },
      { minWave: 8, maxWave: 9, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/2406bd062_file_00000000f834622f88d5af14551edbbd.png' },
      { minWave: 10, maxWave: 12, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/caae276bf_file_00000000cbd4622facfeab849ef5d0c1.png' },
      { minWave: 13, maxWave: 14, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/3c958675d_file_00000000858861fdb5aea21b157d3538.png' },
      { minWave: 15, maxWave: 17, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/9de1ef438_file_00000000b5cc61f59bcb515298fdeccf.png' },
      { minWave: 18, maxWave: Infinity, url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/9de1ef438_file_00000000b5cc61f59bcb515298fdeccf.png' }
    ];

    // Initialize all background images
    backgroundImagesRef.current = BACKGROUNDS.map((bg, index) => {
      const img = new Image();
      img.src = bg.url;
      img.onload = () => {
        imagesLoaded.current.backgrounds[index] = true;
        console.log(`✅ Background ${index} loaded successfully`);
      };
      img.onerror = (e) => {
        imagesLoaded.current.backgrounds[index] = false;
        console.error(`❌ Failed to load background ${index}: ${bg.url}`);
        
        // Create a fallback gradient background
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 360;
        fallbackCanvas.height = 640;
        const ctxFallback = fallbackCanvas.getContext('2d');
        const gradient = ctxFallback.createLinearGradient(0, 0, 0, 640);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctxFallback.fillStyle = gradient;
        ctxFallback.fillRect(0, 0, 360, 640);
        
        // Convert canvas to image
        const fallbackImg = new Image();
        fallbackImg.src = fallbackCanvas.toDataURL();
        backgroundImagesRef.current[index] = fallbackImg;
        // Mark as loaded so it can be drawn
        imagesLoaded.current.backgrounds[index] = true; 
        console.log(`🎨 Created fallback gradient for background ${index}`);
      };
      return img;
    });

    // Initial load for other images using the loadImage useCallback
    const cowSkinImageUrl = equippedCowSkin?.image_url || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/37f1c0578_IMG_20250902_224559.png';
    loadImage(cowImageRef, cowSkinImageUrl, 'cow');
    
    loadImage(goldenCowImageRef, 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/276673a1c_IMG_20250902_224538.png', 'goldenCow');
    loadImage(jokerCowImageRef, 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/7c32eafa0_file_0000000060d461fda3c93c25739b332a.png', 'jokerCow');
    
    const tankSkinImageUrl = equippedTankSkin?.image_url || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/7e09305d2_file_00000000166c61f985a5ea659acd6072.png';
    const missileSkinImageUrl = equippedTankSkin?.missile_image_url || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/3e4dbf3dd_file_00000000107c61f9bbe14886b58f018d.png';
    loadImage(tankImageRef, tankSkinImageUrl, 'tank');
    loadImage(missileImageRef, missileSkinImageUrl, 'missile');

    // Initial load for player images (was previously in equippedSpaceship useEffect, but needs to be here for initial engine setup)
    const DEFAULT_PLAYER_FLYING_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/0b7d89908_file_00000000243861f59ec2b2c614aa36a1.png';
    const DEFAULT_PLAYER_TRACTOR_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b7167b72d3be0222f05856/283db7187_file_0000000033a061f9bb7b5355e4e2fb78.png';
    
    const playerFlyingSrc = equippedSpaceshipRef.current?.normal_image_url || DEFAULT_PLAYER_FLYING_IMAGE;
    const playerTractorSrc = equippedSpaceshipRef.current?.tractor_image_url || DEFAULT_PLAYER_TRACTOR_IMAGE;
    
    loadImage(playerFlyingImageRef, playerFlyingSrc, 'playerFlying');
    loadImage(playerTractorImageRef, playerTractorSrc, 'playerTractor');


    const ctx = canvas.getContext('2d');

    const game = {
      canvas,
      ctx,
      width: canvas.width,
      height: canvas.height,
      player: {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        width: equippedSpaceshipRef.current?.base_player_width || DEFAULT_PLAYER_WIDTH,
        height: equippedSpaceshipRef.current?.base_player_height || DEFAULT_PLAYER_HEIGHT,
        speed: 4 * (equippedSpaceshipRef.current?.speed_modifier || 1),
        lightBeamSize: equippedSpaceshipRef.current?.tractor_beam_size || DEFAULT_LIGHT_BEAM_SIZE,
        isInvincible: false,
        invincibleTimer: 0,
        tractorBeamActive: false,
        tractorBeamTimer: 0,
        isShielded: false,
        shieldTimer: 0,
        isMilkstormActive: false,
        milkstormTimer: 0,
        wasMovingLastFrame: false,
      },
      cows: [],
      jokerCow: null,
      jokerCowWaveCounter: 0,
      enemies: [],
      missiles: [],
      particles: [],
      powerups: [],
      keys: {},
      lastTime: 0,
      cowSpawnTimer: 0,
      enemySpawnTimer: 0,
      powerupSpawnTimer: 0,
      waveTimer: 0,
      initialized: false,
      gameStartTime: 0,
      doubleScoreActive: false,
      doubleScoreTimer: 0,
      goldenCowBonusSpawnsRemaining: 0,
      isTimeFreezeActive: false,
      timeFreezeTimer: 0,
      empBlast: {
        active: false,
        timer: 0,
        maxDuration: 800,
        maxRadius: 200
      },
      counterAttackBlast: {
        active: false,
        timer: 0,
        maxDuration: 600,
        maxRadius: 140
      },
      backgroundTransition: {
        active: false,
        oldBgIndex: 0,
        newBgIndex: 0,
        flickerTimer: 0,
        flickerInterval: 150,
        flickersRemaining: 6,
        showOld: true
      },
      currentBackgroundIndex: 0,
      lastWave: 1,
      backgrounds: BACKGROUNDS,
      directTouchActive: false,
      lastTouchX: 0,
      lastTouchY: 0,
      goldenCowCharmActive: false, // Added for Golden Cow Charm
      jokerCowBlessingActive: false, // Added for Joker Cow Blessing
      antiGravityFieldActive: false, // Added for Anti-Gravity Field
      luckyJamActive: false, // Added for Lucky Jam
    };

    gameEngineRef.current = game;

    const getBackgroundIndex = (wave) => {
      for (let i = 0; i < BACKGROUNDS.length; i++) {
        if (wave >= BACKGROUNDS[i].minWave && wave <= BACKGROUNDS[i].maxWave) {
          return i;
        }
      }
      return BACKGROUNDS.length - 1;
    };

    const spawnCow = () => {
      const margin = 20;
      const side = Math.floor(Math.random() * 4);
      let x, y;

      const baseGoldenChance = 0.08;
      const waveBonus = Math.min(latestGameState.current.wave * 0.01, 0.12);
      let isGolden = Math.random() < (baseGoldenChance + waveBonus);

      if (game.goldenCowBonusSpawnsRemaining > 0) {
        isGolden = true;
        game.goldenCowBonusSpawnsRemaining--;
        updateGameState(prev => ({
          ...prev,
          goldenCowBonusSpawnsRemaining: game.goldenCowBonusSpawnsRemaining
        }));
      }

      switch(side) {
        case 0: x = Math.random() * game.width; y = -margin; break;
        case 1: x = game.width + margin; y = Math.random() * game.height; break;
        case 2: x = Math.random() * game.width; y = game.height + margin; break;
        case 3: x = -margin; y = Math.random() * game.height; break;
      }

      const targetX = 40 + Math.random() * (game.width - 80);
      const targetY = 60 + Math.random() * (game.height - 120);

      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply Golden Cow Charm if active (60% slower golden cows)
      const goldenCowSpeedMultiplier = latestGameState.current.goldenCowCharmActive ? 0.4 : 1.0;
      const speed = isGolden ? (2.2 + Math.random() * 0.8) * goldenCowSpeedMultiplier : (1.0 + Math.random() * 0.6);

      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;

      game.cows.push({
        x, y, vx, vy, targetX, targetY,
        width: 40, height: 45, collected: false,
        bobTimer: Math.random() * 1000, state: 'entering',
        wanderTimer: 0, lifeTime: 0, isGolden: isGolden
      });
    };

    const spawnJokerCow = () => {
      if (game.jokerCow) return;

      const margin = 30;
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch(side) {
        case 0: x = Math.random() * game.width; y = -margin; break;
        case 1: x = game.width + margin; y = Math.random() * game.height; break;
        case 2: x = Math.random() * game.width; y = game.height + margin; break;
        case 3: x = -margin; y = Math.random() * game.height; break;
      }

      const targetX = 50 + Math.random() * (game.width - 100);
      const targetY = 50 + Math.random() * (game.height - 100);

      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const baseSpeed = 4.5;
      
      game.jokerCow = {
        x, y,
        vx: (dx / distance) * baseSpeed,
        vy: (dy / distance) * baseSpeed,
        width: 45,
        height: 55,
        life: 10000,
        maxLife: 10000,
        swirlTimer: 0,
        swirlAngle: 0,
        collected: false,
        wallEscapeTimer: 0
      };
      
      console.log('🌈 JOKER COW SPAWNED! 10 seconds to catch it!');
    };

    const spawnEnemy = () => {
      const side = Math.floor(Math.random() * 4);
      let x, y;

      switch(side) {
        case 0: x = -40; y = Math.random() * (game.height * 0.6); break;
        case 1: x = game.width + 40; y = Math.random() * (game.height * 0.6); break;
        case 2: x = Math.random() * game.width; y = -40; break;
        case 3: x = Math.random() * game.width; y = game.height + 40; break;
      }

      const baseSpeed = 0.6;
      const waveSpeedBonus = Math.min((latestGameState.current.wave - 1) * 0.08, 2.0);
      const finalSpeed = baseSpeed + waveSpeedBonus;

      // Apply Lucky Jam: missiles spawn 1 second later
      const baseShootDelay = Math.max(1500, 3000 - (latestGameState.current.wave * 100));
      const shootDelay = latestGameState.current.luckyJamActive ? baseShootDelay + 1000 : baseShootDelay;

      game.enemies.push({
        x, y, width: 32, height: 32,
        shootTimer: 0,
        shootDelay: shootDelay,
        id: Math.random(),
        speed: finalSpeed
      });
    };

    const spawnPowerup = () => {
      const powerupTypes = ['shield', 'shield', 'double_score', 'double_score', 'golden_cows', 'extra_life', 'milkstorm', 'time_freeze', 'bass_boost'];
      const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
      const x = 30 + Math.random() * (game.width - 60);
      const y = 30 + Math.random() * (game.height - 60);

      game.powerups.push({ x, y, type, size: 25, life: 10000 });
    };

    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
    };

    const updatePlayer = (deltaTime) => {
      const player = game.player;

      if (player.isInvincible) {
        player.invincibleTimer -= deltaTime;
        if (player.invincibleTimer <= 0) {
          player.isInvincible = false;
          player.invincibleTimer = 0;
        }
      }

      if (player.tractorBeamActive) {
        player.tractorBeamTimer -= deltaTime;
        if (player.tractorBeamTimer <= 0) {
          player.tractorBeamActive = false;
          player.tractorBeamTimer = 0;
        }
      }

      if (game.player.isShielded) {
        game.player.shieldTimer -= deltaTime;
        if (game.player.shieldTimer <= 0) {
          game.player.isShielded = false;
          game.player.shieldTimer = 0;
          updateGameState(prev => ({ ...prev, isShielded: false, shieldTimer: 0 }));
          console.log('🛡️ Shield deactivated');
        } else {
          updateGameState(prev => ({ ...prev, shieldTimer: Math.max(0, Math.floor(game.player.shieldTimer)) }));
        }
      }

      if (game.doubleScoreActive) {
        game.doubleScoreTimer -= deltaTime;
        if (game.doubleScoreTimer <= 0) {
          game.doubleScoreActive = false;
          game.doubleScoreTimer = 0;
          updateGameState(prev => ({ ...prev, doubleScoreActive: false, doubleScoreTimer: 0 }));
          console.log('⭐ Double Score deactivated');
        } else {
          updateGameState(prev => ({ ...prev, doubleScoreTimer: Math.max(0, Math.floor(game.doubleScoreTimer)) }));
        }
      }

      if (game.player.isMilkstormActive) {
        game.player.milkstormTimer -= deltaTime;
        if (game.player.milkstormTimer <= 0) {
          game.player.isMilkstormActive = false;
          game.player.milkstormTimer = 0;
          updateGameState(prev => ({ ...prev, isMilkstormActive: false, milkstormTimer: 0 }));
          console.log('🥛 Milkstorm deactivated');
        } else {
          updateGameState(prev => ({ ...prev, milkstormTimer: Math.max(0, Math.floor(game.player.milkstormTimer)) }));
        }
      }

      if (game.isTimeFreezeActive) {
        game.timeFreezeTimer -= deltaTime;
        console.log('⏰ Time Freeze Timer:', game.timeFreezeTimer, 'Active:', game.isTimeFreezeActive);

        if (game.timeFreezeTimer <= 0) {
          game.isTimeFreezeActive = false;
          game.timeFreezeTimer = 0;
          updateGameState(prev => ({ ...prev, isTimeFreezeActive: false, timeFreezeTimer: 0 }));
          console.log('💫 Time Freeze deactivated');
        } else {
          updateGameState(prev => ({ ...prev, timeFreezeTimer: Math.max(0, Math.floor(game.timeFreezeTimer)) }));
        }
      }

      const currentJoystickInput = joystickInputRef.current;
      const currentUser = userRef.current;
      const isKeyboardMoving = game.keys['w'] || game.keys['s'] || game.keys['a'] || game.keys['d'] ||
                                game.keys['arrowup'] || game.keys['arrowdown'] || game.keys['arrowleft'] || game.keys['arrowright'];
      const isJoystickMoving = currentJoystickInput && (Math.abs(currentJoystickInput.x) > 0.1 || Math.abs(currentJoystickInput.y) > 0.1);
      const isDirectTouchMoving = currentUser?.controlMethod === 'direct_touch' && game.directTouchActive;

      const isMovingThisFrame = isKeyboardMoving || isJoystickMoving || isDirectTouchMoving;

      if (player.wasMovingLastFrame && !isMovingThisFrame && latestGameState.current.counterAttackReady) {
        if (onTriggerCounterAttack) {
          onTriggerCounterAttack();
        }
      }

      if (latestGameState.current.triggerCounterAttack && !game.counterAttackBlast.active) {
        const scoreMultiplier = game.doubleScoreActive ? 2 : 1;
        let tanksDestroyed = 0;

        game.enemies = game.enemies.filter(enemy => {
          const dx = enemy.x - player.x;
          const dy = enemy.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < game.counterAttackBlast.maxRadius) {
            tanksDestroyed++;
            for (let j = 0; j < 8; j++) {
              game.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 600,
                maxLife: 600,
                color: j % 2 === 0 ? '#FF4444' : '#FF8800'
              });
            }
            return false;
          }
          return true;
        });

        game.missiles = game.missiles.filter(missile => {
          const dx = missile.x - player.x;
          const dy = missile.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < game.counterAttackBlast.maxRadius) {
            for (let j = 0; j < 4; j++) {
              game.particles.push({
                x: missile.x,
                y: missile.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 300,
                maxLife: 300,
                color: '#FFFFFF'
              });
            }
            return false;
          }
          return true;
        });

        if (tanksDestroyed > 0) {
          updateGameState(prev => ({
            ...prev,
            score: prev.score + (100 * tanksDestroyed * scoreMultiplier),
            tanksDestroyed: prev.tanksDestroyed + tanksDestroyed
          }));
        }

        if (onResetCounterAttackTrigger) {
          onResetCounterAttackTrigger();
        }

        game.counterAttackBlast.active = true;
        game.counterAttackBlast.timer = 0;
      }

      player.wasMovingLastFrame = isMovingThisFrame;

      if (game.keys['w'] || game.keys['arrowup']) player.y -= player.speed;
      if (game.keys['s'] || game.keys['arrowdown']) player.y += player.speed;
      if (game.keys['a'] || game.keys['arrowleft']) player.x -= player.speed;
      if (game.keys['d'] || game.keys['arrowright']) player.x += player.speed;

      if (currentUser?.controlMethod === 'direct_touch' && game.directTouchActive) {
        const dx = game.lastTouchX - player.x;
        const dy = game.lastTouchY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          const moveSpeed = Math.min(player.speed, distance * 0.15);
          player.x += (dx / distance) * moveSpeed;
          player.y += (dy / distance) * moveSpeed;
        }
      } else {
        if (currentJoystickInput && (Math.abs(currentJoystickInput.x) > 0.1 || Math.abs(currentJoystickInput.y) > 0.1)) {
          player.x += currentJoystickInput.x * player.speed;
          player.y += currentJoystickInput.y * player.speed;
        }
      }

      player.x = Math.max(25, Math.min(game.width - 25, player.x));
      player.y = Math.max(25, Math.min(game.height - 25, player.y));
    };

    const updateCows = (deltaTime) => {
      game.cows = game.cows.filter(cow => {
        if (cow.collected) return false;

        cow.bobTimer += deltaTime;
        cow.lifeTime += deltaTime;
        cow.wanderTimer += deltaTime;

        const speedMultiplier = game.isTimeFreezeActive ? 0.3 : 1;

        if (cow.state === 'entering') {
          const dx = cow.targetX - cow.x;
          const dy = cow.targetY - cow.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 10) {
            cow.x += cow.vx * speedMultiplier;
            cow.y += cow.vy * speedMultiplier;
          } else {
            cow.state = 'wandering';
            cow.wanderTimer = 0;
          }
        } else if (cow.state === 'wandering') {
          if (cow.wanderTimer > 3000 + Math.random() * 2000) {
            if (Math.random() < 0.3 && cow.lifeTime > 8000) {
              const exitSide = Math.floor(Math.random() * 4);
              switch(exitSide) {
                case 0: cow.targetX = Math.random() * game.width; cow.targetY = -50; break;
                case 1: cow.targetX = game.width + 50; cow.targetY = Math.random() * game.height; break;
                case 2: cow.targetX = Math.random() * game.width; cow.targetY = game.height + 50; break;
                case 3: cow.targetX = -50; cow.targetY = Math.random() * game.height; break;
              }
              cow.state = 'leaving';
            } else {
              cow.targetX = 40 + Math.random() * (game.width - 80);
              cow.targetY = 40 + Math.random() * (game.height - 80);
            }

            const dx = cow.targetX - cow.x;
            const dy = cow.targetY - cow.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply Golden Cow Charm if active (60% slower golden cows)
            const goldenCowSpeedMultiplier = latestGameState.current.goldenCowCharmActive ? 0.4 : 1.0;
            const speed = cow.isGolden ? (1.8 + Math.random() * 0.8) * goldenCowSpeedMultiplier : (0.4 + Math.random() * 0.4);

            cow.vx = (dx / distance) * speed;
            cow.vy = (dy / distance) * speed;
            cow.wanderTimer = 0;
          }

          cow.x += cow.vx * speedMultiplier;
          cow.y += cow.vy * speedMultiplier;
        } else if (cow.state === 'leaving') {
          cow.x += cow.vx * speedMultiplier;
          cow.y += cow.vy * speedMultiplier;
        }

        const dx = cow.x - game.player.x;
        const dy = cow.y - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < game.player.lightBeamSize / 2) {
          cow.collected = true;

          game.player.tractorBeamActive = true;
          game.player.tractorBeamTimer = 200;

          const points = cow.isGolden ? 800 : 250;
          let milkValue = cow.isGolden ? 5 : 1;

          const currentShip = equippedSpaceshipRef.current;
          if (currentShip && currentShip.milk_bonus) {
            milkValue = Math.floor(milkValue * currentShip.milk_bonus);
          }

          if (latestGameState.current.doubleMilkActive) {
            milkValue *= 2;
          }

          const scoreMultiplier = game.doubleScoreActive ? 2 : 1;

          const newCowStreakCount = latestGameState.current.cowStreakCount + 1;
          const counterAttackReady = newCowStreakCount >= 10;

          updateGameState(prev => ({
            ...prev,
            score: prev.score + (points * scoreMultiplier),
            cowsCollected: prev.cowsCollected + 1,
            milkEarnedThisRun: prev.milkEarnedThisRun + milkValue,
            cowStreakCount: newCowStreakCount,
            counterAttackReady: counterAttackReady
          }));

          const particleColor = cow.isGolden ? '#FFD700' : '#FFFFFF';
          for (let i = 0; i < (cow.isGolden ? 10 : 6); i++) {
            game.particles.push({
              x: cow.x,
              y: cow.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              life: cow.isGolden ? 700 : 400,
              maxLife: cow.isGolden ? 700 : 400,
              color: particleColor
            });
          }

          return false;
        }

        return cow.x > -80 && cow.x < game.width + 80 &&
               cow.y > -80 && cow.y < game.height + 80;
      });
    };

    const updateJokerCow = (deltaTime) => {
      if (!game.jokerCow) return;

      const joker = game.jokerCow;
      const baseSpeed = 4.5;
      
      joker.life -= deltaTime;
      if (joker.life <= 0) {
        game.jokerCow = null;
        console.log('🌈 JOKER COW ESCAPED!');
        return;
      }

      joker.swirlTimer += deltaTime;
      joker.swirlAngle += deltaTime * 0.002;

      const speedMultiplier = game.isTimeFreezeActive ? 0.5 : 1;
      
      if (joker.wallEscapeTimer === undefined) {
        joker.wallEscapeTimer = 0;
      }
      
      if (joker.wallEscapeTimer > 0) {
        joker.wallEscapeTimer -= deltaTime;
      }
      
      if (joker.wallEscapeTimer <= 0) {
        const dx = joker.x - game.player.x;
        const dy = joker.y - game.player.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        const detectionRange = 180;
        if (distanceToPlayer < detectionRange && distanceToPlayer > 0) {
          const fleeStrength = 0.15;
          const fleeForceX = (dx / distanceToPlayer) * fleeStrength;
          const fleeForceY = (dy / distanceToPlayer) * fleeStrength;
          
          joker.vx += fleeForceX;
          joker.vy += fleeForceY;
        }
        
        if (Math.random() < 0.02) {
          const angle = Math.random() * Math.PI * 2;
          joker.vx = Math.cos(angle) * baseSpeed;
          joker.vy = Math.sin(angle) * baseSpeed;
        }
      }
      
      const currentSpeed = Math.sqrt(joker.vx * joker.vx + joker.vy * joker.vy);
      const maxSpeed = joker.wallEscapeTimer > 0 ? baseSpeed * 1.5 : baseSpeed * 1.3;
      if (currentSpeed > maxSpeed) {
        joker.vx = (joker.vx / currentSpeed) * maxSpeed;
        joker.vy = (joker.vy / currentSpeed) * maxSpeed;
      }
      
      joker.x += joker.vx * speedMultiplier;
      joker.y += joker.vy * speedMultiplier;

      const swirlRadius = 8;
      joker.x += Math.cos(joker.swirlAngle) * swirlRadius * speedMultiplier * 0.1;
      joker.y += Math.sin(joker.swirlAngle) * swirlRadius * speedMultiplier * 0.1;

      const wallMargin = 35;
      const minBounceSpeed = baseSpeed * 1.2;
      const wallEscapeDuration = 500;
      
      if (joker.x < wallMargin) {
        joker.x = wallMargin + 5;
        joker.vx = Math.max(minBounceSpeed, Math.abs(joker.vx));
        joker.wallEscapeTimer = wallEscapeDuration;
      } else if (joker.x > game.width - wallMargin) {
        joker.x = game.width - wallMargin - 5;
        joker.vx = -Math.max(minBounceSpeed, Math.abs(joker.vx));
        joker.wallEscapeTimer = wallEscapeDuration;
      }
      
      if (joker.y < wallMargin) {
        joker.y = wallMargin + 5;
        joker.vy = Math.max(minBounceSpeed, Math.abs(joker.vy));
        joker.wallEscapeTimer = wallEscapeDuration;
      } else if (joker.y > game.height - wallMargin) {
        joker.y = game.height - wallMargin - 5;
        joker.vy = -Math.max(minBounceSpeed, Math.abs(joker.vy));
        joker.wallEscapeTimer = wallEscapeDuration;
      }

      const distanceForCollection = Math.sqrt(
        (joker.x - game.player.x) * (joker.x - game.player.x) + 
        (joker.y - game.player.y) * (joker.y - game.player.y)
      );
      
      if (distanceForCollection < game.player.lightBeamSize / 2) {
        joker.collected = true;
        
        game.player.tractorBeamActive = true;
        game.player.tractorBeamTimer = 300;

        const points = 25000;
        let milkValue = 50;
        
        const currentShip = equippedSpaceshipRef.current;
        if (currentShip && currentShip.milk_bonus) {
          milkValue = Math.floor(milkValue * currentShip.milk_bonus);
        }
        
        if (latestGameState.current.doubleMilkActive) {
          milkValue *= 2;
        }
        
        const scoreMultiplier = game.doubleScoreActive ? 2 : 1;
        
        updateGameState(prev => ({
          ...prev,
          score: prev.score + (points * scoreMultiplier),
          cowsCollected: prev.cowsCollected + 1,
          milkEarnedThisRun: prev.milkEarnedThisRun + milkValue
        }));
        
        const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        for (let i = 0; i < 20; i++) {
          game.particles.push({
            x: joker.x,
            y: joker.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1000,
            maxLife: 1000,
            color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)]
          });
        }
        
        game.jokerCow = null;
        console.log('🌈 JOKER COW COLLECTED! +25,000 points!');
      }
    };

    const updateEnemies = (deltaTime) => {
      if (game.isTimeFreezeActive) return;

      game.enemies.forEach(enemy => {
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }

        enemy.shootTimer += deltaTime;
        if (enemy.shootTimer > enemy.shootDelay) {
          enemy.shootTimer = 0;

          const baseMissileLife = 10000; // Original missile life
          // Apply Lucky Jam: missiles last 2 seconds less
          const missileLife = latestGameState.current.luckyJamActive ? baseMissileLife - 2000 : baseMissileLife;

          game.missiles.push({
            x: enemy.x,
            y: enemy.y,
            width: 7,
            height: 7,
            vx: 0,
            vy: 0,
            speed: 1.8 + (latestGameState.current.wave - 1) * 0.2,
            life: missileLife,
            homingStrength: 0.10 + (latestGameState.current.wave - 1) * 0.015,
            color: '#FF0000',
            spawnTime: Date.now(),
            sourceTankId: enemy.id
          });
        }
      });

      if (game.player.isMilkstormActive) {
        const vortexRadius = 120;
        game.enemies = game.enemies.filter(enemy => {
          const dx = game.player.x - enemy.x;
          const dy = game.player.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < vortexRadius) {
            const pullStrength = 0.3;
            enemy.x += (dx / distance) * pullStrength * deltaTime * 0.1;
            enemy.y += (dy / distance) * pullStrength * deltaTime * 0.1;

            if (distance < 40) {
              const scoreMultiplier = game.doubleScoreActive ? 2 : 1;
              updateGameState(prev => ({
                ...prev,
                score: prev.score + (100 * scoreMultiplier),
                tanksDestroyed: prev.tanksDestroyed + 1
              }));

              for (let j = 0; j < 8; j++) {
                game.particles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  life: 600,
                  maxLife: 600,
                  color: j % 2 === 0 ? '#FF4444' : '#FF8800'
                });
              }

              return false;
            }
          }
          return true;
        });
      }
    };

    const updateMissiles = (deltaTime) => {
      if (game.isTimeFreezeActive) return;

      const newMissiles = [];
      const currentMissilesCount = game.missiles.length;

      for (let i = 0; i < currentMissilesCount; i++) {
        const missile = game.missiles[i];

        missile.life -= deltaTime;
        if (missile.life <= 0) continue;

        const isInGracePeriod = (Date.now() - missile.spawnTime) < 1500;

        if (game.player.isMilkstormActive) {
          const vortexRadius = 120;
          const dx = game.player.x - missile.x;
          const dy = game.player.y - missile.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < vortexRadius) {
            const pullStrength = 0.5;
            missile.vx += (dx / distance) * pullStrength;
            missile.vy += (dy / distance) * pullStrength;
            if (distance < 35) {
              for (let k = 0; k < 4; k++) game.particles.push({ x: missile.x, y: missile.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 300, maxLife: 300, color: '#FFFFFF' });
              continue;
            }
          }
        }

        const dxPlayer = game.player.x - missile.x;
        const dyPlayer = game.player.y - missile.y;
        const distanceToPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
        if (distanceToPlayer > 0) {
          const baseHoming = 0.10;
          const waveHomingBonus = Math.min((latestGameState.current.wave - 1) * 0.015, 0.08);
          
          // Apply Anti-Gravity Field if active (50% reduced homing)
          const antiGravityMultiplier = latestGameState.current.antiGravityFieldActive ? 0.5 : 1.0;
          const finalHoming = (baseHoming + waveHomingBonus) * antiGravityMultiplier;
          
          missile.vx += (dxPlayer / distanceToPlayer) * finalHoming;
          missile.vy += (dyPlayer / distanceToPlayer) * finalHoming;
        }

        const baseMaxSpeed = 1.8;
        const waveSpeedBonus = Math.min((latestGameState.current.wave - 1) * 0.15, 1.2);
        
        // Apply Anti-Gravity Field if active (30% slower missiles)
        const antiGravitySpeedMultiplier = latestGameState.current.antiGravityFieldActive ? 0.7 : 1.0;
        const finalMaxSpeed = (baseMaxSpeed + waveSpeedBonus) * antiGravitySpeedMultiplier;

        const currentSpeed = Math.sqrt(missile.vx * missile.vx + missile.vy * missile.vy);
        if (currentSpeed > finalMaxSpeed) {
          missile.vx = (missile.vx / currentSpeed) * finalMaxSpeed;
          missile.vy = (missile.vy / currentSpeed) * finalMaxSpeed;
        }

        missile.x += missile.vx;
        missile.y += missile.vy;

        let destroyed = false;

        if (!isInGracePeriod) {
          for (let k = game.enemies.length - 1; k >= 0; k--) {
            const enemy = game.enemies[k];
            const enemyDx = missile.x - enemy.x;
            const enemyDy = missile.y - enemy.y;
            const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
            if (enemyDistance < 25) {
              game.enemies.splice(k, 1);
              const scoreMultiplier = game.doubleScoreActive ? 2 : 1;
              updateGameState(prev => ({ ...prev, score: prev.score + (100 * scoreMultiplier), tanksDestroyed: prev.tanksDestroyed + 1 }));
              for (let l = 0; l < 8; l++) game.particles.push({ x: enemy.x, y: enemy.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 600, maxLife: 600, color: l % 2 === 0 ? '#FF4444' : '#FF8800' });
              destroyed = true;
              break;
            }
          }
        }
        if (destroyed) continue;

        for (let k = game.cows.length - 1; k >= 0; k--) {
          const cow = game.cows[k];
          if (cow.collected) continue;
          const cowDx = missile.x - cow.x;
          const cowDy = missile.y - cow.y;
          const cowDistance = Math.sqrt(cowDx * cowDx + cowDy * cowDy);
          if (cowDistance < 22) {
            game.cows.splice(k, 1);
            for (let l = 0; l < 4; l++) game.particles.push({ x: cow.x, y: cow.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 400, maxLife: 400, color: '#8B4513' });
            destroyed = true;
            break;
          }
        }
        if (destroyed) continue;

        if (game.jokerCow && !game.jokerCow.collected) {
          const joker = game.jokerCow;
          const jokerDx = missile.x - joker.x;
          const jokerDy = missile.y - joker.y;
          const jokerDistance = Math.sqrt(jokerDx * jokerDx + jokerDy * jokerDy);
          if (jokerDistance < 28) {
            const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#9400D3'];
            for (let l = 0; l < 8; l++) game.particles.push({ x: missile.x, y: missile.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 500, maxLife: 500, color: rainbowColors[l % rainbowColors.length] });
            console.log('🌈 Missile exploded on Joker Cow - but it\'s invulnerable!');
            destroyed = true;
          }
        }
        if (destroyed) continue;

        if (distanceToPlayer < 25) {
          if (game.player.isShielded) {
            game.player.isShielded = false;
            game.player.shieldTimer = 0;
            updateGameState(prev => ({ ...prev, isShielded: false, shieldTimer: 0 }));
            for (let k = 0; k < 6; k++) game.particles.push({ x: missile.x, y: missile.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 400, maxLife: 400, color: '#4C6EF5' });
            destroyed = true;
          } else if (!game.player.isInvincible) {
            const newLives = latestGameState.current.lives - 1;
            
            // Check for St Suzzy revive mechanic
            const currentShip = equippedSpaceshipRef.current;
            const canRevive = currentShip?.revive_on_death && !hasRevivedThisRunRef.current && newLives <= 0;
            
            if (canRevive) {
              // Trigger revive: lose half milk, set lives to 1, become invincible temporarily
              const milkLost = Math.floor(latestGameState.current.milkEarnedThisRun / 2);
              const remainingMilk = latestGameState.current.milkEarnedThisRun - milkLost;
              
              console.log('💫 ST SUZZY REVIVE! Lost', milkLost, 'milk, remaining:', remainingMilk);
              
              updateGameState(prev => ({ 
                ...prev, 
                lives: 1,
                milkEarnedThisRun: remainingMilk,
                isGameOver: false,
                cowStreakCount: 0, 
                counterAttackReady: false 
              }));
              
              if (onReviveRef.current) {
                onReviveRef.current(milkLost);
              }
              
              game.player.isInvincible = true;
              game.player.invincibleTimer = 3000; // 3 seconds of invincibility after revive
              
              // Visual feedback particles
              for (let k = 0; k < 20; k++) {
                game.particles.push({
                  x: game.player.x,
                  y: game.player.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 800,
                  maxLife: 800,
                  color: k % 2 === 0 ? '#FFD700' : '#FFA500'
                });
              }
            } else {
              // Normal death
              updateGameState(prev => ({ ...prev, lives: newLives, isGameOver: newLives <= 0, cowStreakCount: 0, counterAttackReady: false }));
              game.player.isInvincible = true;
              game.player.invincibleTimer = DEFAULT_INVINCIBLE_DURATION + ((currentShip?.invincibility_duration_bonus || 0) * 1000);
            }
            
            for (let k = 0; k < 6; k++) game.particles.push({ x: missile.x, y: missile.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 400, maxLife: 400, color: '#FF4444' });
            destroyed = true;
          }
        }
        if (destroyed) continue;

        newMissiles.push(missile);
      }

      game.missiles = [];
      const finalMissilesToRemove = new Set();

      for (let i = 0; i < newMissiles.length; i++) {
        if (finalMissilesToRemove.has(i)) continue;
        
        const missile1 = newMissiles[i];
        
        for (let j = i + 1; j < newMissiles.length; j++) {
          if (finalMissilesToRemove.has(j)) continue;
          
          const missile2 = newMissiles[j];
          
          const dx = missile1.x - missile2.x;
          const dy = missile1.y - missile2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 18) {
            finalMissilesToRemove.add(i);
            finalMissilesToRemove.add(j);
            
            const collisionX = (missile1.x + missile2.x) / 2;
            const collisionY = (missile1.y + missile2.y) / 2;
            
            for (let k = 0; k < 10; k++) {
              game.particles.push({
                x: collisionX,
                y: collisionY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 500,
                maxLife: 500,
                color: k % 3 === 0 ? '#FF0000' : k % 3 === 1 ? '#FF8800' : '#FFFF00'
              });
            }
            break; 
          }
        }
      }

      for (let i = 0; i < newMissiles.length; i++) {
        if (!finalMissilesToRemove.has(i)) {
          const missile = newMissiles[i];
          if (missile.x > -40 && missile.x < game.width + 40 && missile.y > -40 && missile.y < game.height + 40) {
            game.missiles.push(missile);
          }
        }
      }
    };

    const updateParticles = (deltaTime) => {
      game.particles = game.particles.filter(particle => {
        particle.life -= deltaTime;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.08;

        return particle.life > 0;
      });
    };

    const updatePowerups = (deltaTime) => {
      game.powerups = game.powerups.filter(p => {
        p.life -= deltaTime;
        if (p.life <= 0) return false;

        const dx = p.x - game.player.x;
        const dy = p.y - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (p.size / 2 + game.player.width / 3)) {
          const currentShip = equippedSpaceshipRef.current;

          switch (p.type) {
            case 'shield':
              game.player.isShielded = true;
              game.player.shieldTimer = DEFAULT_SHIELD_DURATION + ((currentShip?.shield_duration_bonus || 0) * 1000);
              updateGameState(prev => ({ ...prev, isShielded: true, shieldTimer: game.player.shieldTimer }));
              console.log('🛡️ Shield activated for', game.player.shieldTimer, 'ms');
              break;
            case 'double_score':
              game.doubleScoreActive = true;
              game.doubleScoreTimer = 10000;
              updateGameState(prev => ({ ...prev, doubleScoreActive: true, doubleScoreTimer: 10000 }));
              console.log('⭐ Double Score activated for 10000ms');
              break;
            case 'golden_cows':
              game.goldenCowBonusSpawnsRemaining += 5;
              updateGameState(prev => ({ ...prev, goldenCowBonusSpawnsRemaining: game.goldenCowBonusSpawnsRemaining }));
              console.log('🐄✨ Golden Cow Bonus: 5 golden cows incoming');
              break;
            case 'extra_life':
              const maxLives = 5;
              if (latestGameState.current.lives < maxLives) {
                updateGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
                console.log('❤️ Extra Life gained');
              }
              break;
            case 'milkstorm':
              game.player.isMilkstormActive = true;
              game.player.milkstormTimer = 5000;
              updateGameState(prev => ({ ...prev, isMilkstormActive: true, milkstormTimer: 5000 }));
              console.log('🥛 Milkstorm activated for 5000ms');
              break;
            case 'time_freeze':
              game.isTimeFreezeActive = true;
              game.timeFreezeTimer = 6000;
              updateGameState(prev => ({ ...prev, isTimeFreezeActive: true, timeFreezeTimer: 6000 }));
              console.log('💫 Time Freeze activated for 6000ms');
              break;
            case 'bass_boost':
              const tanksDestroyed = game.enemies.length;
              const scoreMultiplier = game.doubleScoreActive ? 2 : 1;

              game.enemies.forEach(enemy => {
                for (let j = 0; j < 8; j++) {
                  game.particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 600,
                    maxLife: 600,
                    color: j % 2 === 0 ? '#FF4444' : '#FF8800'
                  });
                }
              });

              game.missiles.forEach(missile => {
                for (let i = 0; i < 4; i++) {
                  game.particles.push({
                    x: missile.x,
                    y: missile.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    life: 300,
                    maxLife: 300,
                    color: '#FFFFFF'
                  });
                }
              });

              game.enemies.length = 0;
              game.missiles.length = 0;

              if (tanksDestroyed > 0) {
                updateGameState(prev => ({
                  ...prev,
                  score: prev.score + (100 * tanksDestroyed * scoreMultiplier),
                  tanksDestroyed: prev.tanksDestroyed + tanksDestroyed
                }));
              }

              game.empBlast.active = true;
              game.empBlast.timer = 0;
              console.log('⚡ EMP Blast activated, destroyed', tanksDestroyed, 'tanks');
              break;
            default: break;
          }
          return false;
        }
        return true;
      });
    };

    const updateEmpBlast = (deltaTime) => {
      if (game.empBlast.active) {
        game.empBlast.timer += deltaTime;
        if (game.empBlast.timer >= game.empBlast.maxDuration) {
          game.empBlast.active = false;
          game.empBlast.timer = 0;
        }
      }
    };

    const updateCounterAttackBlast = (deltaTime) => {
      if (game.counterAttackBlast.active) {
        game.counterAttackBlast.timer += deltaTime;
        if (game.counterAttackBlast.timer >= game.counterAttackBlast.maxDuration) {
          game.counterAttackBlast.active = false;
          game.counterAttackBlast.timer = 0;
        }
      }
    };

    const updateBackgroundTransition = (deltaTime) => {
      if (!game.backgroundTransition.active) return;

      game.backgroundTransition.flickerTimer += deltaTime;

      if (game.backgroundTransition.flickerTimer >= game.backgroundTransition.flickerInterval) {
        game.backgroundTransition.flickerTimer = 0;
        game.backgroundTransition.showOld = !game.backgroundTransition.showOld;
        game.backgroundTransition.flickersRemaining--;

        if (game.backgroundTransition.flickersRemaining <= 0) {
          game.backgroundTransition.active = false;
          game.currentBackgroundIndex = game.backgroundTransition.newBgIndex;
        }
      }
    };

    const drawBackground = () => {
      let bgIndex = game.currentBackgroundIndex;

      if (game.backgroundTransition.active) {
        bgIndex = game.backgroundTransition.showOld
          ? game.backgroundTransition.oldBgIndex
          : game.backgroundTransition.newBgIndex;
      }

      if (imagesLoaded.current.backgrounds[bgIndex] && backgroundImagesRef.current[bgIndex]) {
        ctx.drawImage(backgroundImagesRef.current[bgIndex], 0, 0, game.width, game.height);
      } else {
        // Fallback to a default gradient if the image is somehow not loaded or failed and fallback not set
        const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#228B22');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, game.width, game.height);
      }
    };

    const drawPlayer = () => {
      if (game.player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        return;
      }

      ctx.save();
      ctx.translate(game.player.x, game.player.y);

      if (game.player.isMilkstormActive) {
        const vortexRadius = 120;
        const time = Date.now() * 0.003;

        for (let i = 0; i < 3; i++) {
          const angle = time + (i * Math.PI * 2 / 3);
          const r = vortexRadius * (0.7 + Math.sin(time + i) * 0.3);

          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < 8; i++) {
          const angle = time * 2 + (i * Math.PI * 2 / 8);
          const r = vortexRadius * 0.8;

          ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(time * 5 + i) * 0.5})`;
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (game.player.isShielded) {
        const shieldRadius = game.player.width / 2 + 10;
        const shieldOpacity = Math.max(0.2, Math.min(1, game.player.shieldTimer / DEFAULT_SHIELD_DURATION));
        ctx.fillStyle = `rgba(59, 130, 246, ${shieldOpacity * 0.4})`;
        ctx.strokeStyle = `rgba(147, 197, 253, ${shieldOpacity * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      const allImagesLoaded = imagesLoaded.current.playerFlying && imagesLoaded.current.playerTractor;

      if (allImagesLoaded) {
        const isTractorActive = game.player.tractorBeamActive;
        const flyingImage = playerFlyingImageRef.current;
        const tractorImage = playerTractorImageRef.current;

        const imageToDraw = isTractorActive ? tractorImage : flyingImage;

        const aspectRatio = imageToDraw.naturalHeight / imageToDraw.naturalWidth;
        const targetHeight = game.player.width * aspectRatio;

        ctx.drawImage(
          imageToDraw,
          -game.player.width / 2,
          -targetHeight / 2,
          game.player.width,
          targetHeight
        );
      }
      else {
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(0, -8, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawCows = () => {
      game.cows.forEach(cow => {
        const bob = Math.sin(cow.bobTimer * 0.003) * 1.5;

        ctx.save();
        ctx.translate(cow.x, cow.y + bob);

        const angle = Math.atan2(cow.vy, cow.vx) + Math.PI / 2;
        ctx.rotate(angle);

        const imageToDraw = cow.isGolden ? goldenCowImageRef.current : cowImageRef.current;
        const isCowImageLoaded = cow.isGolden ? imagesLoaded.current.goldenCow : imagesLoaded.current.cow;

        if (isCowImageLoaded && imageToDraw) {
          if (cow.isGolden) {
             ctx.shadowColor = '#FFD700';
             ctx.shadowBlur = 8;
          }
          ctx.drawImage(imageToDraw, -cow.width/2, -cow.height/2, cow.width, cow.height);
          if (cow.isGolden) {
            ctx.shadowBlur = 0;
          }
        } else {
          // Fallback to drawing a placeholder shape if image not loaded
          if (cow.isGolden) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 8;
          }
          ctx.fillStyle = cow.isGolden ? '#FFD700' : '#FFFFFF';
          ctx.fillRect(-cow.width/2, -cow.height/2, cow.width, cow.height);
          if (cow.isGolden) {
            ctx.shadowBlur = 0;
          }
          ctx.fillStyle = cow.isGolden ? '#DAA520' : '#000000';
          ctx.beginPath();
          ctx.arc(-6, -4, 3, 0, Math.PI * 2);
          ctx.arc(5, 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (game.jokerCow) {
        const joker = game.jokerCow;
        const bob = Math.sin(Date.now() * 0.008) * 2;

        ctx.save();
        ctx.translate(joker.x, joker.y + bob);

        if (imagesLoaded.current.jokerCow && jokerCowImageRef.current) {
          const time = Date.now() * 0.005;
          const glowIntensity = 0.4 + Math.sin(time) * 0.1;

          const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
          for (let i = 0; i < rainbowColors.length; i++) {
            ctx.shadowColor = rainbowColors[i];
            ctx.shadowBlur = 8 * glowIntensity;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(0, 0, joker.width/2 + 5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FFFFFF';
          ctx.globalAlpha = 1;

          for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.2 / i;
            const trailX = -joker.vx * i * 2;
            const trailY = -joker.vy * i * 2;
            ctx.drawImage(
              jokerCowImageRef.current,
              trailX - joker.width/2,
              trailY - joker.height/2,
              joker.width,
              joker.height
            );
          }

          ctx.globalAlpha = 1;

          const angle = Math.atan2(joker.vy, joker.vx) + Math.PI / 2;
          ctx.rotate(angle);
          ctx.drawImage(
            jokerCowImageRef.current,
            -joker.width/2,
            -joker.height/2,
            joker.width,
            joker.height
          );

          ctx.shadowBlur = 0;
        } else {
          // Placeholder for joker cow if image not loaded
          ctx.fillStyle = '#00FF00'; // Green for Joker cow fallback
          ctx.fillRect(-joker.width/2, -joker.height/2, joker.width, joker.height);
        }
        ctx.restore();
      }
    };

    const drawEnemies = () => {
      game.enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x) + Math.PI / 2;
        
        // Check if we need to flip the tank 180 degrees for certain skins
        const currentTankSkin = equippedTankSkinRef.current;
        const needsFlip = currentTankSkin && (
          currentTankSkin.skin_id === 'glazed_threat' || 
          currentTankSkin.skin_id === 'royal_heartbreak' ||
          currentTankSkin.skin_id === 'the_last_note' ||
          currentTankSkin.skin_id === 'moofasa' ||
          currentTankSkin.skin_id === 'lava_puppy' ||
          currentTankSkin.skin_id === 'no_more_moos'
        );
        
        const finalAngle = needsFlip ? angle + Math.PI : angle;
        ctx.rotate(finalAngle);

        if (imagesLoaded.current.tank && tankImageRef.current) {
          // Default tank size: 50x50 pixels
          // Increase size for "no_more_moos" to better match missile style
          const tankSize = currentTankSkin?.skin_id === 'no_more_moos' ? 75 : 50;
          ctx.drawImage(
            tankImageRef.current,
            -tankSize/2,
            -tankSize/2,
            tankSize,
            tankSize
          );
        } else {
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);

          ctx.fillStyle = '#991B1C';
          ctx.fillRect(0, -2, 20, 4);

          ctx.fillStyle = '#B91C1C';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    };

    const drawMissiles = () => {
      game.missiles.forEach(missile => {
        ctx.save();
        ctx.translate(missile.x, missile.y);

        if (imagesLoaded.current.missile && missileImageRef.current) {
          const angle = Math.atan2(missile.vy, missile.vx) + Math.PI / 2;
          ctx.rotate(angle);

          // Slightly increased missile size: 26x38 pixels for all missiles
          const missileWidth = 26;
          const missileHeight = 38;
          ctx.drawImage(
            missileImageRef.current,
            -missileWidth/2,
            -missileHeight/2,
            missileWidth,
            missileHeight
          );
        } else {
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 6;

          ctx.fillStyle = '#FF0000';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });
    };

    const drawParticles = () => {
      game.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawPowerups = () => {
      game.powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);

        const fadeAlpha = p.life < 1000 ? p.life / 1000 : 1;
        ctx.globalAlpha = fadeAlpha;

        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);

        switch (p.type) {
          case 'shield':
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.strokeStyle = '#93C5FD';
            break;
          case 'double_score':
            ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
            ctx.strokeStyle = '#FCD34D';
            break;
          case 'golden_cows':
            ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
            ctx.strokeStyle = '#FDE68A';
            break;
          case 'extra_life':
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.strokeStyle = '#FCA5A5';
            break;
          case 'milkstorm':
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#E0F2FE';
            break;
          case 'time_freeze':
            ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
            ctx.strokeStyle = '#DDD6FE';
            break;
          case 'bass_boost':
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.strokeStyle = '#93C5FD';
            break;
          default:
            ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
            ctx.strokeStyle = '#D8B4FE';
        }
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px sans-serif';

        switch (p.type) {
          case 'shield': ctx.fillText('🛡️', 0, 0); break;
          case 'double_score': ctx.fillText('2x', 0, 0); break;
          case 'golden_cows': ctx.fillText('🐄', 0, 0); break;
          case 'extra_life': ctx.fillText('❤️', 0, 0); break;
          case 'milkstorm': ctx.fillText('🥛', 0, 0); break;
          case 'time_freeze': ctx.fillText('💫', 0, 0); break;
          case 'bass_boost': ctx.fillText('⚡', 0, 0); break;
        }

        ctx.globalAlpha = 1.0;
        ctx.restore();
      });
    };

    const drawEmpBlast = () => {
      if (!game.empBlast.active) return;
      
      const progress = game.empBlast.timer / game.empBlast.maxDuration;
      const radius = game.empBlast.maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.translate(game.player.x, game.player.y);

      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.8})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2 / 12) + progress * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const flashRadius = 30 * (1 - progress);
      const flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flashRadius);
      flashGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
      flashGradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
      ctx.fillStyle = flashGradient;
      ctx.beginPath();
      ctx.arc(0, 0, flashRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCounterAttackBlast = () => {
      if (!game.counterAttackBlast.active) return;
      
      const progress = game.counterAttackBlast.timer / game.counterAttackBlast.maxDuration;
      const radius = game.counterAttackBlast.maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.translate(game.player.x, game.player.y);

      // Outer white ring (bright milk color)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Middle creamy white ring
      ctx.strokeStyle = `rgba(248, 250, 252, ${alpha * 0.9})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Inner milk white ring
      ctx.strokeStyle = `rgba(241, 245, 249, ${alpha * 0.85})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling milk particles (white milk droplets)
      const numSwirls = 16;
      for (let i = 0; i < numSwirls; i++) {
        const angle = (i * Math.PI * 2 / numSwirls) + progress * 6;
        const particleRadius = radius * (0.9 + Math.sin(progress * 10 + i) * 0.1);
        const x = Math.cos(angle) * particleRadius;
        const y = Math.sin(angle) * particleRadius;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Central milk explosion glow
      const glowRadius = 40 * (1 - progress);
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      glowGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      glowGradient.addColorStop(0.5, `rgba(248, 250, 252, ${alpha * 0.8})`);
      glowGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Spiral milk streams (flowing white milk)
      for (let i = 0; i < 8; i++) {
        const spiralAngle = (i * Math.PI * 2 / 8) + progress * 10;
        const spiralRadius = radius * 0.6;
        const x1 = Math.cos(spiralAngle) * spiralRadius * 0.3;
        const y1 = Math.sin(spiralAngle) * spiralRadius * 0.3;
        const x2 = Math.cos(spiralAngle) * spiralRadius;
        const y2 = Math.sin(spiralAngle) * spiralRadius; 
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Add extra milk splash particles around the edges
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2 / 12) + progress * 4;
        const splashRadius = radius * 0.95;
        const x = Math.cos(angle) * splashRadius;
        const y = Math.sin(angle) * splashRadius;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const gameLoop = (currentTime) => {
      if (!gameLoopRef.current) return;

      const deltaTime = Math.min(currentTime - game.lastTime, 100);
      game.lastTime = currentTime;

      if (latestGameState.current.isGameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (latestGameState.current.isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (!game.initialized) {
        game.gameStartTime = currentTime;
        const initialCows = latestGameState.current.wave === 1 ? 8 : 5;
        for (let i = 0; i < initialCows; i++) {
          spawnCow();
        }
        game.initialized = true;
        game.lastWave = latestGameState.current.wave;
        game.currentBackgroundIndex = getBackgroundIndex(game.lastWave);
      }

      game.player.isShielded = latestGameState.current.isShielded;
      game.player.shieldTimer = latestGameState.current.shieldTimer;
      game.doubleScoreActive = latestGameState.current.doubleScoreActive;
      game.doubleScoreTimer = latestGameState.current.doubleScoreTimer;
      game.player.isMilkstormActive = latestGameState.current.isMilkstormActive;
      game.player.milkstormTimer = latestGameState.current.milkstormTimer;
      game.isTimeFreezeActive = latestGameState.current.isTimeFreezeActive;
      game.timeFreezeTimer = latestGameState.current.timeFreezeTimer;
      game.goldenCowBonusSpawnsRemaining = latestGameState.current.goldenCowBonusSpawnsRemaining;
      game.goldenCowCharmActive = latestGameState.current.goldenCowCharmActive; // Set Golden Cow Charm state
      game.jokerCowBlessingActive = latestGameState.current.jokerCowBlessingActive; // Set Joker Cow Blessing state
      game.antiGravityFieldActive = latestGameState.current.antiGravityFieldActive; // Set Anti-Gravity Field state
      game.luckyJamActive = latestGameState.current.luckyJamActive; // Set Lucky Jam state

      if (latestGameState.current.wave !== game.lastWave) {
        const newBgIndex = getBackgroundIndex(latestGameState.current.wave);
        if (newBgIndex !== game.currentBackgroundIndex && !game.backgroundTransition.active) {
          game.backgroundTransition = {
            active: true,
            oldBgIndex: game.currentBackgroundIndex,
            newBgIndex: newBgIndex,
            flickerTimer: 0,
            flickerInterval: 150,
            flickersRemaining: 6,
            showOld: true
          };
        }

        game.jokerCowWaveCounter += (latestGameState.current.wave - game.lastWave);

        // Apply Joker Cow's Blessing if active (3x more frequent spawns)
        const jokerCowThreshold = latestGameState.current.jokerCowBlessingActive ? 1 : 2;
        const jokerCowMaxThreshold = latestGameState.current.jokerCowBlessingActive ? 1 : 3;
        const jokerCowChance = latestGameState.current.jokerCowBlessingActive ? 0.8 : 0.5;

        if (game.jokerCowWaveCounter >= jokerCowThreshold && Math.random() < jokerCowChance) {
          spawnJokerCow();
          game.jokerCowWaveCounter = 0;
        } else if (game.jokerCowWaveCounter >= jokerCowMaxThreshold) {
          spawnJokerCow();
          game.jokerCowWaveCounter = 0;
        }

        game.lastWave = latestGameState.current.wave;
      }

      updatePlayer(deltaTime);
      updateCows(deltaTime);
      updateJokerCow(deltaTime);
      updateEnemies(deltaTime);
      updateMissiles(deltaTime);
      updateParticles(deltaTime);
      updatePowerups(deltaTime);
      updateEmpBlast(deltaTime);
      updateCounterAttackBlast(deltaTime);
      updateBackgroundTransition(deltaTime);

      game.cowSpawnTimer += deltaTime;
      const baseCowSpawnRate = 1800;
      const cowSpawnReduction = Math.min(latestGameState.current.wave * 50, 800);
      const cowSpawnRate = Math.max(baseCowSpawnRate - cowSpawnReduction, 1000);
      if (game.cowSpawnTimer > cowSpawnRate) {
        spawnCow();
        game.cowSpawnTimer = 0;
      }

      game.enemySpawnTimer += deltaTime;
      let enemySpawnRate;

      if (latestGameState.current.wave === 1) {
        const gameTime = currentTime - game.gameStartTime;
        if (gameTime < 5000) {
          enemySpawnRate = Infinity;
        } else {
          enemySpawnRate = 6000;
        }
      } else {
        const baseRate = 6000;
        const reductionPerWave = 300;
        const minimumRate = 1500;
        enemySpawnRate = Math.max(baseRate - (latestGameState.current.wave * reductionPerWave), minimumRate);
      }

      if (game.enemySpawnTimer > enemySpawnRate) {
        spawnEnemy();
        game.enemySpawnTimer = 0;
      }

      game.powerupSpawnTimer += deltaTime;
      const powerupSpawnRate = Math.max(20000 - (latestGameState.current.wave * 800), 10000);
      if (game.powerupSpawnTimer > powerupSpawnRate) {
        spawnPowerup();
        game.powerupSpawnTimer = 0;
      }

      game.waveTimer += deltaTime;
      const waveProgression = Math.max(35000 - (latestGameState.current.wave * 500), 20000);
      if (game.waveTimer > waveProgression) {
        updateGameState(prev => ({ ...prev, wave: prev.wave + 1 }));
        game.waveTimer = 0;
      }

      ctx.clearRect(0, 0, game.width, game.height);
      drawBackground();
      drawCows();
      drawEnemies();
      drawPowerups();
      drawMissiles();
      drawParticles();
      drawEmpBlast();
      drawCounterAttackBlast();
      drawPlayer();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleTouchStart = (e) => {
      const currentUser = userRef.current;
      if (currentUser?.controlMethod === 'direct_touch') {
        const rect = canvas.getBoundingClientRect();
        gameEngineRef.current.directTouchActive = true;
        gameEngineRef.current.lastTouchX = ((e.touches[0].clientX - rect.left) / rect.width) * gameEngineRef.current.width;
        gameEngineRef.current.lastTouchY = ((e.touches[0].clientY - rect.top) / rect.height) * gameEngineRef.current.height;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      const game = gameEngineRef.current;
      if (!game) return;

      const currentUser = userRef.current;
      if (currentUser?.controlMethod === 'direct_touch' && game.directTouchActive) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        game.lastTouchX = ((touch.clientX - rect.left) / rect.width) * game.width;
        game.lastTouchY = ((touch.clientY - rect.top) / rect.height) * game.height;
      }
    };

    const handleTouchEnd = () => {
      const currentUser = userRef.current;
      if (currentUser?.controlMethod === 'direct_touch') {
        gameEngineRef.current.directTouchActive = false;
      }
    };

    const handleMouseDown = (e) => {
      const currentUser = userRef.current;
      if (currentUser?.controlMethod === 'direct_touch') {
        const rect = canvas.getBoundingClientRect();
        gameEngineRef.current.directTouchActive = true;
        gameEngineRef.current.lastTouchX = ((e.clientX - rect.left) / rect.width) * gameEngineRef.current.width;
        gameEngineRef.current.lastTouchY = ((e.clientY - rect.top) / rect.height) * gameEngineRef.current.height;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      console.log('🧹 Cleaning up game engine');

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);

      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      if (gameEngineRef.current) {
        gameEngineRef.current.cows.length = 0;
        gameEngineRef.current.enemies.length = 0;
        gameEngineRef.current.missiles.length = 0;
        gameEngineRef.current.particles.length = 0;
        gameEngineRef.current.powerups.length = 0;
        gameEngineRef.current.jokerCow = null;
        gameEngineRef.current = null;
      }
    };
  }, [updateGameState, onTriggerCounterAttack, onResetCounterAttackTrigger, handleMouseMove, handleMouseUp, gameState.isStarted, equippedCowSkin, equippedTankSkin, loadImage]); // Add loadImage to dependencies
  // equippedCowSkin and equippedTankSkin are also dependencies because their values are used to initialize images inside this effect.

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={640}
      className="w-full h-full block bg-black"
    />
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
