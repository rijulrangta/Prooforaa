import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getDesignById } from "../controllers/designController.js";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Create uploads directory with absolute path - ONE LEVEL UP from routes folder
const uploadsDir = path.join(__dirname, "../../uploads");
console.log("📁 Uploads directory path:", uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
} else {
  console.log("✅ Uploads directory already exists");
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 Saving file to:", uploadsDir);
    cb(null, uploadsDir); // Use absolute path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    console.log("📝 Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// POST /api/designs/save
router.post("/save", upload.single("design"), async (req, res) => {
  try {
    console.log("📥 Received upload request at /api/designs/save");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const designData = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname,
      similarity: parseFloat(req.body.similarity) || 100,
      blockchainHash: req.body.blockchainHash,
      transactionHash: req.body.transactionHash,
      fileSize: req.body.fileSize,
      dimensions: req.body.dimensions,
      format: req.body.format,
      image: req.file.filename,
      uploadDate: new Date().toISOString(),
    };

    console.log("✅ Design saved successfully:", designData);

    res.status(201).json({
      message: "Design uploaded successfully",
      design: designData,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      message: error.message || "Upload failed",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// GET /api/designs (get all designs - for dashboard)
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching all designs");
    res.json({ designs: [] });
  } catch (error: any) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch designs" });
  }
});

// GET /api/designs/:id (get single design by ID)
router.get("/:id", getDesignById);

export default router;
