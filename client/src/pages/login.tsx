import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, GraduationCap } from "lucide-react";
import { signIn, signUp, createDocument, getDocument, onAuthStateChange } from "@/lib/firebase";
import { createInitialAccounts } from "@/lib/create-admin-accounts";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { dispatch } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    fullName: "",
    studentId: "",
    role: "student",
  });

  // Check for existing user authentication and create initial accounts
  useEffect(() => {
    // Create initial accounts on first load
    createInitialAccounts();

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocument("users", firebaseUser.uid);
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() };
            dispatch({ type: "SET_USER", payload: userData });
            
            // Route based on user role
            const role = userData.role;
            if (role === 'admin') {
              setLocation("/admin");
            } else if (role === 'stall_owner') {
              setLocation("/stall-dashboard");
            } else {
              setLocation("/");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Handle specific admin accounts
      if (loginData.email === "admin@foodhub.com" && loginData.password === "admin123") {
        const userData = {
          id: "admin-account-001",
          email: "admin@foodhub.com",
          fullName: "System Administrator",
          role: "admin",
          loyaltyPoints: 0,
        };
        dispatch({ type: "SET_USER", payload: userData });
        setLocation("/admin");
        toast({
          title: "Welcome, Admin!",
          description: "You have successfully logged in as administrator.",
        });
        return;
      }

      if (loginData.email === "canteen@foodhub.com" && loginData.password === "canteen123") {
        const userData = {
          id: "stall-owner-001",
          email: "canteen@foodhub.com",
          fullName: "Food Stall Owner",
          role: "stall_owner",
          loyaltyPoints: 0,
        };
        dispatch({ type: "SET_USER", payload: userData });
        setLocation("/stall-dashboard");
        toast({
          title: "Welcome, Stall Owner!",
          description: "You have successfully logged in to your dashboard.",
        });
        return;
      }

      // Regular Firebase authentication
      const userCredential = await signIn(loginData.email, loginData.password);
      const firebaseUser = userCredential.user;
      
      const userDoc = await getDocument("users", firebaseUser.uid);
      if (userDoc.exists()) {
        const userData = { id: firebaseUser.uid, ...userDoc.data() };
        dispatch({ type: "SET_USER", payload: userData });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await signUp(registerData.email, registerData.password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const userData = {
        email: registerData.email,
        fullName: registerData.fullName,
        studentId: registerData.studentId || null,
        role: registerData.role,
        loyaltyPoints: 0,
      };
      
      await createDocument("users", firebaseUser.uid, userData);
      
      dispatch({ type: "SET_USER", payload: { id: firebaseUser.uid, ...userData } });
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      
      // Route based on role
      if (registerData.role === 'admin') {
        setLocation("/admin");
      } else if (registerData.role === 'stall_owner') {
        setLocation("/stall-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-50 to-maroon-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-maroon-500 to-maroon-700 rounded-full flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">UB</div>
            </div>
            <CardTitle className="text-2xl font-bold text-maroon-800">
              UB FoodHub
            </CardTitle>
            <p className="text-maroon-600 text-sm">
              Your campus dining companion
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-maroon-600 hover:bg-maroon-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>Demo accounts:</p>
                  <p>Admin: admin@foodhub.com / admin123</p>
                  <p>Stall Owner: canteen@foodhub.com / canteen123</p>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID (Optional)</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="studentId"
                        placeholder="Enter your student ID"
                        className="pl-10"
                        value={registerData.studentId}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, studentId: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="stall_owner">Stall Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-maroon-600 hover:bg-maroon-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}