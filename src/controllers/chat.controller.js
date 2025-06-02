import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ miembros: req.uid })
      .sort({ updatedAt: -1 });

    // Filtrar para devolver solo info del otro participante
    const result = await Promise.all(
      chats.map(async(chat) => {
        const idMiembro = chat.miembros.find(miembro => miembro._id.toString() !== req.uid);
        const miembro = await User.findById(idMiembro).select("-email -passwd");
        const yo = await User.findById(req.uid).select("-email -passwd");
        return {
            _id: chat._id,
            miembros: [yo, miembro],
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        };
      })
    );
    return res.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Error en el servidor" });
  }
};

export const getOneChat = async (req, res) => {
  const idChat = req.params.id;
  try {
    const chat = await Chat.findById(idChat);

    if(!chat) return res.json({ ok: false, error: "Ese chat no existe" });

    if(!chat.miembros.includes(new mongoose.Types.ObjectId(req.uid))) return res.json({ ok: false, error: "No perteneces a ese chat" });

    const idMiembro = chat.miembros.find(miembro => miembro._id.toString() !== req.uid);
    const miembro = await User.findById(idMiembro).select("-email -passwd");
    const yo = await User.findById(req.uid).select("-email -passwd");

    return res.json({ ok: true, chat: 
      {
          _id: chat._id,
          miembros: [yo, miembro],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.json({ ok: false, error: "Error en el servidor" });
  }
};

export const crearChat = async(req, res)=>{
    const miembros = [req.uid, req.body.usuario];
    let nuevo = false;
    try {
        let chatNuevo = await Chat.findOne({
          miembros: { $all: miembros, $size: 2 }
        });

        if (!chatNuevo) {
          chatNuevo = new Chat({ miembros });
          await chatNuevo.save();
          nuevo = true;
        }

        const miembro = await User.findById(req.body.usuario).select("-email -passwd");
        const yo = await User.findById(req.uid).select("-email -passwd");
        const result = {
            _id: chatNuevo._id,
            miembros: [yo, miembro],
            createdAt: chatNuevo.createdAt,
            updatedAt: chatNuevo.updatedAt
        };
        return res.json({ ok: true, chat: result, nuevo });
    } catch (error) {
        console.log(error);
        return res.json({ ok: true, error: "Error en el servidor" });
    }
}

export const getMessages = async(req, res) =>{
  const idChat = req.params.chatId;

  try {
    const mensajes = await Message.find({ id_chat: idChat });
    return res.json({ ok: true, mensajes });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, error: "Error en el servidor al cargar mensajes" });
  }
}