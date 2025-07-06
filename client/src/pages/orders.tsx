import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, CheckCircle, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import BottomNav from "@/components/layout/bottom-nav";
import QRCode from "@/components/qr-code";
import type { OrderWithDetails } from "@/types";

export default function Orders() {
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const { state } = useStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: [`/api/orders/${state.user?.id}`],
    enabled: !!state.user?.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "preparing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Confirmed";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready for Pickup";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center">
            <button
              onClick={() => setSelectedOrder(null)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Order Tracking</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Order Status */}
          <div className="text-center">
            <div className="w-16 h-16 bg-maroon-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-8 w-8 text-maroon-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {getStatusText(selectedOrder.status)}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedOrder.status === "preparing" && "Your order is being prepared"}
              {selectedOrder.status === "ready" && "Your order is ready for pickup"}
              {selectedOrder.status === "completed" && "Your order has been completed"}
            </p>
            <p className="text-sm text-maroon-600 font-medium mt-2">
              Estimated time: {selectedOrder.estimatedTime || "15-20 minutes"}
            </p>
          </div>

          {/* Order Details */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium text-gray-800 mb-2">Order #{selectedOrder.qrCode}</h4>
              <div className="text-sm text-gray-600">
                <p>{selectedOrder.restaurant?.name}</p>
                <p>{selectedOrder.items?.length} items • ₱{selectedOrder.totalAmount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium text-gray-800 mb-3">Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.menuItem?.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">₱{item.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <QRCode value={selectedOrder.qrCode || ""} size={128} />
                <p className="text-sm text-gray-600 mt-2">
                  Show this QR code for pickup
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              <span className="mr-2">📞</span>
              Call Stall
            </Button>
            <Button className="flex-1 bg-maroon-600 hover:bg-maroon-700">
              <span className="mr-2">💬</span>
              Message
            </Button>
          </div>
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
          <h1 className="text-lg font-semibold">Your Orders</h1>
        </div>
      </header>

      {/* Orders List */}
      <div className="p-4 space-y-4 pb-20">
        {orders?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              When you place an order, you'll see it here
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-maroon-600 hover:bg-maroon-700"
            >
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-gray-800 mb-4">Recent Orders</h2>
            {orders?.map((order: OrderWithDetails) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800">{order.restaurant?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Order #{order.qrCode} • {order.items?.length} items
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-maroon-600">₱{order.totalAmount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
