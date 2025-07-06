import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, Tag, Utensils, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { subscribeToQuery, updateDocument, deleteDocument, addDocument } from "@/lib/firebase";
import BottomNav from "@/components/layout/bottom-nav";
import LoadingIndicator from "@/components/loading-indicator";
import LoadingOverlay from "@/components/loading-overlay";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { state } = useStore();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [noCutlery, setNoCutlery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (state.user?.id) {
      const unsubscribe = subscribeToQuery("cartItems", "userId", "==", state.user.id, setCartItems);
      return () => unsubscribe();
    }
  }, [state.user?.id]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    const loadingKey = `update-${itemId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      if (newQuantity <= 0) {
        await deleteDocument("cartItems", itemId);
        toast({
          title: "Item removed",
          description: "Item has been removed from cart",
        });
      } else {
        await updateDocument("cartItems", itemId, { quantity: newQuantity });
        toast({
          title: "Cart updated",
          description: "Item quantity has been updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const removeItem = async (itemId: string) => {
    const loadingKey = `remove-${itemId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await deleteDocument("cartItems", itemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const customizationPrice = item.customizations?.reduce((sum, custom) => sum + (custom.price || 0), 0) || 0;
    return sum + ((itemPrice + customizationPrice) * item.quantity);
  }, 0);
  const total = subtotal;

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setShowLoadingOverlay(true);
    setLoadingMessage("Preparing checkout...");
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setShowLoadingOverlay(false);
      setLocation("/checkout");
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center p-4 bg-[#820d2a]">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-[#ffffff]">Cart</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-center mb-6">Add some delicious items from our restaurants to get started</p>
          <Button onClick={() => setLocation("/")} className="bg-maroon-600 hover:bg-maroon-700">
            Browse Restaurants
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress Steps */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-[#8B0000] via-[#DC143C] to-[#B22222] shadow-sm sticky top-0 z-40"
      >
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="mr-3 text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Cart</h1>
        </div>
        
        {/* Progress Indicator */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">1</div>
              <span className="text-xs text-gray-600 ml-2">Menu</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-[#6d031e] rounded-full flex items-center justify-center text-xs font-medium text-white">2</div>
              <span className="text-xs text-[#6d031e] ml-2 font-medium">Cart</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-400">3</div>
              <span className="text-xs text-gray-400 ml-2">Checkout</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-4 pb-32">
        {/* Pickup/Delivery Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              🏪
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Pickup</h3>
              <p className="text-sm text-gray-600">Ready in 15-25 mins</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-[#6d031e]"
                onClick={() => {
                  toast({
                    title: "Delivery Option",
                    description: "Delivery is currently unavailable. Only pickup is supported.",
                    variant: "default",
                  });
                }}
              >
                Change
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Cart Items */}
        <AnimatePresence>
          {cartItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.customizations && item.customizations.length > 0 
                      ? item.customizations.map(custom => `${custom.name} (+₱${custom.price})`).join(', ')
                      : "No customizations"
                    }
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        disabled={loadingStates[`update-${item.id}`]}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        {loadingStates[`update-${item.id}`] ? (
                          <LoadingIndicator variant="dots" size="sm" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        disabled={loadingStates[`update-${item.id}`]}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        {loadingStates[`update-${item.id}`] ? (
                          <LoadingIndicator variant="dots" size="sm" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">₱{(((item.price || 0) + (item.customizations?.reduce((sum, custom) => sum + (custom.price || 0), 0) || 0)) * item.quantity).toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        disabled={loadingStates[`remove-${item.id}`]}
                        onClick={() => removeItem(item.id)}
                      >
                        {loadingStates[`remove-${item.id}`] ? (
                          <LoadingIndicator variant="dots" size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add More Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4"
        >
          <Button 
            variant="link" 
            className="w-full justify-start p-0 h-auto text-gray-700"
            onClick={() => {
              // Get first item's stall ID to navigate back to that stall
              const firstStall = cartItems[0]?.stallId;
              if (firstStall) {
                setLocation(`/restaurant/${firstStall}`);
              } else {
                setLocation("/");
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add more items
          </Button>
        </motion.div>



        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-4 space-y-3"
        >
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          
          {/* Apply Voucher - Locked */}
          <Button variant="outline" className="w-full justify-start text-gray-400 cursor-not-allowed" disabled>
            <Lock className="w-4 h-4 mr-2" />
            Apply a voucher
          </Button>

          {/* Cutlery Option - Information for stall owner */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium">Cutlery</p>
                <p className="text-xs text-gray-600">Cutlery needs will be communicated to the stall owner</p>
              </div>
            </div>
            <Switch checked={!noCutlery} onCheckedChange={(checked) => setNoCutlery(!checked)} />
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <Button variant="link" className="p-0 h-auto text-sm text-gray-600">See summary</Button>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-4"
        >
          <Label className="text-base font-medium">Instructions (Optional)</Label>
          <Input
            placeholder="Special requests for the stall owner"
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            className="mt-2"
          />
        </motion.div>
      </div>

      {/* Fixed Bottom Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 z-[60]"
      >
        <div className="max-w-md mx-auto">
          <Button
            onClick={proceedToCheckout}
            disabled={isProcessing || cartItems.length === 0 || showLoadingOverlay}
            className="w-full bg-[#6d031e] hover:bg-red-700 text-white py-4 text-lg font-medium"
          >
            {isProcessing || showLoadingOverlay ? (
              <LoadingIndicator message="Processing..." variant="dots" />
            ) : (
              "Checkout"
            )}
          </Button>
        </div>
      </motion.div>

      <BottomNav />
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showLoadingOverlay}
        message={loadingMessage}
        onClose={() => setShowLoadingOverlay(false)}
      />
    </div>
  );
}