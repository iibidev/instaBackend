import express from "express";
import { crearChat, getChats, getMessages, getOneChat } from "../controllers/chat.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
const router = express.Router();

router.get('/getAll', requireToken, getChats);

router.get('/getOne/:id', requireToken, getOneChat);

router.post('/create', requireToken, crearChat);

router.get('/messages/:chatId', requireToken, getMessages);

export default router;