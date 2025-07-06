import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle, 
  Package,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Settings,
  Image as ImageIcon,
  Save,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { 
  subscribeToQuery, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  getDocument,
  logOut 
} from "@/lib/firebase";
import { useLocation } from "wouter";

export default function StallDashboard() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stallInfo, setStallInfo] = useState<any>(null);
  const [stallId, setStallId] = useState<string | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    isAvailable: true,
    isPopular: false,
    image: "",
    customizations: [{ name: "", price: 0 }] // For customizations like "Extra Rice +25", "Choice of Rice", etc.
  });

  useEffect(() => {
    if (state.user?.id) {
      // First, check if this user has a stall with their Auth UID as document ID
      getDocument("stalls", state.user.id).then((doc) => {
        if (doc.exists()) {
          const stall = { id: doc.id, ...doc.data() };
          setStallInfo(stall);
          setStallId(doc.id);
          console.log("Found stall with user ID as doc ID:", stall);
        } else {
          console.log("No stall found with user ID as doc ID, searching by ownerId...");
          // If not found, search for stall where ownerId matches the user's Auth UID
          subscribeToQuery("stalls", "ownerId", "==", state.user.id, (stalls) => {
            console.log("Stalls found by ownerId:", stalls);
            if (stalls.length > 0) {
              const stall = stalls[0];
              setStallInfo(stall);
              setStallId(stall.id);
              console.log("Found stall by ownerId:", stall);
            } else {
              console.log("No stall found for user:", state.user.id);
              // Create a stall for this user using their Auth UID as the document ID
              const newStall = {
                name: 'Sulit Chicken - Batangas',
                description: 'Authentic Korean-style fried chicken with Filipino twist',
                category: 'Filipino',
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300',
                rating: 5.0,
                reviewCount: 2000,
                deliveryTime: '15-40 min',
                priceRange: '₱109-299',
                isActive: true,
                deliveryFee: '₱59.00',
                ownerId: state.user.id,
              };
              addDocument('stalls', newStall).then((docRef) => {
                const stallWithId = { id: docRef.id, ...newStall };
                setStallInfo(stallWithId);
                setStallId(docRef.id);
                console.log("Created new stall for user:", state.user.id);
              }).catch((error) => {
                console.error("Error creating stall:", error);
              });
            }
          });
        }
      });
    }
  }, [state.user?.id]);

  // Subscribe to menu items and orders when stallId is available
  useEffect(() => {
    if (stallId) {
      // Subscribe to menu items for this stall
      const unsubscribeMenuItems = subscribeToQuery(
        "menuItems", 
        "stallId", 
        "==", 
        stallId, 
        (items) => {
          console.log("Stall dashboard menu items:", items);
          setMenuItems(items);
        }
      );

      // Subscribe to orders for this stall
      const unsubscribeOrders = subscribeToQuery(
        "orders", 
        "stallId", 
        "==", 
        stallId, 
        setOrders
      );

      return () => {
        unsubscribeMenuItems();
        unsubscribeOrders();
      };
    }
  }, [stallId]);

  const handleSaveMenuItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!stallId) {
      toast({
        title: "Error",
        description: "Stall information not found. Please contact admin to assign a stall to your account.",
        variant: "destructive",
      });
      return;
    }

    try {
      const menuItemData = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        stallId: stallId,
        customizations: itemForm.customizations.filter(c => c.name.trim() !== ""),
        createdAt: new Date()
      };
      
      console.log("Saving menu item with stallId:", stallId);

      if (editingItem) {
        await updateDocument("menuItems", editingItem.id, menuItemData);
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        await addDocument("menuItems", menuItemData);
        toast({
          title: "Success",
          description: "Menu item added successfully",
        });
      }

      setIsMenuDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setItemForm({
      name: "",
      description: "",
      price: "",
      category: "Main Course",
      isAvailable: true,
      isPopular: false,
      image: "",
      customizations: [{ name: "", price: 0 }]
    });
  };

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await updateDocument("menuItems", itemId, { isAvailable: !isAvailable });
      toast({
        title: "Success",
        description: `Item ${!isAvailable ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      await deleteDocument("menuItems", itemId);
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      dispatch({ type: "SET_USER", payload: null });
      setLocation("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDocument("orders", orderId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const addCustomization = () => {
    setItemForm(prev => ({
      ...prev,
      customizations: [...prev.customizations, { name: "", price: 0 }]
    }));
  };

  const updateCustomization = (index: number, field: "name" | "price", value: string | number) => {
    setItemForm(prev => ({
      ...prev,
      customizations: prev.customizations.map((custom, i) => 
        i === index ? { ...custom, [field]: value } : custom
      )
    }));
  };

  const removeCustomization = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      customizations: prev.customizations.filter((_, i) => i !== index)
    }));
  };

  const editMenuItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price?.toString() || "",
      category: item.category || "Main Course",
      isAvailable: item.isAvailable ?? true,
      isPopular: item.isPopular ?? false,
      image: item.image || "",
      customizations: item.customizations && item.customizations.length > 0 
        ? item.customizations 
        : [{ name: "", price: 0 }]
    });
    setIsMenuDialogOpen(true);
  };

  // Calculate stats
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#6d031e] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {stallInfo?.image ? (
              <img 
                src={stallInfo.image} 
                alt={stallInfo.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Stall Dashboard</h1>
              <p className="text-red-100 text-sm">Welcome back, {state.user?.fullName}</p>
              {stallInfo && (
                <div className="mt-1">
                  <p className="text-white text-sm font-medium">{stallInfo.name}</p>
                  <p className="text-red-200 text-xs">{stallInfo.description}</p>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:bg-red-700 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "menu", label: "Menu", icon: Package },
              { id: "orders", label: "Orders", icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#6d031e] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-[#6d031e]" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">₱{todayRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#6d031e]" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Orders</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{todayOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[#6d031e]" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#6d031e]" />
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Menu Items</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{menuItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#6d031e]">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-white">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order {order.qrCode}</h3>
                          <p className="text-sm text-gray-600">
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                        <Badge
                          className={
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {order.status?.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Order Items */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items Ordered:</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{item.name} x{item.quantity}</p>
                                {item.customizations && item.customizations.length > 0 && (
                                  <p className="text-sm text-gray-600 ml-2">
                                    Add-ons: {item.customizations.map(c => c.name).join(', ')}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-medium">₱{((item.price + (item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Special Instructions:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">{order.specialInstructions}</p>
                        </div>
                      )}

                      {/* Cutlery Info */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Cutlery:</h4>
                        <p className="text-sm text-gray-600">Customer {order.noCutlery ? 'does not need' : 'needs'} cutlery</p>
                      </div>

                      {/* Order Total */}
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Amount:</span>
                        <span className="font-bold text-lg text-[#6d031e]">₱{order.totalAmount?.toFixed(2)}</span>
                      </div>

                      {/* Order Actions */}
                      <div className="flex gap-2 mt-3">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Accept Order
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Complete Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#6d031e]">Menu Management</h2>
              <Button
                onClick={() => {
                  resetForm();
                  setEditingItem(null);
                  setIsMenuDialogOpen(true);
                }}
                className="bg-[#6d031e] text-white hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#6d031e]">{item.name}</h3>
                          {item.isPopular && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold text-gray-900">₱{item.price?.toFixed(2)}</p>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.customizations.map((custom: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {custom.name} {custom.price > 0 ? `+₱${custom.price}` : ''}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleItemAvailability(item.id, item.isAvailable)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editMenuItem(item)}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMenuItem(item.id)}
                          className="text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-[#6d031e]">Order Management</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#6d031e]">Order {order.qrCode}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-gray-900">₱{order.totalAmount?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Menu Item Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#6d031e]">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={itemForm.name}
                onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(value) => setItemForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={itemForm.image}
                onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Customization Options</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomization}
                  className="text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              {itemForm.customizations.map((custom, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Option name (e.g. Choice of Rice, Extra Sauce, etc.)"
                    value={custom.name}
                    onChange={(e) => updateCustomization(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={custom.price}
                    onChange={(e) => updateCustomization(index, "price", parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeCustomization(index)}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={itemForm.isAvailable}
                  onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label htmlFor="available">Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={itemForm.isPopular}
                  onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, isPopular: checked }))}
                />
                <Label htmlFor="popular">Popular</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveMenuItem}
                className="flex-1 bg-[#6d031e] hover:bg-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Item
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsMenuDialogOpen(false)}
                className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}