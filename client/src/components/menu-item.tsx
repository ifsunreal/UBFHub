import { useState } from "react";
import { Plus, Minus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MenuItemProps {
  item: {
    id: number;
    restaurantId: number;
    name: string;
    description?: string | null;
    price: string;
    image?: string | null;
    category: string;
    isAvailable: boolean;
    isPopular: boolean;
  };
  restaurantId: number;
}

export default function MenuItem({ item, restaurantId }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { state } = useStore();
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: () => api.addToCart({
      userId: state.user?.id || 1, // Default to user 1 for demo
      menuItemId: item.id,
      quantity,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${state.user?.id || 1}`] });
      toast({
        title: "Added to cart!",
        description: `${item.name} has been added to your cart.`,
      });
      setIsAdding(false);
      setQuantity(1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAdding) {
      setIsAdding(true);
    } else {
      addToCartMutation.mutate();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={item.image || "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            {item.isPopular && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <Flame className="h-3 w-3" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-800">{item.name}</h4>
              {item.isPopular && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Popular
                </Badge>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">₱{item.price}</span>
              
              {!isAdding ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={!item.isAvailable}
                  size="sm"
                  className="bg-maroon-600 hover:bg-maroon-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium text-sm w-8 text-center">{quantity}</span>
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    size="sm"
                    className="bg-maroon-600 hover:bg-maroon-700 text-white ml-2"
                  >
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
