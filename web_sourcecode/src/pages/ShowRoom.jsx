
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ShowRoom() {
  const [user, setUser] = useState(null);
  const [cowSkins, setCowSkins] = useState([]);
  const [tankSkins, setTankSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cows');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, cowSkinsData, tankSkinsData] = await Promise.all([
        base44.auth.me(),
        base44.entities.CowSkin.list(),
        base44.entities.TankSkin.list()
      ]);

      setUser(userData);
      
      // Remove duplicates by creating a Map with skin_id as key
      const uniqueCowSkins = Array.from(
        new Map(cowSkinsData.map(skin => [skin.skin_id, skin])).values()
      ).sort((a, b) => a.unlock_score_threshold - b.unlock_score_threshold);
      
      const uniqueTankSkins = Array.from(
        new Map(tankSkinsData.map(skin => [skin.skin_id, skin])).values()
      ).sort((a, b) => a.unlock_score_threshold - b.unlock_score_threshold);
      
      setCowSkins(uniqueCowSkins);
      setTankSkins(uniqueTankSkins);
    } catch (error) {
      console.error('Failed to load showroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const equipCowSkin = async (skinId) => {
    try {
      await base44.auth.updateMe({ equippedCowSkinId: skinId });
      setUser(prev => ({ ...prev, equippedCowSkinId: skinId }));
    } catch (error) {
      console.error('Failed to equip cow skin:', error);
    }
  };

  const equipTankSkin = async (skinId) => {
    try {
      await base44.auth.updateMe({ equippedTankSkinId: skinId });
      setUser(prev => ({ ...prev, equippedTankSkinId: skinId }));
    } catch (error) {
      console.error('Failed to equip tank skin:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Showroom...</div>
      </div>
    );
  }

  const renderSkinCard = (skin, type) => {
    const isUnlocked = type === 'cow' 
      ? user?.unlockedCowSkins?.includes(skin.skin_id)
      : user?.unlockedTankSkins?.includes(skin.skin_id);
    
    const isEquipped = type === 'cow'
      ? user?.equippedCowSkinId === skin.skin_id
      : user?.equippedTankSkinId === skin.skin_id;

    const handleEquip = () => {
      if (isUnlocked) {
        if (type === 'cow') {
          equipCowSkin(skin.skin_id);
        } else {
          equipTankSkin(skin.skin_id);
        }
      }
    };

    // Tank skins that are already facing down in their source images (don't need rotation)
    const tankSkinsAlreadyFacingDown = [
      'glazed_threat',
      'royal_heartbreak',
      'the_last_note',
      'moofasa',
      'lava_puppy',
      'no_more_moos'
    ];

    const needsRotation = type === 'tank' && !tankSkinsAlreadyFacingDown.includes(skin.skin_id);

    return (
      <Card key={skin.skin_id} className={`relative overflow-hidden transition-all ${
        isEquipped ? 'ring-4 ring-yellow-400 shadow-xl' : 'hover:shadow-lg'
      } ${!isUnlocked ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{skin.name}</CardTitle>
            {isEquipped && (
              <Badge className="bg-yellow-400 text-black">
                <Check className="w-3 h-3 mr-1" />
                Equipped
              </Badge>
            )}
            {!isUnlocked && (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 bg-gray-900 rounded-lg p-4 h-32 flex items-center justify-center">
            {isUnlocked ? (
              <img 
                src={skin.image_url} 
                alt={skin.name}
                className="max-h-24 max-w-24 object-contain"
                style={needsRotation ? { transform: 'rotate(180deg)' } : {}}
              />
            ) : (
              <Lock className="w-16 h-16 text-gray-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{skin.description}</p>
          
          {!isUnlocked && (
            <div className="text-xs text-orange-600 font-semibold mb-2">
              🏆 Reach {skin.unlock_score_threshold.toLocaleString()} points to unlock
            </div>
          )}
          
          {isUnlocked && !isEquipped && (
            <Button 
              onClick={handleEquip}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Equip
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-10 w-10 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white">🎨 Showroom</h1>
          <div className="w-10" />
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('cows')}
            className={`flex-1 ${activeTab === 'cows' ? 'bg-blue-500' : 'bg-white/20'} hover:bg-blue-600`}
          >
            🐄 Cow Skins
          </Button>
          <Button
            onClick={() => setActiveTab('tanks')}
            className={`flex-1 ${activeTab === 'tanks' ? 'bg-red-500' : 'bg-white/20'} hover:bg-red-600`}
          >
            🎯 Tank Skins
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'cows' 
            ? cowSkins.map(skin => renderSkinCard(skin, 'cow'))
            : tankSkins.map(skin => renderSkinCard(skin, 'tank'))
          }
        </div>

        <Card className="mt-8 bg-white/10 border-white/20">
          <CardContent className="pt-6 text-white text-center">
            <p className="text-lg">
              💡 Keep playing to unlock more skins! Higher scores unlock cooler designs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
