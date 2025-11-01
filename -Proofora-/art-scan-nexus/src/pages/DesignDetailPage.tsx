import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Clock,
  Hash,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDesignById } from "@/lib/api";
import toast from "react-hot-toast";

const API_BASE_URL = "/api";

// Mock designs database (matching DashboardPage)
const mockDesignsDB: { [key: string]: any } = {
  "1": {
    id: "1",
    title: "Brand Identity Design",
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop",
    uploadDate: "2025-01-15",
    status: "verified",
    similarity: 98,
    blockchainHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    transactionHash: "0x8f5e9c4a2b7d6e1f0c3a5b8d9e2f7a4c6b8d0e3a5",
    verificationTime: "2025-01-15T14:32:18",
    fileSize: "2.4 MB",
    dimensions: "1920x1080",
    format: "PNG",
  },
  "2": {
    id: "2",
    title: "Mobile App UI Kit",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
    uploadDate: "2025-01-14",
    status: "verified",
    similarity: 95,
    blockchainHash: "0x8a9d46Ef7745D1643936b4c9f8e6a7b5d2f4e8c1",
    transactionHash: "0x3c7b5a9e4f2d8c1a6b9e3f7d5a2c8b4e6d1f9a3c",
    verificationTime: "2025-01-14T10:15:42",
    fileSize: "3.2 MB",
    dimensions: "1080x1920",
    format: "PNG",
  },
  "3": {
    id: "3",
    title: "Website Landing Page",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
    uploadDate: "2025-01-13",
    status: "verified",
    similarity: 97,
    blockchainHash: "0x5f8e3a2b9d6c4f1e7a3b8d5c2f4e9a6b3d7c5e8f",
    transactionHash: "0x7d4a9c2e6f1b8d3a5c9e7f2b4d6a8c3e5f1b9d7a",
    verificationTime: "2025-01-13T16:45:22",
    fileSize: "4.1 MB",
    dimensions: "2560x1440",
    format: "JPG",
  },
  "4": {
    id: "4",
    title: "Logo Collection",
    image:
      "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop",
    uploadDate: "2025-01-12",
    status: "verified",
    similarity: 99,
    blockchainHash: "0x2c5e8f3a9b6d4c1f7e3a8b5d2c4f9e6a3b7d5c8e",
    transactionHash: "0x9e7c4a2f6d1b8e3c5a9f7e2d4b6c8a3f5e1d9b7c",
    verificationTime: "2025-01-12T11:20:55",
    fileSize: "1.8 MB",
    dimensions: "800x800",
    format: "SVG",
  },
  "5": {
    id: "5",
    title: "Social Media Graphics",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    uploadDate: "2025-01-11",
    status: "verified",
    similarity: 96,
    blockchainHash: "0x6d3f9a2c5e8b4d1f7c3e9a5b2d4c8f6e3a7b5d9c",
    transactionHash: "0x4b8e5a3d9c2f7e1b6a4d8c3f5e9b2a7d6c4f8e1b",
    verificationTime: "2025-01-11T09:30:12",
    fileSize: "2.6 MB",
    dimensions: "1080x1080",
    format: "PNG",
  },
  "6": {
    id: "6",
    title: "Illustration Set",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=600&fit=crop",
    uploadDate: "2025-01-10",
    status: "verified",
    similarity: 94,
    blockchainHash: "0x9c7e4a2f6d3b8e5c1a9f7d4e2b6c8a5f3e1d9b7c",
    transactionHash: "0x3f8e6c2a9d5b7e4f1c6a8d3b5e9c2f7a4d6b8e1c",
    verificationTime: "2025-01-10T14:55:38",
    fileSize: "5.3 MB",
    dimensions: "3000x2000",
    format: "PNG",
  },
};

const DesignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUpload, setIsNewUpload] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDesign();
    }
  }, [id]);

  const fetchDesign = async () => {
    try {
      setLoading(true);

      // First try to get from API (for new uploads)
      try {
        const response = await getDesignById(id!);
        setDesign(response.design);
        setIsNewUpload(true);
        setLoading(false);
        return;
      } catch (apiError) {
        // If API fails, check mock data
        const mockDesign = mockDesignsDB[id!];
        if (mockDesign) {
          setDesign(mockDesign);
          setIsNewUpload(false);
          setLoading(false);
        } else {
          throw new Error("Design not found");
        }
      }
    } catch (error) {
      console.error("Error fetching design:", error);
      toast.error("Design not found");
      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Design not found</p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = isNewUpload
    ? `${API_BASE_URL}/uploads/${design.image}`
    : design.image;

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
            <Link to="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              {isNewUpload && (
                <div className="mb-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg animate-pulse inline-block">
                  NEW UPLOAD
                </div>
              )}
              <img
                src={imageUrl}
                alt={design.title}
                className="w-full rounded-xl shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop";
                }}
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = imageUrl;
                    link.download = design.title;
                    link.click();
                    toast.success("Download started!");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {design.title}
                </h1>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Blockchain Verified
                  </span>
                </div>
              </div>

              {/* Similarity Score */}
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white">
                  Similarity Analysis
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Uniqueness Score</span>
                  <span className="text-2xl font-bold text-green-400">
                    {design.similarity}%
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${design.similarity}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* File Info */}
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white">
                  File Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Upload Date</span>
                    <span className="text-white font-medium">
                      {new Date(design.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">File Size</span>
                    <span className="text-white font-medium">
                      {design.fileSize || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dimensions</span>
                    <span className="text-white font-medium">
                      {design.dimensions || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Format</span>
                    <span className="text-white font-medium">
                      {design.format || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Blockchain Verification
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Hash className="w-4 h-4 mr-2" />
                      Contract Address
                    </div>
                    <code className="text-xs text-purple-400 break-all bg-white/5 px-3 py-2 rounded-lg block">
                      {design.blockchainHash}
                    </code>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Hash className="w-4 h-4 mr-2" />
                      Transaction Hash
                    </div>
                    <code className="text-xs text-purple-400 break-all bg-white/5 px-3 py-2 rounded-lg block">
                      {design.transactionHash}
                    </code>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Verified on{" "}
                    {new Date(design.verificationTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DesignDetailPage;
