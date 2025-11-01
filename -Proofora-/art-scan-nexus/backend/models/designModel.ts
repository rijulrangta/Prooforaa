import mongoose from "mongoose";

const designSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // path to the uploaded image
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "verified"], default: "pending" },
  similarity: { type: Number, default: 0 }, // Uniqueness score
  blockchainHash: { type: String }, // Optional, if you store blockchain data
  transactionHash: { type: String }, // Optional, for transaction data
  verificationTime: { type: Date },
  fileSize: { type: String }, // e.g., '2.4 MB'
  dimensions: { type: String }, // e.g., '1920x1080'
  format: { type: String }, // e.g., 'PNG'
});

const Design = mongoose.model("Design", designSchema);

export { Design };
