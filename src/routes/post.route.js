import express from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { commentPost, likePost, uploadPost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/upload/:tipo", requireToken, uploadPost);

router.post("/like", requireToken, likePost);

router.post("/comment", requireToken, commentPost);

export default router;