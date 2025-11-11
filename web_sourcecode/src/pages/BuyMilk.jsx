
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Milk, DollarSign, Loader2, Star } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

const MILK_PACKAGES = [
  { id: 'pack_500', milk: 500, price: 1.99, icon: '🥛' },
  { id: 'pack_4000', milk: 4000, price: 4.99, icon: '🍼' },
  { id: 'pack_10000', milk: 10000, price: 9.99, icon: '🪣' },
  { id: 'pack_50000', milk: 50000, price: 19.99, icon: '🏪' },
  { id: 'pack_150000', milk: 150000, price: 49.99, icon: '🏦', bestValue: true }
];

export default function BuyMilkPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack) => {
    if (!user) return;

    setPurchasingId(pack.id);
    
    // --- DEVELOPER NOTE ---
    // This is where you would trigger your backend function to initiate the payment process.
    // Example: await yourBackendFunction({ userId: user.id, packageId: pack.id });
    // For this frontend-only example, we'll simulate a delay and then show an alert.
    console.log(`Initiating purchase for ${pack.milk} milk for $${pack.price}...`);
    
    setTimeout(() => {
      alert(`Purchase flow for ${pack.milk} milk would start now.\nIntegrate your payment provider here.`);
      setPurchasingId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 md:p-4">
      <div className="max-w-md mx-auto md:max-w-4xl">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Link to={createPageUrl('Shop')}>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg flex items-center">
              <DollarSign className="w-8 h-8 md:w-12 md:h-12 mr-3" />
              BUY MILK
            </h1>
            <p className="text-white/90 text-xs md:text-lg">Refill your milk supply!</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        ) : !user ? (
            <div className="text-center py-12">
                <Card className="bg-white/90 backdrop-blur-md border-white/50 p-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Please Log In</h3>
                    <p className="text-gray-600 mb-6 text-sm md:text-base">You need to be logged in to purchase milk.</p>
                    <Button onClick={() => User.login()} className="bg-purple-500 hover:bg-purple-600 text-white">
                        Log In
                    </Button>
                </Card>
            </div>
        ) : (
          <Card className="bg-white/90 backdrop-blur-md border-white/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-center text-gray-800">
                Milk Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MILK_PACKAGES.map(pack => {
                  const isPurchasing = purchasingId === pack.id;
                  return (
                    <div key={pack.id} className={`relative p-4 rounded-lg border-2 transition-all ${pack.bestValue ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200'}`}>
                      {pack.bestValue && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <div className="bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                BEST VALUE
                            </div>
                        </div>
                      )}
                      <div className="flex flex-col items-center text-center">
                        <div className="text-5xl mb-2">{pack.icon}</div>
                        <div className="flex items-center gap-2">
                          <Milk className="w-6 h-6 text-gray-700" />
                          <h3 className="font-bold text-2xl text-gray-900">{pack.milk.toLocaleString()}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Milk</p>
                        
                        <Button
                          onClick={() => handlePurchase(pack)}
                          disabled={isPurchasing}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        >
                          {isPurchasing ? ( <Loader2 className="w-5 h-5 mr-2 animate-spin" /> )
                           : ( <DollarSign className="w-5 h-5 mr-2" /> )}
                          {isPurchasing ? 'Processing...' : `Buy for $${pack.price}`}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="text-center mt-6 text-xs text-gray-500">
                <p>All purchases are processed securely. You will be redirected to our payment partner.</p>
                <p>Milk will be added to your account upon successful payment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6 md:mt-8">
          <Link to={createPageUrl('Shop')}>
            <Button size="lg" className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 w-full max-w-xs">
              BACK TO SHOP
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
