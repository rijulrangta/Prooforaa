import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      console.log('[Login] Starting login request for:', email);
      
      const requestBody = { email, password };
      console.log('[Login] Request payload:', { email, password: '***' });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log('[Login] Response status:', response.status);
      console.log('[Login] Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
          console.log('[Login] Response data:', data);
        } catch (jsonError) {
          console.error('[Login] Failed to parse JSON response:', jsonError);
          const textResponse = await response.text();
          console.error('[Login] Raw response:', textResponse);
          setError(`Server error: Received non-JSON response (Status: ${response.status}). Check console for details.`);
          return;
        }
      } else {
        const textResponse = await response.text();
        console.error('[Login] Non-JSON response received:', textResponse);
        setError(`Server error: Expected JSON but got ${contentType || 'unknown type'} (Status: ${response.status}). Check console for details.`);
        return;
      }

      if (response.ok) {
        // Validate token exists
        if (!data.token) {
          console.error('[Login] No token in successful response:', data);
          setError("Login successful but no token received. Please contact support.");
          return;
        }

        console.log('[Login] Token received, saving to localStorage');
        localStorage.setItem("token", data.token);
        
        console.log('[Login] Showing success toast');
        toast.success("Welcome back!");
        
        // Small delay to ensure toast is visible before navigation
        setTimeout(() => {
          try {
            console.log('[Login] Navigating to dashboard');
            navigate("/dashboard");
          } catch (navError) {
            console.error('[Login] Navigation error:', navError);
            setError("Login successful but navigation failed. Please manually go to dashboard.");
          }
        }, 100);
      } else {
        // Handle error responses
        console.error('[Login] Login failed:', { status: response.status, data });
        
        if (response.status === 403) {
          setError(
            data?.message ||
              'Access denied. Only these users can login: bhavya@gmail.com, rijul@gmail.com, vanni@gmail.com'
          );
        } else if (response.status === 400) {
          setError(data?.message || "Invalid email or password. Please check your credentials.");
        } else if (response.status === 404) {
          setError("Login endpoint not found. Please check if backend is running on port 5001.");
        } else if (response.status === 500) {
          setError("Server error. Please try again later or contact support.");
        } else {
          setError(data?.message || `Login failed (Status: ${response.status}). Please try again.`);
        }
      }
    } catch (error) {
      console.error('[Login] Exception caught:', error);
      
      // Detect specific error types
      if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
          console.error('[Login] Network error - likely CORS or backend not running');
          setError("Network error: Cannot connect to server. Please check:\n1. Backend is running on port 5001\n2. Vite proxy is configured correctly\n3. No CORS issues");
        } else {
          setError(`Network error: ${error.message}. Check console for details.`);
        }
      } else if (error instanceof SyntaxError) {
        console.error('[Login] JSON parsing error');
        setError("Invalid response from server. Please check console for details.");
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Login] Unknown error:', errorMessage);
        setError(`Unexpected error: ${errorMessage}. Check console for details.`);
      }
    } finally {
      setIsLoading(false);
      console.log('[Login] Request completed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Logo Header */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            DesignGuard
          </span>
        </Link>

        {/* Login Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to protect your designs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-white/5 border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 bg-white/5 border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105 h-12 text-lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;