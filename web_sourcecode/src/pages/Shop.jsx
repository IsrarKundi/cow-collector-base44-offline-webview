import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, Milk, Heart, ShoppingCart, Loader2, Star, DollarSign, Rocket, Sparkles, Zap } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Spaceship } from "@/api/entities";

const SHOP_ITEMS = [
  {
    id: 'bonus_life',
    name: 'Temporary Extra Life',
    description: 'Start your next run with one extra life (4 instead of 3). Single use.',
    cost: 1000,
    icon: <Heart className="w-8 h-8 text-red-500" />,
    checkOwned: (user) => user.bonusLifeForNextRun,
    getUpdate: (user, item) => ({ bonusLifeForNextRun: true, milk: user.milk - item.cost }),
  },
  {
    id: 'double_milk',
    name: 'Double Milk',
    description: 'Earn 2x milk from cows on your next run. Single use.',
    cost: 500,
    icon: <Star className="w-8 h-8 text-yellow-400" />,
    checkOwned: (user) => user.doubleMilkForNextRun,
    getUpdate: (user, item) => ({ doubleMilkForNextRun: true, milk: user.milk - item.cost }),
  },
  {
    id: 'golden_cow_charm',
    name: 'Golden Cow Charm',
    description: 'Golden cows move 60% slower on your next run, making them easier to catch. Single use.',
    cost: 750,
    icon: <span className="text-4xl">🐄✨</span>,
    checkOwned: (user) => user.goldenCowCharmActive,
    getUpdate: (user, item) => ({ goldenCowCharmActive: true, milk: user.milk - item.cost }),
  },
  {
    id: 'lucky_jam',
    name: 'Lucky Jam',
    description: 'Enemy missiles last 2 seconds less and spawn 1 second later on your next run. Single use.',
    cost: 1200,
    icon: <Zap className="w-8 h-8 text-orange-400" />,
    checkOwned: (user) => user.luckyJamActive,
    getUpdate: (user, item) => ({ luckyJamActive: true, milk: user.milk - item.cost }),
  },
  {
    id: 'joker_cow_blessing',
    name: 'Joker Cow\'s Blessing',
    description: 'Joker Cows spawn 3x more frequently on your next run. Single use.',
    cost: 2000,
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    checkOwned: (user) => user.jokerCowBlessingActive,
    getUpdate: (user, item) => ({ jokerCowBlessingActive: true, milk: user.milk - item.cost }),
  }
];

