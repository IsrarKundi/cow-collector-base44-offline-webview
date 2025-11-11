import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function VirtualJoystick({ position = 'middle', onMove, visible = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbPosition, setThumbPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const thumbRef = useRef(null);
  const animationRef = useRef(null);

  const joystickSize = 80; // Total joystick diameter
  const thumbSize = 32; // Thumb diameter
  const maxDistance = (joystickSize - thumbSize) / 2; // Max distance thumb can travel from center

  const updateThumbPosition = useCallback((deltaX, deltaY) => {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    let newX = deltaX;
    let newY = deltaY;
    
    // Constrain thumb within joystick bounds
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      newX = deltaX * ratio;
      newY = deltaY * ratio;
    }
    
    setThumbPosition({ x: newX, y: newY });
    
    // Calculate movement values (-1 to 1 for each axis)
    const normalizedX = newX / maxDistance;
    const normalizedY = newY / maxDistance;
    
    onMove(normalizedX, normalizedY);
  }, [maxDistance, onMove]);

  const handleStart = useCallback((clientX, clientY) => {
    if (!joystickRef.current) return;
    
    setIsDragging(true);
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    updateThumbPosition(clientX - centerX, clientY - centerY);
  }, [updateThumbPosition]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    updateThumbPosition(clientX - centerX, clientY - centerY);
  }, [isDragging, updateThumbPosition]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    
    // Smoothly return thumb to center
    const returnToCenter = () => {
      setThumbPosition(prev => {
        const newX = prev.x * 0.85;
        const newY = prev.y * 0.85;
        
        if (Math.abs(newX) < 0.5 && Math.abs(newY) < 0.5) {
          onMove(0, 0);
          return { x: 0, y: 0 };
        }
        
        const magnitude = Math.sqrt(newX * newX + newY * newY);
        const normalizedX = magnitude > 0 ? newX / magnitude : 0;
        const normalizedY = magnitude > 0 ? newY / magnitude : 0;
        const intensity = Math.min(magnitude / maxDistance, 1);
        
        onMove(normalizedX * intensity, normalizedY * intensity);
        
        animationRef.current = requestAnimationFrame(returnToCenter);
        return { x: newX, y: newY };
      });
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(returnToCenter);
  }, [onMove, maxDistance]);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Set up global event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 z-50 select-none left-1/2 -translate-x-1/2"
      style={{
        width: joystickSize,
        height: joystickSize,
      }}
    >
      {/* Joystick Base */}
      <div
        ref={joystickRef}
        className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 relative cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Joystick Thumb */}
        <div
          ref={thumbRef}
          className={`absolute rounded-full bg-white/80 border-2 border-white transition-all duration-75 ${
            isDragging ? 'scale-110' : 'scale-100'
          }`}
          style={{
            width: thumbSize,
            height: thumbSize,
            left: '50%',
            top: '50%',
            transform: `translate(${thumbPosition.x - thumbSize/2}px, ${thumbPosition.y - thumbSize/2}px)`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          }}
        />
        
        {/* Center dot */}
        <div
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}