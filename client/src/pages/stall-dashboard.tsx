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
  Save
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
// Firebase imports removed - using backend API instead

export default function StallDashboard() {
  const { state } = useStore();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stallInfo, setStallInfo] = useState<any>(null);
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
    image: ""
  });

  useEffect(() => {
    if (state.user?.id) {
      // Get stall information
      getDocument("stalls", state.user.id).then((doc) => {
        if (doc.exists()) {
          setStallInfo({ id: doc.id, ...doc.data() });
        }
      });

      // Subscribe to menu items for this stall
      const unsubscribeMenuItems = subscribeToQuery(
        "menuItems", 
        "stallId", 
        "==", 
        state.user.id, 
        setMenuItems
      );

      // Subscribe to orders for this stall
      const unsubscribeOrders = subscribeToQuery(
        "orders", 
        "stallId", 
        "==", 
        state.user.id, 
        setOrders
      );

      return () => {
        unsubscribeMenuItems();
        unsubscribeOrders();
      };
    }
  }, [state.user?.id]);

  const handleSaveMenuItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const menuItemData = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        stallId: state.user?.id,
      };

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
      setItemForm({
        name: "",
        description: "",
        price: "",
        category: "Main Course",
        isAvailable: true,
        isPopular: false,
        image: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
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

  const openEditDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        category: item.category || "Main Course",
        isAvailable: item.isAvailable ?? true,
        isPopular: item.isPopular ?? false,
        image: item.image || ""
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        category: "Main Course",
        isAvailable: true,
        isPopular: false,
        image: ""
      });
    }
    setIsMenuDialogOpen(true);
  };

  // Calculate dashboard stats
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt?.seconds * 1000 || Date.now());
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'preparing');

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "menu", label: "Menu", icon: Package },
    { id: "orders", label: "Orders", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm sticky top-0 z-40"
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900">Stall Dashboard</h1>
          <p className="text-sm text-gray-600">{stallInfo?.name || "Your Food Stall"}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-maroon-600 text-maroon-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="p-4 space-y-6 pb-24">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Today's Revenue</p>
                      <p className="text-xl font-bold">₱{todayRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Today's Orders</p>
                      <p className="text-xl font-bold">{todayOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Orders</p>
                      <p className="text-xl font-bold">{pendingOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Menu Items</p>
                      <p className="text-xl font-bold">{menuItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Order {order.qrCode}</p>
                        <p className="text-sm text-gray-600">₱{order.totalAmount?.toFixed(2)}</p>
                      </div>
                      <Badge
                        className={
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
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
              <h2 className="text-lg font-semibold">Menu Items</h2>
              <Button onClick={() => openEditDialog()} className="bg-maroon-600 hover:bg-maroon-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.isPopular && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">₱{item.price}</span>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleItemAvailability(item.id, item.isAvailable)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
            <h2 className="text-lg font-semibold">Orders</h2>
            
            <div className="space-y-3">
              <AnimatePresence>
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Order {order.qrCode}</h3>
                        <p className="text-sm text-gray-600">
                          {order.createdAt ? 
                            new Date(order.createdAt.seconds * 1000).toLocaleString() : 
                            'Just now'
                          }
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
                        {order.status}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium">Items:</p>
                      <div className="text-sm text-gray-600">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx}>
                            {item.quantity}x {item.name || `Item ${idx + 1}`}
                            {item.customizations && (
                              <span className="text-xs text-gray-500"> ({item.customizations})</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="font-semibold mt-2">Total: ₱{order.totalAmount?.toFixed(2)}</p>
                    </div>

                    {order.specialInstructions && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Special instructions: </span>
                        {order.specialInstructions}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Stall Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Stall Name</Label>
                  <Input value={stallInfo?.name || ""} placeholder="Enter stall name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={stallInfo?.description || ""} placeholder="Enter stall description" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={stallInfo?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Filipino">Filipino</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Western">Western</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-maroon-600 hover:bg-maroon-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Menu Item Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Item Name *</Label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Enter item description"
              />
            </div>

            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
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

            <div>
              <Label>Image URL</Label>
              <Input
                value={itemForm.image}
                onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch
                checked={itemForm.isAvailable}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, isAvailable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mark as Popular</Label>
              <Switch
                checked={itemForm.isPopular}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, isPopular: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsMenuDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMenuItem}
                className="flex-1 bg-maroon-600 hover:bg-maroon-700"
              >
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}