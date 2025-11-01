import { Router } from "express";
import multer from "multer";
import path from "path";
import { getDesignById } from "../controllers/designController.ts";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// POST /api/designs/save
router.post("/save", upload.single("design"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const designData = {
      title: req.body.title,
      similarity: req.body.similarity || 100,
      blockchainHash: req.body.blockchainHash,
      transactionHash: req.body.transactionHash,
      fileSize: req.body.fileSize,
      dimensions: req.body.dimensions,
      format: req.body.format,
      image: req.file.filename, // Use filename instead of path
      uploadDate: new Date(),
    };

    console.log("Design uploaded:", designData);

    res.status(201).json({
      message: "Design uploaded successfully",
      design: designData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// GET /api/designs (get all designs - for dashboard)
router.get("/", async (req, res) => {
  try {
    // TODO: Fetch from database
    // For now, return empty array
    res.json({ designs: [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch designs" });
  }
});

// GET /api/designs/:id (get single design by ID)
router.get("/:id", getDesignById);

export default router;
