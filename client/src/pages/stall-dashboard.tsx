import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { subscribeToQuery, addDocument, updateDocument, deleteDocument, getDocument } from "@/lib/firebase";
import { logOut } from "@/lib/firebase";
import { useLocation } from "wouter";
import { Store, Plus, Edit, Trash2, LogOut, Package, DollarSign, Clock, Star } from "lucide-react";

export default function StallDashboard() {
  const { state } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [stall, setStall] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStall, setEditingStall] = useState(false);

  // New menu item form
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
    isPopular: false,
    customizations: [] as string[],
  });

  // Stall edit form
  const [stallInfo, setStallInfo] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (state.user?.id) {
      // Find the stall owned by this user
      getDocument("stalls", state.user.id).then((doc) => {
        if (doc.exists()) {
          const stallData = { id: doc.id, ...doc.data() };
          setStall(stallData);
          setStallInfo({ name: stallData.name, description: stallData.description });
        }
      });

      // Subscribe to menu items and orders for this stall
      const unsubscribeMenuItems = subscribeToQuery("menuItems", "stallId", "==", state.user.id, setMenuItems);
      const unsubscribeOrders = subscribeToQuery("orders", "stallId", "==", state.user.id, setOrders);

      return () => {
        unsubscribeMenuItems();
        unsubscribeOrders();
      };
    }
  }, [state.user?.id]);

  const handleLogout = async () => {
    try {
      await logOut();
      setLocation("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateStall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stall?.id) return;

    setIsLoading(true);
    try {
      await updateDocument("stalls", stall.id, stallInfo);
      setStall({ ...stall, ...stallInfo });
      setEditingStall(false);
      toast({
        title: "Stall updated successfully",
        description: "Your stall information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating stall",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stall?.id) return;

    setIsLoading(true);
    try {
      await addDocument("menuItems", {
        ...newMenuItem,
        stallId: stall.id,
        price: parseFloat(newMenuItem.price),
      });

      toast({
        title: "Menu item created successfully",
        description: "The new menu item has been added to your stall.",
      });

      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        category: "",
        isAvailable: true,
        isPopular: false,
        customizations: [],
      });
    } catch (error: any) {
      toast({
        title: "Error creating menu item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItemAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      await updateDocument("menuItems", itemId, { isAvailable: !currentAvailability });
      toast({
        title: "Item availability updated",
        description: `Item has been ${!currentAvailability ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await deleteDocument("menuItems", itemId);
      toast({
        title: "Menu item deleted",
        description: "The menu item has been removed from your stall.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDocument("orders", orderId, { status: newStatus });
      toast({
        title: "Order status updated",
        description: `Order has been marked as ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalMenuItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.isAvailable).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-maroon-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">{stall?.name || "Stall Dashboard"}</h1>
              <p className="text-maroon-100">Welcome, {state.user?.fullName}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-maroon-700">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!stall ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No stall assigned to your account. Please contact an administrator.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-maroon-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Menu Items</p>
                      <p className="text-2xl font-bold text-gray-900">{totalMenuItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-maroon-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available Items</p>
                      <p className="text-2xl font-bold text-gray-900">{availableItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-maroon-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-maroon-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="stall" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stall">Stall Info</TabsTrigger>
                <TabsTrigger value="menu">Menu Management</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="stall" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Stall Information</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingStall(!editingStall)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {editingStall ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {editingStall ? (
                      <form onSubmit={handleUpdateStall} className="space-y-4">
                        <div>
                          <Label htmlFor="stallName">Stall Name</Label>
                          <Input
                            id="stallName"
                            value={stallInfo.name}
                            onChange={(e) => setStallInfo({ ...stallInfo, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stallDescription">Description</Label>
                          <Textarea
                            id="stallDescription"
                            value={stallInfo.description}
                            onChange={(e) => setStallInfo({ ...stallInfo, description: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading} className="bg-maroon-600 hover:bg-maroon-700">
                          {isLoading ? "Updating..." : "Update Stall"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">{stall.name}</h3>
                          <p className="text-gray-600">{stall.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{stall.category}</Badge>
                          <Badge variant={stall.isActive ? "default" : "secondary"}>
                            {stall.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="menu" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Menu Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateMenuItem} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                            placeholder="Adobo Rice Bowl"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price (₱)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                            placeholder="120.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="itemDescription">Description</Label>
                        <Textarea
                          id="itemDescription"
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                          placeholder="Tender pork adobo served with steamed rice"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemCategory">Category</Label>
                        <Select
                          value={newMenuItem.category}
                          onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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
                      <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="available"
                            checked={newMenuItem.isAvailable}
                            onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, isAvailable: checked })}
                          />
                          <Label htmlFor="available">Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="popular"
                            checked={newMenuItem.isPopular}
                            onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, isPopular: checked })}
                          />
                          <Label htmlFor="popular">Popular Item</Label>
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading} className="bg-maroon-600 hover:bg-maroon-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {isLoading ? "Adding..." : "Add Menu Item"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">₱{item.price}</Badge>
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                              {item.isPopular && <Badge variant="destructive">Popular</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={item.isAvailable ? "secondary" : "default"}
                              size="sm"
                              onClick={() => handleToggleItemAvailability(item.id, item.isAvailable)}
                            >
                              {item.isAvailable ? "Disable" : "Enable"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {item.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">Total: ₱{order.totalAmount}</p>
                            <p className="text-xs text-gray-500">
                              {order.createdAt && new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'preparing' ? 'secondary' :
                              order.status === 'ready' ? 'default' : 'destructive'
                            }>
                              {order.status}
                            </Badge>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                className="bg-maroon-600 hover:bg-maroon-700"
                              >
                                Start Preparing
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}