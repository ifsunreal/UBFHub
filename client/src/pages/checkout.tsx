import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Banknote, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { subscribeToQuery, addDocument, deleteDocument, getDocument } from "@/lib/firebase";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { state } = useStore();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stallInfo, setStallInfo] = useState<any>(null);

  useEffect(() => {
    if (state.user?.id) {
      const unsubscribe = subscribeToQuery("cartItems", "userId", "==", state.user.id, async (items) => {
        setCartItems(items);
        
        // Get stall info for the first item
        if (items.length > 0 && items[0].stallId) {
          const stallDoc = await getDocument("stalls", items[0].stallId);
          if (stallDoc.exists()) {
            setStallInfo({ id: stallDoc.id, ...stallDoc.data() });
          }
        }
      });
      return () => unsubscribe();
    }
  }, [state.user?.id]);

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const customizationPrice = item.customizations?.reduce((sum: number, custom: any) => sum + (custom.price || 0), 0) || 0;
    return sum + ((itemPrice + customizationPrice) * item.quantity);
  }, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    if (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < subtotal)) {
      toast({
        title: "Invalid cash amount",
        description: "Please enter a valid amount that covers the total.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Create order
      const orderId = `UBF-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      await addDocument("orders", {
        userId: state.user?.id,
        stallId: cartItems[0]?.stallId,
        stallName: stallInfo?.name || "Unknown Stall",
        status: "pending",
        totalAmount: subtotal,
        paymentMethod,
        cashAmount: paymentMethod === "cash" ? parseFloat(cashAmount) : null,
        changeRequired: paymentMethod === "cash" ? parseFloat(cashAmount) - subtotal : 0,
        specialInstructions: specialInstructions || null,
        qrCode: orderId,
        estimatedTime: "15-40 mins",
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || [],
        })),
        createdAt: new Date(),
      });

      // Clear cart
      for (const item of cartItems) {
        await deleteDocument("cartItems", item.id);
      }

      toast({
        title: "Order placed successfully!",
        description: `Your order ${orderId} has been confirmed.`,
      });

      setLocation("/orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center p-4 bg-[#820d2a]">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="mr-3 text-white hover:bg-red-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Checkout</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No items to checkout</h2>
          <p className="text-gray-600 text-center mb-6">Your cart is empty</p>
          <Button onClick={() => setLocation("/")} className="bg-[#6d031e] hover:bg-red-700">
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="flex items-center p-4 bg-[#820d2a]">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="mr-3 text-white hover:bg-red-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Checkout</h1>
        </div>
      </motion.div>

      <div className="p-4 space-y-4 pb-32">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name} x{item.quantity}</p>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {item.customizations.map((c: any) => c.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="font-semibold">
                  ₱{(((item.price || 0) + (item.customizations?.reduce((sum: number, custom: any) => sum + (custom.price || 0), 0) || 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pickup Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Pickup from</h3>
          <p className="font-medium">{stallInfo?.name || "Loading..."}</p>
          <p className="text-sm text-gray-600">Ready in 15-40 mins</p>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Banknote className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Cash</p>
                  <p className="text-sm text-gray-600">Pay at pickup</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
              <RadioGroupItem value="gcash" id="gcash" disabled />
              <Label htmlFor="gcash" className="flex items-center gap-2 flex-1">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">GCash</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
              <RadioGroupItem value="maya" id="maya" disabled />
              <Label htmlFor="maya" className="flex items-center gap-2 flex-1">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Maya</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "cash" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <Label className="text-sm font-medium">Cash on hand (₱)</Label>
              <Input
                type="number"
                placeholder="Enter amount you'll pay with"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="mt-2"
                min={subtotal}
                step="0.01"
              />
              {cashAmount && parseFloat(cashAmount) >= subtotal && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Change: ₱{(parseFloat(cashAmount) - subtotal).toFixed(2)}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Special Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4"
        >
          <Label className="text-base font-medium">Special Instructions (Optional)</Label>
          <Textarea
            placeholder="Any special requests for the stall owner"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="mt-2"
          />
        </motion.div>
      </div>

      {/* Fixed Bottom Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50"
      >
        <div className="max-w-md mx-auto">
          <Button
            onClick={placeOrder}
            disabled={isProcessing || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < subtotal))}
            className="w-full bg-[#6d031e] hover:bg-red-700 text-white py-4 text-lg font-medium"
          >
            {isProcessing ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}