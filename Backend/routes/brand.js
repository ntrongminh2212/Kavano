import express from "express";
import { getAllBrands } from "../controllers/brand.js";
const router = express.Router();

router.get("/all", getAllBrands);

export default router;