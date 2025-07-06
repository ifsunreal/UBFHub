import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CartItem from "@/components/cart-item";
import type { CartItemWithDetails } from "@/types";

export default function Cart() {
  const [, setLocation] = useLocation();
  const [specialInstructions, setSpecialInstructions] = useState("");
  const { state } = useStore();
  const { toast } = useToast();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: [`/api/cart/${state.user?.id}`],
    enabled: !!state.user?.id,
  });

  const createOrderMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${state.user?.id}`] });
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed. Check your orders for tracking.",
      });
      setLocation("/orders");
    },
    onError: () => {
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => api.deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${state.user?.id}`] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      api.updateCartItem(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${state.user?.id}`] });
    },
  });

  const subtotal = cartItems?.reduce(
    (sum: number, item: CartItemWithDetails) => 
      sum + (parseFloat(item.menuItem?.price || "0") * item.quantity),
    0
  ) || 0;

  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!state.user || !cartItems?.length) return;

    const restaurantId = cartItems[0].menuItem?.restaurantId;
    if (!restaurantId) return;

    const orderItems = cartItems.map((item: CartItemWithDetails) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.menuItem?.price || "0",
      customizations: item.customizations || undefined,
    }));

    createOrderMutation.mutate({
      userId: state.user.id,
      restaurantId,
      totalAmount: total.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      specialInstructions,
      estimatedTime: "15-20 minutes",
      items: orderItems,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center">
            <button
              onClick={() => setLocation("/")}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Your Cart</h1>
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-center mb-6">
            Add some delicious items from our restaurants to get started!
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-maroon-600 hover:bg-maroon-700"
          >
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center">
          <button
            onClick={() => setLocation("/")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Your Cart</h1>
        </div>
      </header>

      {/* Delivery Info */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Deliver to: University of Batangas Canteen</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Estimated delivery: 15-20 minutes</p>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-4">
        {cartItems?.map((item: CartItemWithDetails) => (
          <CartItem
            key={item.id}
            item={item}
            onDelete={(id) => deleteItemMutation.mutate(id)}
            onUpdateQuantity={(id, quantity) => updateQuantityMutation.mutate({ id, quantity })}
          />
        ))}
      </div>

      {/* Special Instructions */}
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or allergies..."
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="bg-white border-t p-4 pb-20">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>₱{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handlePlaceOrder}
          disabled={createOrderMutation.isPending}
          className="w-full mt-4 bg-maroon-600 hover:bg-maroon-700"
        >
          {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
