import {Design} from "../models/designModel.ts";
import { Request, Response } from "express";

export const uploadDesign = async (req: Request, res: Response) => {
  try {
    const {
      title,
      designerName,
      creatorEmail,
      similarity,
      blockchainHash,
      transactionHash,
      fileSize,
      dimensions,
      format,
    } = req.body;
    const designImage = req.file ? req.file.filename : "";

    if (!designImage) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newDesign = new Design({
      title,
      image: designImage,
      uploadDate: new Date(),
      status: "verified",
      similarity: similarity || Math.floor(Math.random() * (99 - 94 + 1)) + 94, // Random similarity if not provided
      blockchainHash:
        blockchainHash || `0x${Math.random().toString(36).substring(2, 15)}`,
      transactionHash:
        transactionHash || `0x${Math.random().toString(36).substring(2, 15)}`,
      verificationTime: new Date(),
      fileSize,
      dimensions,
      format,
    });

    const savedDesign = await newDesign.save();
    res.status(200).json({
      message: "Design uploaded successfully!",
      design: savedDesign,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Error uploading design. Please try again." });
  }
};

export const getAllDesigns = async (req: Request, res: Response) => {
  try {
    const designs = await Design.find().sort({ uploadDate: -1 });
    res.status(200).json({ designs });
  } catch (error) {
    console.error("Fetch error:", error);
    res
      .status(500)
      .json({ message: "Error fetching designs. Please try again." });
  }
};
