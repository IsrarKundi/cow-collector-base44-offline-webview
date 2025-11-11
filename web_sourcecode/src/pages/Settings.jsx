
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Gamepad2, Maximize, Minimize, Hand } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [controlMethod, setControlMethod] = useState('joystick');
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    loadUser();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenChange', handleFullscreenChange);
    };
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setControlMethod(userData.controlMethod || 'joystick');
    } catch (error) {
      console.log('User not logged in');
    }
  };

  const handleControlMethodChange = async (method) => {
    if (!user) return;
    
    setControlMethod(method);
    
    try {
      await base44.auth.updateMe({
        controlMethod: method,
        joystickPosition: 'middle'
      });
      
      setUser(prev => ({
        ...prev,
        controlMethod: method,
        joystickPosition: 'middle'
      }));
    } catch (error) {
      if (error.response?.status === 429) {
        console.error('Rate limited. Please wait a moment and try again.');
        setTimeout(() => handleControlMethodChange(method), 3000);
      } else {
        console.error('Failed to save settings:', error);
      }
    }
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
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
              ⚙️ SETTINGS
            </h1>
            <p className="text-white/90 text-xs sm:text-sm md:text-lg">Game preferences</p>
          </div>
        </div>

        {/* Control Method Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5" />
              Control Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-white/90 text-sm md:text-base">
                Choose how you want to control your spaceship:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleControlMethodChange('joystick')}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-lg border-2 transition-all w-full text-left ${
                    controlMethod === 'joystick'
                      ? 'border-yellow-400 bg-white/20'
                      : 'border-white/20 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-semibold text-sm md:text-base">Virtual Joystick (Middle)</h4>
                    <p className="text-white/70 text-xs md:text-sm">Use on-screen joystick centered at bottom</p>
                  </div>
                  {controlMethod === 'joystick' && (
                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => handleControlMethodChange('direct_touch')}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-lg border-2 transition-all w-full text-left ${
                    controlMethod === 'direct_touch'
                      ? 'border-yellow-400 bg-white/20'
                      : 'border-white/20 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                    <Hand className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-semibold text-sm md:text-base">Direct Touch</h4>
                    <p className="text-white/70 text-xs md:text-sm">Drag your finger to move the ship directly</p>
                  </div>
                  {controlMethod === 'direct_touch' && (
                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </button>
              </div>
              
              <div className="text-center text-white/70 text-xs md:text-sm pt-2">
                ✅ Settings saved automatically
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2">
              <Maximize className="w-4 h-4 md:w-5 md:h-5" />
              Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
              <div>
                <h4 className="text-white font-semibold text-sm md:text-base">Fullscreen Mode</h4>
                <p className="text-white/70 text-xs md:text-sm">Enable for a more immersive experience.</p>
              </div>
              <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
              >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  {isFullscreen ? 'Exit' : 'Enter'}
              </Button>
            </div>
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
