import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("register: sending request", { fullName: name, email });
      const response = await fetch("/api/auth/register", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (err) {
        console.error("register: failed to parse JSON", err);
      }

      if (response.ok) {
        // Save the JWT token in localStorage
        if (data?.token) localStorage.setItem("token", data.token);

        // Display success toast
        toast.success("Account created successfully!");

        // Redirect to dashboard after successful registration
        navigate("/dashboard");
      } else {
        console.error("register: non-OK response", {
          status: response.status,
          data,
        });
        if (response.status === 403) {
          setError(
            data?.message ||
              "Registration is restricted. Use: bhavya@example.com, rijul@example.com, vanni@example.com"
          );
        } else {
          setError(
            data?.message ||
              `Registration failed (${response.status}). Please try again.`
          );
        }
      }
    } catch (error) {
      console.error("register: network error", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Logo Header */}
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 mb-8"
        >
          <Shield className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            DesignGuard
          </span>
        </Link>

        {/* Register Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-400">Start protecting your designs today</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 bg-white/5 border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
            </div>

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
            {error && <p className="text-red-500 text-center">{error}</p>}

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
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
