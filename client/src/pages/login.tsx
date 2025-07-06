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
import ubLogo from "@assets/ub foodhub logo2_1751779151057.png";

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
        toast({ title: "Welcome Admin!", description: "Successfully logged in as administrator." });
        setLocation("/admin");
        return;
      }
      
      if (loginData.email === "canteen@foodhub.com" && loginData.password === "stall123") {
        const userData = {
          id: "stall-owner-001",
          email: "canteen@foodhub.com",
          fullName: "Food Stall Owner",
          role: "stall_owner",
          loyaltyPoints: 0,
        };
        dispatch({ type: "SET_USER", payload: userData });
        toast({ title: "Welcome Stall Owner!", description: "Successfully logged in to manage your stall." });
        setLocation("/stall-dashboard");
        return;
      }

      // For other users, use Firebase authentication
      const userCredential = await signIn(loginData.email, loginData.password);
      const userDoc = await getDocument("users", userCredential.user.uid);
      
      if (userDoc.exists()) {
        const userData = { id: userCredential.user.uid, ...userDoc.data() };
        dispatch({ type: "SET_USER", payload: userData });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Route based on user role
        const role = userData.role;
        if (role === 'admin') {
          setLocation("/admin");
        } else if (role === 'stall_owner') {
          setLocation("/stall-dashboard");
        } else {
          setLocation("/");
        }
      } else {
        throw new Error("User profile not found");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
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
      
      // Create user profile in Firestore
      const userProfile = {
        email: registerData.email,
        fullName: registerData.fullName,
        studentId: registerData.studentId || null,
        role: registerData.role,
        loyaltyPoints: 0,
      };
      
      await createDocument("users", userCredential.user.uid, userProfile);
      
      const userData = { id: userCredential.user.uid, ...userProfile };
      dispatch({ type: "SET_USER", payload: userData });
      
      toast({
        title: "Account created!",
        description: "Welcome to UB FoodHub.",
      });

      // Route based on user role
      const role = registerData.role;
      if (role === 'admin') {
        setLocation("/admin");
      } else if (role === 'stall_owner') {
        setLocation("/stall-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-500 to-maroon-700 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <img src={ubLogo} alt="UB FoodHub" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">UB FoodHub</h1>
          <p className="text-maroon-100">University of Batangas Food Ordering System</p>
          
          {/* Quick Login Buttons */}
          <div className="mt-4 space-y-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-maroon-100"
            >
              Quick Login:
            </motion.div>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  setLoginData({ email: "admin@foodhub.com", password: "admin123" });
                }}
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  setLoginData({ email: "canteen@foodhub.com", password: "stall123" });
                }}
              >
                Stall Owner
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-maroon-700">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-maroon-700">
                Register
              </TabsTrigger>
            </TabsList>

          <TabsContent value="login">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-maroon-700 flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Welcome Back
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-maroon-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@ub.edu.ph"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="border-maroon-200 focus:border-maroon-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-maroon-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="border-maroon-200 focus:border-maroon-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-maroon-600 hover:bg-maroon-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-maroon-700 flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Join UB FoodHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-maroon-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                      className="border-maroon-200 focus:border-maroon-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-maroon-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="student@ub.edu.ph"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="border-maroon-200 focus:border-maroon-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-maroon-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="border-maroon-200 focus:border-maroon-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-maroon-700">Role</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                    >
                      <SelectTrigger className="border-maroon-200 focus:border-maroon-500">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="stall_owner">Stall Owner</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {registerData.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-maroon-700 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Student ID (Optional)
                      </Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="2024-12345"
                        value={registerData.studentId}
                        onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                        className="border-maroon-200 focus:border-maroon-500"
                      />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-maroon-600 hover:bg-maroon-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}