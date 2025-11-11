import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GameControls() {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-white text-sm md:text-lg">🎮 Controls</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-white">
        <div className="space-y-2 md:space-y-3">
          {/* Desktop Controls - Hidden on mobile */}
          <div className="hidden md:block">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
              PC Controls
            </Badge>
            <div className="text-sm space-y-1 ml-2">
              <p>⌨️ WASD or Arrow keys to move</p>
            </div>
          </div>
          
          {/* Mobile Controls - Prominent on mobile */}
          <div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
              <span className="md:hidden">Controls</span>
              <span className="hidden md:inline">Mobile Controls</span>
            </Badge>
            <div className="text-xs md:text-sm space-y-1 ml-2">
              <p>🕹️ Virtual joystick to move</p>
              <p className="md:hidden">🎯 Collect cows with tractor beam</p>
              <p className="md:hidden">⚡ Lure missiles into tanks</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}