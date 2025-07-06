import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bell, User, Filter, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/layout/bottom-nav";
import RestaurantCard from "@/components/restaurant-card";
import FloatingCart from "@/components/floating-cart";
import { useStore } from "@/lib/store";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { state } = useStore();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const filteredRestaurants = restaurants?.filter((restaurant: any) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || restaurant.category.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-maroon-800 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-maroon-300" />
            <div>
              <p className="text-sm font-medium">University of Batangas</p>
              <p className="text-xs text-maroon-200">Canteen Area</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                3
              </span>
            </button>
            <div className="w-8 h-8 bg-maroon-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-4 bg-white shadow-sm border-b">
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search restaurants, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-maroon-500 rounded-xl"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveFilter("all")}
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            className="bg-maroon-800 hover:bg-maroon-700 text-white border-maroon-800"
          >
            <Filter className="h-4 w-4 mr-1" />
            All
          </Button>
          <Button
            onClick={() => setActiveFilter("fried chicken")}
            variant={activeFilter === "fried chicken" ? "default" : "outline"}
            size="sm"
            className="text-gray-600 border-gray-300"
          >
            Chicken
          </Button>
          <Button
            onClick={() => setActiveFilter("bbq & grilled")}
            variant={activeFilter === "bbq & grilled" ? "default" : "outline"}
            size="sm"
            className="text-gray-600 border-gray-300"
          >
            BBQ
          </Button>
        </div>
      </div>

      {/* Promo Section */}
      <section className="p-4">
        <div className="bg-gradient-to-r from-maroon-800 to-maroon-600 rounded-xl p-4 text-white mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Save 25%</h3>
              <p className="text-sm text-maroon-100">On your first order</p>
              <p className="text-xs text-maroon-200 mt-1">Valid until 11:59 PM</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                42:58
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Available Stalls</h2>
          <button className="text-maroon-600 font-medium text-sm">View All</button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants?.map((restaurant: any) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      <FloatingCart />
      <BottomNav />
    </div>
  );
}
