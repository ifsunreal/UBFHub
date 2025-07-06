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

import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"social" | "email">("social");
  const [isSignUp, setIsSignUp] = useState(false);

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
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocument("users", firebaseUser.uid);
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as any;
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
      <div className="min-h-screen bg-gradient-to-br from-maroon-800 via-maroon-900 to-red-900 flex flex-col">
        {/* Hero Section with Logo and Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative min-h-0 bg-[#6d031e] overflow-hidden">
          {/* Liquid glass background effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3 backdrop-blur-sm"></div>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.1, 1, 1.1],
                rotate: [360, 0],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gradient-to-tl from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-full blur-2xl"
            />
          </div>

          {/* Floating particles from bottom */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white/25 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                  y: typeof window !== "undefined" ? window.innerHeight + 50 : 700,
                  scale: 0,
                }}
                animate={{
                  y: -100,
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 0.8, 0.3, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              y: [0, -10, 0],
            }}
            transition={{ 
              delay: 0.3, 
              duration: 0.6, 
              type: "spring",
              y: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            className="w-24 h-24 mb-6 relative z-10"
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
            className="text-center mb-8 relative z-20"
          >
            <h1 className="text-3xl font-bold text-white mb-2">UB FoodHub</h1>
            <p className="text-red-100 text-lg font-medium">Your campus dining companion</p>
          </motion.div>
        </div>
        {/* Bottom Sign-in Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-maroon-900/50 backdrop-blur-sm border-t border-red-700/30 rounded-t-3xl px-6 py-6 shadow-2xl max-h-[60vh] overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2 text-[#6d031e]">Sign up or log in</h2>
            <p className="text-[#ae0a33] font-normal">Select your preferred method to continue</p>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-white/90 border border-red-300/50 text-gray-800 hover:bg-white py-4 rounded-xl shadow-sm transition-all"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Button
                onClick={() => setAuthMode("email")}
                className="w-full text-white py-4 rounded-xl shadow-sm transition-all"
                style={{ backgroundColor: '#6d031e' }}
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
            className="text-xs text-center mt-8 text-[#6d031e] font-bold"
          >
            By signing up you agree to our Terms and Conditions and Privacy Policy.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-800 via-maroon-900 to-red-900 flex flex-col">
      {/* Header with Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative min-h-0 bg-[#6d031e] overflow-hidden">
        {/* Liquid glass background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3 backdrop-blur-sm"></div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/8 via-purple-500/8 to-blue-500/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 0],
              opacity: [0.15, 0.05, 0.15],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gradient-to-tl from-red-500/8 via-orange-500/8 to-yellow-500/8 rounded-full blur-2xl"
          />
        </div>

        {/* Floating particles from bottom */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                y: typeof window !== "undefined" ? window.innerHeight + 50 : 700,
                scale: 0,
              }}
              animate={{
                y: -100,
                scale: [0, 1, 0.5, 0],
                opacity: [0, 0.7, 0.3, 0],
              }}
              transition={{
                duration: 3.5 + Math.random() * 2.5,
                repeat: Infinity,
                delay: Math.random() * 2.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <Button
          onClick={() => setAuthMode("social")}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 text-red-100 hover:text-white hover:bg-white/10 z-10"
        >
          ← Back
        </Button>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{ 
            delay: 0.2, 
            duration: 0.3,
            y: {
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          className="w-28 h-28 mx-auto mb-4 flex items-center justify-center relative z-10"
        >
          <img 
            src="/logo.png" 
            alt="UB FoodHub Logo" 
            className="w-24 h-24 object-contain"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center relative z-20"
        >
          <h2 className="text-xl font-bold text-white mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-red-100 text-sm">
            {isSignUp ? "Join UB FoodHub today" : "Sign in to your account"}
          </p>
        </motion.div>
      </div>
      {/* Bottom Form Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-maroon-900/50 backdrop-blur-sm border-t border-red-700/30 rounded-t-3xl px-6 py-6 shadow-2xl max-h-[65vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailLogin}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#6d031e] font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] h-12 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#6d031e] font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] h-12 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#6d031e]/60 hover:text-[#6d031e]"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-white h-12 rounded-xl font-medium"
                style={{ backgroundColor: '#6d031e' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-[#6d031e] font-normal">
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="hover:text-white font-bold text-[#6d031e]"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailRegister}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-medium" style={{ color: '#6d031e' }}>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      className="pl-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] py-3 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail" className="text-[#6d031e] font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] py-3 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-[#6d031e] font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="registerPassword"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 characters)"
                      className="pl-10 pr-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] py-3 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3 text-[#6d031e]/60 hover:text-[#6d031e]"
                      disabled={isLoading}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-[#6d031e] font-medium">Student ID (Optional)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-[#6d031e]/60" />
                    <Input
                      id="studentId"
                      placeholder="Enter your student ID"
                      className="pl-10 bg-white border-[#6d031e]/20 focus:border-[#6d031e] py-3 text-[#6d031e] placeholder:text-[#6d031e]/40"
                      value={registerData.studentId}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, studentId: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[#6d031e] font-medium">Role</Label>
                  <Select 
                    value={registerData.role} 
                    onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white border-[#6d031e]/20 focus:border-[#6d031e] py-3 text-[#6d031e]">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="stall_owner">Stall Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#6d031e] hover:bg-red-700 text-white py-4 rounded-xl text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-[#6d031e]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="hover:text-white font-bold text-[#6d031e]"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}