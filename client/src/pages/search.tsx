import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowLeft, Filter, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import BottomNav from "@/components/layout/bottom-nav";
import RestaurantCard from "@/components/restaurant-card";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: restaurants } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = restaurants?.filter((restaurant: any) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(query.toLowerCase())
      ) || [];
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const recentSearches = [
    "Chicken Rice",
    "BBQ",
    "Halo-halo",
    "Adobo",
    "Beverages"
  ];

  const popularCategories = [
    { name: "Fried Chicken", icon: "🍗" },
    { name: "Rice Meals", icon: "🍚" },
    { name: "BBQ & Grilled", icon: "🔥" },
    { name: "Desserts", icon: "🍨" },
    { name: "Beverages", icon: "🥤" },
    { name: "Snacks", icon: "🍿" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search restaurants, food..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-maroon-500"
              autoFocus
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Search Results */}
        {searchQuery ? (
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">
              {isSearching ? "Searching..." : `Results for "${searchQuery}"`}
            </h2>
            
            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((restaurant: any) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try searching for something else or browse our categories
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Searches */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-4">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSearch(search)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800">{search}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-4">Popular Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {popularCategories.map((category, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSearch(category.name)}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <p className="font-medium text-gray-800">{category.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <h2 className="font-semibold text-gray-800 mb-4">Trending Now</h2>
              <div className="space-y-3">
                {restaurants?.slice(0, 3).map((restaurant: any) => (
                  <Card
                    key={restaurant.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600">{restaurant.rating}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{restaurant.category}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
