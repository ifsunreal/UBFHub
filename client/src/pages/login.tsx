import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { signIn, signUp, createDocument, getDocument, onAuthStateChange } from "@/lib/firebase";
import { createInitialAccounts } from "@/lib/create-admin-accounts";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"social" | "email">("social");

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

  // Check for existing user authentication
  useEffect(() => {
    createInitialAccounts();

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocument("users", firebaseUser.uid);
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() };
            dispatch({ type: "SET_USER", payload: userData });
            
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

  useEffect(() => {
    if (state.user) {
      const role = state.user.role;
      if (role === 'admin') {
        setLocation("/admin");
      } else if (role === 'stall_owner') {
        setLocation("/stall-dashboard");
      } else {
        setLocation("/");
      }
    }
  }, [state.user, setLocation]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await signIn(loginData.email, loginData.password);
      const firebaseUser = userCredential.user;
      
      const userDoc = await getDocument("users", firebaseUser.uid);
      if (userDoc.exists()) {
        const userData = { id: firebaseUser.uid, ...userDoc.data() };
        dispatch({ type: "SET_USER", payload: userData });
        
        toast({
          title: "Welcome back!",
          description: `Hello, ${userData.fullName}!`,
        });

        const role = userData.role;
        if (role === 'admin') {
          setLocation("/admin");
        } else if (role === 'stall_owner') {
          setLocation("/stall-dashboard");
        } else {
          setLocation("/");
        }
      } else {
        toast({
          title: "Account Setup Required",
          description: "Please complete your account setup.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Please check your credentials.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await signUp(registerData.email, registerData.password);
      const firebaseUser = userCredential.user;
      
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
        description: `Welcome to UB FoodHub, ${registerData.fullName}!`,
      });
      
      if (registerData.role === 'admin') {
        setLocation("/admin");
      } else if (registerData.role === 'stall_owner') {
        setLocation("/stall-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Coming Soon",
      description: "Google sign-in will be available soon!",
    });
  };

  if (authMode === "social") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maroon-500 via-maroon-600 to-maroon-700 flex flex-col">
        {/* Hero Section with Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="w-32 h-32 mb-8"
          >
            <img 
              src="/logo.png" 
              alt="UB FoodHub Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-3">UB FoodHub</h1>
            <p className="text-maroon-100 text-lg">Your campus dining companion</p>
          </motion.div>
        </motion.div>

        {/* Bottom Sign-in Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-t-3xl px-6 py-8 shadow-2xl"
        >
          <div className="max-w-sm mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign up or log in</h2>
              <p className="text-gray-600 mb-8">Select your preferred method to continue</p>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-4 rounded-xl shadow-sm transition-all"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Button
                  onClick={() => setAuthMode("email")}
                  className="w-full bg-maroon-600 hover:bg-maroon-700 text-white py-4 rounded-xl shadow-sm transition-all"
                  disabled={isLoading}
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Continue with email
                </Button>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="text-xs text-gray-500 text-center mt-6"
            >
              By signing up you agree to our Terms and Conditions and Privacy Policy.
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <Button
              onClick={() => setAuthMode("social")}
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 text-gray-500"
            >
              ← Back
            </Button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mx-auto w-20 h-20 mb-4"
            >
              <img 
                src="/logo.png" 
                alt="UB FoodHub Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <CardTitle className="text-2xl font-bold text-maroon-800">
                Email Sign In
              </CardTitle>
              <p className="text-maroon-600 text-sm mt-2">
                Enter your email and password
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
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
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-maroon-600 hover:bg-maroon-700 transition-colors"
                    disabled={isLoading}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center space-x-2"
                        >
                          <Spinner size="sm" />
                          <span>Signing in...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="sign-in"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Sign In
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>

              {/* Register Form */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-center mb-4">Or create new account</h3>
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
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
                        disabled={isLoading}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
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
                        disabled={isLoading}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="registerPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="studentId">Student ID (Optional)</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="studentId"
                        placeholder="Enter your student ID"
                        className="pl-10"
                        value={registerData.studentId}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, studentId: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}
                      disabled={isLoading}
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
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-maroon-600 hover:bg-maroon-700 transition-colors"
                      disabled={isLoading}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center space-x-2"
                          >
                            <Spinner size="sm" />
                            <span>Creating account...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="create"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Create Account
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}