import express from "express";
import { conversation } from "../controllers/chatController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.get("/:id", protect, conversation);

export default router;
