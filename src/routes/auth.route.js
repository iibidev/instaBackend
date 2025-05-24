import express from "express";
import { userInfo, login, register, searchUser, updateUser, updateUserPhoto } from "./../controllers/auth.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/userProfile", requireToken, userInfo);

router.put("/userProfile", requireToken, updateUser);

router.put("/userProfile/profilePic", requireToken, updateUserPhoto);

router.get("/user/search", requireToken, searchUser);


export default router;