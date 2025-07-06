import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, QrCode, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { subscribeToQuery, updateDocument, deleteDocument } from "@/lib/firebase";
import BottomNav from "@/components/layout/bottom-nav";
import QRCode from "@/components/qr-code";

const orderStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
    label: "Order confirmed",
    description: "Your order is being prepared"
  },
  preparing: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="w-4 h-4" />,
    label: "Preparing",
    description: "Chef is cooking your order"
  },
  ready: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Ready for pickup",
    description: "Your order is ready!"
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Completed",
    description: "Order delivered successfully"
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    label: "Cancelled",
    description: "Order was cancelled"
  }
};

export default function Orders() {
  const [, setLocation] = useLocation();
  const { state } = useStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.user?.id) {
      const unsubscribe = subscribeToQuery("orders", "userId", "==", state.user.id, (fetchedOrders) => {
        // Sort orders by creation date, newest first
        const sortedOrders = fetchedOrders.sort((a, b) => 
          new Date(b.createdAt?.seconds * 1000 || Date.now()).getTime() - 
          new Date(a.createdAt?.seconds * 1000 || Date.now()).getTime()
        );
        setOrders(sortedOrders);
      });
      return () => unsubscribe();
    }
  }, [state.user?.id]);

  const cancelOrder = async (orderId: string) => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      await updateDocument("orders", orderId, { 
        status: "cancelled",
        cancelledAt: new Date()
      });
      
      toast({
        title: "Order cancelled",
        description: "Your order has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showQRCode = (order: any) => {
    setSelectedOrder(order);
    setShowQRDialog(true);
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center p-4 bg-[#820d2a]">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-[#ffffff]">My Orders</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 text-center mb-6">When you place an order, it will appear here</p>
          <Button onClick={() => setLocation("/")} className="bg-[#6d031e] hover:bg-red-700">
            Start Ordering
          </Button>
        </div>
        <BottomNav />
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
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="mr-3 text-white hover:bg-red-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">My Orders</h1>
        </div>
      </motion.div>

      <div className="p-4 space-y-4 pb-24">
        <AnimatePresence>
          {orders.map((order, index) => {
            const statusConfig = orderStatusConfig[order.status as keyof typeof orderStatusConfig] || orderStatusConfig.pending;
            const canCancel = order.status === 'pending' || order.status === 'preparing';
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Order {order.qrCode}</h3>
                    <p className="text-sm text-gray-600">
                      {order.createdAt ? 
                        new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Just now'
                      }
                    </p>
                  </div>
                  <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Status Timeline */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="font-medium text-sm">{statusConfig.description}</span>
                  </div>
                  
                  {order.status === 'ready' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2"
                    >
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Ready for pickup!</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Show QR code to the stall owner for pickup</p>
                    </motion.div>
                  )}

                  {order.status === 'pending' && (
                    <div className="text-xs text-gray-600">
                      Estimated time: {order.estimatedTime || "25-40 mins"}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="border-t pt-3 mb-4">
                  <div className="space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name || `Item ${idx + 1}`}</span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold text-sm mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>₱{order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === 'ready' || order.status === 'preparing' ? (
                    <Button
                      onClick={() => showQRCode(order)}
                      className="flex-1 bg-[#6d031e] hover:bg-red-700 text-white"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR Code
                    </Button>
                  ) : null}
                  
                  {canCancel && (
                    <Button
                      variant="outline"
                      onClick={() => cancelOrder(order.id)}
                      disabled={isLoading}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                  
                  {order.status === 'completed' && (
                    <Button
                      variant="outline"
                      onClick={() => setLocation(`/restaurant/${order.stallId}`)}
                      className="flex-1"
                    >
                      Reorder
                    </Button>
                  )}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <span className="font-medium">Special instructions: </span>
                    {order.specialInstructions}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm mx-auto">
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Order QR Code</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-1">Order {selectedOrder.qrCode}</h3>
                  <p className="text-sm text-gray-600">Show this QR code for pickup</p>
                </div>

                <div className="flex justify-center bg-white p-6 rounded-lg border">
                  <QRCode value={selectedOrder.qrCode} size={200} />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">Pickup Instructions</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Present this QR code to the stall owner when collecting your order.
                  </p>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Order Total:</span>
                    <span className="font-medium">₱{selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{selectedOrder.status}</span>
                  </div>
                  {selectedOrder.estimatedTime && (
                    <div className="flex justify-between">
                      <span>Est. Time:</span>
                      <span className="font-medium">{selectedOrder.estimatedTime}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setShowQRDialog(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}