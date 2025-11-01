import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Upload,
  Search,
  FileText,
  Eye,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import { getAllDesigns } from "@/lib/api";
import toast from "react-hot-toast";

const mockDesigns = [
  {
    id: 1,
    title: "Brand Identity Design",
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
    uploadDate: "2025-01-15",
    status: "verified",
    similarity: 98,
  },
  {
    id: 2,
    title: "Mobile App UI Kit",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
    uploadDate: "2025-01-14",
    status: "verified",
    similarity: 95,
  },
  {
    id: 3,
    title: "Website Landing Page",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop",
    uploadDate: "2025-01-13",
    status: "verified",
    similarity: 97,
  },
  {
    id: 4,
    title: "Logo Collection",
    image:
      "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop",
    uploadDate: "2025-01-12",
    status: "verified",
    similarity: 99,
  },
  {
    id: 5,
    title: "Social Media Graphics",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    uploadDate: "2025-01-11",
    status: "verified",
    similarity: 96,
  },
  {
    id: 6,
    title: "Illustration Set",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop",
    uploadDate: "2025-01-10",
    status: "verified",
    similarity: 94,
  },
];

const API_BASE_URL = "/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [newDesigns, setNewDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await getAllDesigns();
      setNewDesigns(response.designs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching designs:", error);
      // Don't show error toast, just use mock data
      setLoading(false);
    }
  };

  // Combine new uploads (first) with mock designs
  const allDesigns = [...newDesigns, ...mockDesigns];

  // Dynamic stats
  const stats = {
    protected: allDesigns.length,
    scans: allDesigns.length * 6,
    threats: Math.floor(allDesigns.length * 0.05),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/80 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                DesignGuard
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 hover:scale-105 transition-all duration-300">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Design
                </Button>
              </Link>
              <Link to="/compare">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Compare
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => navigate("/")}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Designs Protected",
              value: stats.protected,
              icon: <Shield className="w-6 h-6" />,
              bgColor: "bg-purple-500/10",
              textColor: "text-purple-400",
            },
            {
              label: "Scans Completed",
              value: stats.scans,
              icon: <Search className="w-6 h-6" />,
              bgColor: "bg-pink-500/10",
              textColor: "text-pink-400",
            },
            {
              label: "Threats Detected",
              value: stats.threats,
              icon: <TrendingUp className="w-6 h-6" />,
              bgColor: "bg-cyan-500/10",
              textColor: "text-cyan-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.bgColor} ${stat.textColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  <CountUp end={stat.value} duration={2} />
                </div>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Design Gallery */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Protected Designs
          </h2>
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allDesigns.map((design, i) => {
              const isNewUpload = design._id; // New uploads have _id from MongoDB
              const designId = design._id || design.id;
              const imageUrl = isNewUpload
                ? `${API_BASE_URL}/uploads/${design.image}`
                : design.image;

              return (
                <motion.div
                  key={designId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  {/* NEW Badge for uploaded designs */}
                  {isNewUpload && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg animate-pulse">
                      NEW
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                        <Link to={`/design/${designId}`}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-white">
                      {design.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>
                        {new Date(design.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                        {design.status}
                      </span>
                    </div>

                    {/* Similarity Gauge */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Similarity Score</span>
                        <span className="font-bold text-green-400">
                          {design.similarity}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${design.similarity}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
