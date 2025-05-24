import express from "express";
import { followUser } from "../controllers/follow.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post("/followSomeone", requireToken,followUser);

export default router;