import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Home } from 'lucide-react';

export default function PauseMenu({ onResume, onReturnToMenu }) {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white/90 backdrop-blur-md border-white/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">
              ⏸️ PAUSED
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={onResume}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume Game
            </Button>
            
            <Button
              onClick={onReturnToMenu}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg py-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Base
            </Button>

            <div className="text-center text-xs text-gray-500 pt-2">
              <p>💡 Tip: Use power-ups strategically!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}