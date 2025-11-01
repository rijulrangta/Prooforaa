import { Design } from "../models/designModel.ts";
import { Request, Response } from "express";

export const getDesignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    res.status(200).json({ design });
  } catch (error) {
    console.error("Fetch design error:", error);
    res
      .status(500)
      .json({ message: "Error fetching design. Please try again." });
  }
};
