import express from "express";
import { getAllCategories } from "../controllers/category.js";
import { db } from "../index.js";
const router = express.Router();

router.get("/all", getAllCategories);

export default router;