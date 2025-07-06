import { Home, Search, ShoppingCart, Receipt, User } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { state } = useStore();

  const { data: cartItems } = useQuery({
    queryKey: [`/api/cart/${state.user?.id}`],
    enabled: !!state.user?.id,
  });

  const cartCount = cartItems?.length || 0;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: Receipt, label: "Orders", path: "/orders" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-gray-200 px-4 py-2 w-full max-w-md">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center py-2 px-3 relative ${
              location === item.path
                ? "text-maroon-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
