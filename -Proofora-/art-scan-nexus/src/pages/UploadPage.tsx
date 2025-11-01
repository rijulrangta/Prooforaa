import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Upload,
  FileImage,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const UploadPage = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [designTitle, setDesignTitle] = useState("");
  const [designerName, setDesignerName] = useState("");
  const [email, setEmail] = useState("");
  const [similarityScore, setSimilarityScore] = useState(100);
  const [blockchainHash, setBlockchainHash] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [format, setFormat] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (files.length > 0 && files[0].type.startsWith("image/")) {
        const firstFile = files[0];
        const format = firstFile.name.split(".").pop()?.toUpperCase() || "";
        setFormat(format);
        setFileSize(`${(firstFile.size / 1024 / 1024).toFixed(2)} MB`);

        const img = new Image();
        const objectUrl = URL.createObjectURL(firstFile);
        img.onload = () => {
          setDimensions(`${img.width}x${img.height}`);
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;

        if (!blockchainHash) {
          setBlockchainHash(
            `0x${Date.now().toString(16)}${Math.random()
              .toString(16)
              .substr(2, 10)}`
          );
        }
        if (!transactionHash) {
          setTransactionHash(
            `0x${Math.random().toString(16).substr(2, 10)}${Date.now().toString(
              16
            )}`
          );
        }
      }

      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append("design", file);
        formData.append("title", designTitle || file.name.split(".")[0]);
        formData.append("similarity", String(similarityScore || 100));

        if (blockchainHash) formData.append("blockchainHash", blockchainHash);
        if (transactionHash)
          formData.append("transactionHash", transactionHash);
        if (fileSize) formData.append("fileSize", fileSize);
        if (dimensions) formData.append("dimensions", dimensions);
        if (format) formData.append("format", format);

        try {
          console.log(
            `📤 Uploading file ${index + 1}/${selectedFiles.length}: ${
              file.name
            }`
          );

          const response = await fetch("/api/designs/save", {
            method: "POST",
            body: formData,
          });

          console.log(`Response status: ${response.status}`);

          // Handle different HTTP status codes
          if (response.status === 413) {
            throw new Error(`${file.name}: File too large (max 50MB)`);
          }

          if (response.status === 415) {
            throw new Error(`${file.name}: Unsupported file type`);
          }

          if (response.status === 400) {
            const error = await response
              .json()
              .catch(() => ({ message: "Invalid file" }));
            throw new Error(`${file.name}: ${error.message}`);
          }

          if (response.status === 500) {
            const error = await response
              .json()
              .catch(() => ({ message: "Server error" }));
            console.error("Server error details:", error);
            throw new Error(
              `${file.name}: ${
                error.message || "Server error, please try again"
              }`
            );
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.message ||
                `${file.name}: Upload failed (${response.status})`
            );
          }

          const result = await response.json();
          console.log("✅ Upload successful:", result);
          toast.success(`✓ ${file.name} uploaded successfully`, {
            duration: 2000,
          });
          return result;
        } catch (fileError: any) {
          console.error(`❌ Error uploading ${file.name}:`, fileError);

          // Handle network errors
          if (
            fileError.message.includes("Failed to fetch") ||
            fileError.name === "TypeError"
          ) {
            throw new Error(
              `${file.name}: Cannot connect to server. Make sure backend is running on port 5001`
            );
          }
          throw fileError;
        }
      });

      // Wait for all uploads with better error aggregation
      const results = await Promise.allSettled(uploadPromises);

      // Separate successful and failed uploads
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter(
        (r) => r.status === "rejected"
      ) as PromiseRejectedResult[];

      setIsUploading(false);

      // Handle results
      if (successful.length === 0) {
        // All uploads failed
        toast.error(
          <div className="space-y-2">
            <p className="font-bold">All uploads failed:</p>
            <ul className="text-sm list-disc pl-4 max-h-40 overflow-y-auto">
              {failed.map((f, i) => (
                <li key={i} className="text-left">
                  {f.reason.message}
                </li>
              ))}
            </ul>
          </div>,
          { duration: 8000 }
        );
        return;
      }

      if (failed.length > 0) {
        // Some uploads failed
        toast.error(
          <div className="space-y-2">
            <p className="font-bold">
              {successful.length} of {selectedFiles.length} uploads succeeded
            </p>
            <p className="text-sm">Failed uploads:</p>
            <ul className="text-sm list-disc pl-4 max-h-40 overflow-y-auto">
              {failed.map((f, i) => (
                <li key={i} className="text-left">
                  {f.reason.message}
                </li>
              ))}
            </ul>
          </div>,
          { duration: 8000 }
        );
      }

      if (successful.length > 0) {
        // At least some succeeded
        setUploadComplete(true);

        if (failed.length === 0) {
          // All succeeded
          toast.success(
            `🎉 All ${successful.length} design(s) uploaded and verified!`,
            { duration: 3000 }
          );
        }

        // Navigate to dashboard after delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      // Catch-all for unexpected errors
      console.error("Unexpected upload error:", error);
      setIsUploading(false);

      // Provide user-friendly error messages
      let errorMessage = "An unexpected error occurred";

      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("Cannot connect") ||
        error.name === "TypeError"
      ) {
        errorMessage =
          "Cannot connect to server. Make sure backend is running on http://localhost:5001";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Upload timed out. Please try with smaller files";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    }
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
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent text-center">
            Upload Your Designs
          </h1>
          <p className="text-gray-400 text-center mb-12">
            Protect your creative work with blockchain verification
          </p>

          {/* Upload Zone */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            className={`relative backdrop-blur-2xl bg-white/5 border-2 border-dashed rounded-3xl p-12 mb-8 transition-all duration-300 ${
              isDragging
                ? "border-purple-500 bg-purple-500/10 scale-105"
                : "border-white/20 hover:border-purple-500/50"
            }`}
          >
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-pink-500 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-500 rounded-br-xl" />

            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6"
              >
                <Upload className="w-12 h-12 text-purple-400" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2 text-white">
                Drop your designs here
              </h3>
              <p className="text-gray-400 mb-6">
                or click to browse your files
              </p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>
                    <FileImage className="w-4 h-4 mr-2" />
                    Select Files
                  </span>
                </Button>
              </label>

              <p className="text-sm text-gray-500 mt-4">
                Supports: JPG, PNG, SVG, PDF • Max 50MB per file
              </p>
            </div>
          </motion.div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-xl font-bold mb-4 text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <FileImage className="w-5 h-5 text-purple-400" />
                      <span className="text-white">{file.name}</span>
                      <span className="text-sm text-gray-400">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={
              isUploading || uploadComplete || selectedFiles.length === 0
            }
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white border-0 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Scanning & Verifying...</span>
              </div>
            ) : uploadComplete ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Upload Complete!</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload & Protect Designs
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