export default function ShopPage() {
  const [user, setUser] = useState(null);
  const [spaceships, setSpaceships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const shipData = await Spaceship.list();
      // Sort spaceships by cost (low to high)
      const sortedShips = shipData.sort((a, b) => a.cost - b.cost);
      setSpaceships(sortedShips);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseItem = async (item) => {
    if (!user || user.milk < item.cost || item.checkOwned(user) || purchasingId) {
      return;
    }

    setPurchasingId(item.id);
    let shouldClearPurchasingIdImmediately = true;

    try {
      const updates = item.getUpdate(user, item);
      await User.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      if (error.response?.status === 429) {
        // No console.error for rate limit to reduce noise
        shouldClearPurchasingIdImmediately = false;
        setTimeout(() => {
          setPurchasingId(null);
        }, 3000);
      } else {
        console.error('Purchase failed:', error);
      }
    } finally {
      if (shouldClearPurchasingIdImmediately) {
        setPurchasingId(null);
      }
    }
  };

  const handlePurchaseShip = async (ship) => {
    if (!user || user.milk < ship.cost || user.ownedSpaceships?.includes(ship.ship_id) || purchasingId) {
      return;
    }

    setPurchasingId(ship.ship_id);
    let shouldClearPurchasingIdImmediately = true;

    try {
      const newOwnedShips = [...(user.ownedSpaceships || ['ufo']), ship.ship_id];
      const updates = {
        ownedSpaceships: newOwnedShips,
        milk: user.milk - ship.cost
      };
      await User.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      if (error.response?.status === 429) {
        // No console.error for rate limit to reduce noise
        shouldClearPurchasingIdImmediately = false;
        setTimeout(() => {
          setPurchasingId(null);
        }, 3000);
      } else {
        console.error('Purchase failed:', error);
      }
    } finally {
      if (shouldClearPurchasingIdImmediately) {
        setPurchasingId(null);
      }
    }
  };

  const handleEquipShip = async (ship) => {
    if (!user || purchasingId) return;

    setPurchasingId(ship.ship_id);
    let shouldClearPurchasingIdImmediately = true;

    try {
      await User.updateMyUserData({ equippedSpaceshipId: ship.ship_id });
      setUser(prev => ({ ...prev, equippedSpaceshipId: ship.ship_id }));
    } catch (error) {
      if (error.response?.status === 429) {
        // No console.error for rate limit to reduce noise
        shouldClearPurchasingIdImmediately = false;
        setTimeout(() => {
          setPurchasingId(null);
        }, 3000);
      } else {
        console.error('Failed to equip ship:', error);
      }
    } finally {
      if (shouldClearPurchasingIdImmediately) {
        setPurchasingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4">
      <div className="max-w-md mx-auto md:max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg flex items-center truncate">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">MILK SHOP</span>
            </h1>
          </div>
          {user && (
            <Card className="bg-white/20 backdrop-blur-md border-white/30 p-1.5 sm:p-2 md:p-3 flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-white">
                <Milk className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300"/>
                <span className="text-base sm:text-lg md:text-2xl font-bold">{user.milk ? user.milk.toLocaleString() : 0}</span>
              </div>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="text-center text-white py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading Shop...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <Card className="bg-white/90 backdrop-blur-md border-white/50 p-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Please Log In</h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">You need to be logged in to access the shop and save your progress.</p>
              <Button onClick={() => User.login()} className="bg-purple-500 hover:bg-purple-600 text-white">
                Log In
              </Button>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="powerups" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-md">
              <TabsTrigger value="powerups" className="data-[state=active]:bg-white/90">Power-ups</TabsTrigger>
              <TabsTrigger value="hanger" className="data-[state=active]:bg-white/90">Hanger</TabsTrigger>
            </TabsList>

            <TabsContent value="powerups" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-md border-white/50">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-center text-gray-800">
                    Power-ups for Next Run
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {SHOP_ITEMS.map(item => {
                    const hasEnoughMilk = (user.milk || 0) >= item.cost;
                    const isPurchasing = purchasingId === item.id;
                    const isOwned = item.checkOwned(user);

                    return (
                      <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg border-2 bg-gray-50">
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div className="flex-grow text-center md:text-left">
                          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="flex-shrink-0 w-full md:w-auto">
                          <Button
                            onClick={() => handlePurchaseItem(item)}
                            disabled={!hasEnoughMilk || isPurchasing || isOwned}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                          >
                            {isPurchasing ? ( <Loader2 className="w-4 h-4 mr-2 animate-spin" /> )
                             : isOwned ? ( <Check className="w-4 h-4 mr-2" /> )
                             : ( <Milk className="w-4 h-4 mr-2" /> )}
                            {isPurchasing ? 'Processing...' : isOwned ? 'Active!' : `Buy for ${item.cost}`}
                          </Button>
                          {!hasEnoughMilk && !isOwned && (
                            <p className="text-xs text-red-600 text-center mt-1">Not enough milk!</p>
                          )}
                          {isOwned && (
                            <p className="text-xs text-blue-600 text-center mt-1">Ready for your next run!</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-md border-white/50">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-center text-gray-800">
                    Refill Milk
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Out of milk? Purchase more to get the best power-ups!
                  </p>
                  <Link to={createPageUrl('BuyMilk')}>
                    <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Buy More Milk
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hanger" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-md border-white/50">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-center text-gray-800 flex items-center justify-center gap-2">
                    <Rocket className="w-6 h-6" />
                    Spaceship Hanger
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {spaceships.map(ship => {
                    const isOwned = user.ownedSpaceships?.includes(ship.ship_id) || ship.ship_id === 'ufo';
                    const isEquipped = user.equippedSpaceshipId === ship.ship_id;
                    const hasEnoughMilk = (user.milk || 0) >= ship.cost;
                    const isPurchasing = purchasingId === ship.ship_id;

                    return (
                      <div key={ship.ship_id} className={`p-4 rounded-lg border-2 ${isEquipped ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={ship.normal_image_url} 
                              alt={ship.name}
                              className="w-24 h-24 object-contain mx-auto"
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-xl text-gray-900">{ship.name}</h3>
                              {isEquipped && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">EQUIPPED</span>
                              )}
                              {isOwned && !isEquipped && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">OWNED</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{ship.description}</p>
                            
                            <div className="flex flex-wrap gap-3 text-sm">
                              {ship.milk_bonus > 1.0 && (
                                <div className="flex items-center gap-1">
                                  <Milk className="w-4 h-4 text-yellow-500" />
                                  <span className="font-semibold">Milk Bonus:</span>
                                  <span className="text-green-600 font-bold">+{((ship.milk_bonus - 1) * 100).toFixed(0)}%</span>
                                </div>
                              )}
                              {ship.speed_modifier && ship.speed_modifier !== 1.0 && (
                                <div className="flex items-center gap-1">
                                  <Rocket className="w-4 h-4 text-blue-500" />
                                  <span className="font-semibold">Speed:</span>
                                  <span className="text-blue-600 font-bold">+{((ship.speed_modifier - 1) * 100).toFixed(0)}%</span>
                                </div>
                              )}
                              {ship.bonus_starting_life && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span className="font-semibold text-red-600 font-bold">+1 Starting Life</span>
                                </div>
                              )}
                              {ship.starting_lives && ship.starting_lives !== 3 && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4 text-orange-500" />
                                  <span className={`font-semibold font-bold ${ship.starting_lives < 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                    Starts with {ship.starting_lives} {ship.starting_lives === 1 ? 'Life' : 'Lives'}
                                  </span>
                                </div>
                              )}
                              {ship.revive_on_death && (
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">💫</span>
                                  <span className="font-semibold text-purple-600 font-bold">One-Time Revive (Lose 50% Milk)</span>
                                </div>
                              )}
                              {ship.cost > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">Cost:</span>
                                  <span className="text-purple-600 font-bold">{ship.cost.toLocaleString()} milk</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center">
                            {!isOwned ? (
                              <div className="w-full md:w-auto">
                                <Button
                                  onClick={() => handlePurchaseShip(ship)}
                                  disabled={!hasEnoughMilk || isPurchasing}
                                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
                                >
                                  {isPurchasing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Milk className="w-4 h-4 mr-2" />}
                                  {isPurchasing ? 'Purchasing...' : `Buy for ${ship.cost.toLocaleString()}`}
                                </Button>
                                {!hasEnoughMilk && (
                                  <p className="text-xs text-red-600 text-center mt-1">Not enough milk!</p>
                                )}
                              </div>
                            ) : isEquipped ? (
                              <Button disabled className="w-full md:w-auto bg-green-500 text-white font-bold">
                                <Check className="w-4 h-4 mr-2" />
                                Currently Flying
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleEquipShip(ship)}
                                disabled={isPurchasing}
                                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold"
                              >
                                {isPurchasing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                                {isPurchasing ? 'Equipping...' : 'Equip Ship'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center mt-4 sm:mt-6 md:mt-8">
          <Link to={createPageUrl('Game')}>
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 w-full max-w-xs">
              🚀 BACK TO GAME 🚀
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}