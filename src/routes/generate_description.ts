import express from "express";
import { auth } from "../middleware/auth";
import { generateDescByGPT } from "handler/generate_description/";

const router = express.Router();

router.post(
  "/generate-description",
  auth,
  generateDescByGPT
)

export default router;
