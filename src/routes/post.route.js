import express from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { commentPost, explorePosts, getComments, likePost, uploadPost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/upload/:tipo", requireToken, uploadPost);

router.post("/like", requireToken, likePost);

router.post("/comment", requireToken, commentPost);

router.get("/comments/:idPost", requireToken, getComments);

router.get("/allPosts/:modo", requireToken, explorePosts);

export default router;