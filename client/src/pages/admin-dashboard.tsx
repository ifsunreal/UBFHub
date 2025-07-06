import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, getCollection } from "@/lib/firebase";
import { logOut } from "@/lib/firebase";
import { useLocation } from "wouter";
import { Users, Store, Plus, Edit, Trash2, LogOut, Settings, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { state } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [stalls, setStalls] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New stall form
  const [newStall, setNewStall] = useState({
    name: "",
    description: "",
    category: "",
    ownerId: "",
    isActive: true,
  });

  useEffect(() => {
    // Subscribe to real-time data
    const unsubscribeUsers = subscribeToCollection("users", setUsers);
    const unsubscribeStalls = subscribeToCollection("stalls", setStalls);
    const unsubscribeOrders = subscribeToCollection("orders", setOrders);

    return () => {
      unsubscribeUsers();
      unsubscribeStalls();
      unsubscribeOrders();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      setLocation("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateStall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addDocument("stalls", {
        ...newStall,
        rating: 0,
        reviewCount: 0,
        deliveryTime: "15-30 min",
        priceRange: "₱50-200",
        deliveryFee: "₱10",
      });

      toast({
        title: "Stall created successfully",
        description: "The new food stall has been added to the system.",
      });

      setNewStall({
        name: "",
        description: "",
        category: "",
        ownerId: "",
        isActive: true,
      });
    } catch (error: any) {
      toast({
        title: "Error creating stall",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStallStatus = async (stallId: string, currentStatus: boolean) => {
    try {
      await updateDocument("stalls", stallId, { isActive: !currentStatus });
      toast({
        title: "Stall status updated",
        description: `Stall has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating stall",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDocument("users", userId);
      toast({
        title: "User deleted",
        description: "User account has been removed from the system.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stallOwners = users.filter(user => user.role === 'stall_owner');
  const totalUsers = users.length;
  const totalStalls = stalls.length;
  const totalOrders = orders.length;
  const activeStalls = stalls.filter(stall => stall.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-maroon-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-maroon-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-maroon-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stalls</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-maroon-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Stalls</p>
                  <p className="text-2xl font-bold text-gray-900">{activeStalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-maroon-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="stalls">Stalls Management</TabsTrigger>
            <TabsTrigger value="orders">Orders Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{user.fullName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'stall_owner' ? 'default' : 'secondary'}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {user.studentId && (
                            <Badge variant="outline">ID: {user.studentId}</Badge>
                          )}
                        </div>
                      </div>
                      {user.role !== 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.fullName}'s account? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stalls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Stall</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStall} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stallName">Stall Name</Label>
                      <Input
                        id="stallName"
                        value={newStall.name}
                        onChange={(e) => setNewStall({ ...newStall, name: e.target.value })}
                        placeholder="Food Paradise"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newStall.category}
                        onValueChange={(value) => setNewStall({ ...newStall, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Filipino">Filipino</SelectItem>
                          <SelectItem value="Asian">Asian</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newStall.description}
                      onChange={(e) => setNewStall({ ...newStall, description: e.target.value })}
                      placeholder="Authentic Filipino dishes with a modern twist"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner">Assign Owner</Label>
                    <Select
                      value={newStall.ownerId}
                      onValueChange={(value) => setNewStall({ ...newStall, ownerId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stall owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {stallOwners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.fullName} ({owner.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-maroon-600 hover:bg-maroon-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Stall"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Stalls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stalls.map((stall) => (
                    <div key={stall.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{stall.name}</h3>
                        <p className="text-sm text-gray-600">{stall.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{stall.category}</Badge>
                          <Badge variant={stall.isActive ? "default" : "secondary"}>
                            {stall.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={stall.isActive ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleToggleStallStatus(stall.id, stall.isActive)}
                        >
                          {stall.isActive ? "Deactivate" : "Activate"}
                        </Button>
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
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Total: ₱{order.totalAmount}</p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt && new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'preparing' ? 'secondary' :
                        order.status === 'ready' ? 'default' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}