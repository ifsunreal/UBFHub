import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Heart, Search, Star, Clock, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import MenuItem from "@/components/menu-item";
import FloatingCart from "@/components/floating-cart";
import { useToast } from "@/hooks/use-toast";

export default function Restaurant() {
  const [, params] = useRoute("/restaurant/:id");
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  const restaurantId = params?.id ? parseInt(params.id) : 0;

  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: [`/api/restaurants/${restaurantId}`],
    enabled: !!restaurantId,
  });

  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: [`/api/restaurants/${restaurantId}/menu`],
    enabled: !!restaurantId,
  });

  const categories = menuItems ? Array.from(new Set(menuItems.map((item: any) => item.category))) : [];
  const popularItems = menuItems?.filter((item: any) => item.isPopular) || [];

  const filteredItems = menuItems?.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Popular" 
      ? item.isPopular 
      : item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Removed from favorites" : "Added to favorites",
      description: `${restaurant?.name} has been ${liked ? "removed from" : "added to"} your favorites.`,
    });
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="relative h-48">
          <img
            src={restaurant?.image || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
            alt={restaurant?.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setLocation("/")}
            className="absolute top-4 left-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleLike}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
          >
            <Heart className={`h-5 w-5 ${liked ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{restaurant?.name}</h1>
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 font-medium text-gray-700">{restaurant?.rating}</span>
            <span className="text-gray-500 ml-1">({restaurant?.reviewCount}+ reviews)</span>
          </div>
          <p className="text-gray-600 mb-3">{restaurant?.deliveryTime} • {restaurant?.priceRange} • {restaurant?.category}</p>
          <div className="flex space-x-2">
            <Badge className="bg-maroon-50 text-maroon-800 border-maroon-200">
              <Percent className="h-3 w-3 mr-1" />
              10% cashback
            </Badge>
            <Badge className="bg-green-50 text-green-800 border-green-200">
              <Clock className="h-3 w-3 mr-1" />
              Fast delivery
            </Badge>
          </div>
        </div>

        {/* Menu Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-maroon-500"
            />
          </div>
        </div>

        {/* Menu Categories */}
        <div className="px-4 py-2 border-b">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveCategory("Popular")}
              className={`text-sm pb-2 border-b-2 whitespace-nowrap ${
                activeCategory === "Popular"
                  ? "text-maroon-600 border-maroon-600 font-medium"
                  : "text-gray-600 border-transparent"
              }`}
            >
              Popular
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm pb-2 border-b-2 whitespace-nowrap ${
                  activeCategory === category
                    ? "text-maroon-600 border-maroon-600 font-medium"
                    : "text-gray-600 border-transparent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4 pb-20">
        {activeCategory === "Popular" && popularItems.length > 0 && (
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-red-500 mr-2">🔥</span>
            Popular
          </h3>
        )}
        
        {menuLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems?.map((item: any) => (
              <MenuItem key={item.id} item={item} restaurantId={restaurantId} />
            ))}
          </div>
        )}
      </div>

      <FloatingCart />
    </div>
  );
}
