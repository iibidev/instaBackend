import CommentPost from "../models/CommentPost.js";
import Follower from "../models/Follower.js";
import LikePost from "../models/LikePost.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const uploadPost = async(req, res) =>{

    const tipo = req.params.tipo;

    try {
        const post = new Post({
            id_usuario: req.uid,
            url: req.body.post,
            tipo,
            descripcion: req.body.descripcion
        })

        await post.save();

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);
        res.json({ ok: false, error: "Error en el servidor" });
    }
}

export const likePost = async(req, res) =>{

    const idPost = req.body.postId;

    try {
        
        let like = await LikePost.findOne({ id_post: idPost, id_usuario: req.uid });

        if(like){
            await like.deleteOne();
        }else{
            like = new LikePost({ id_post: idPost, id_usuario: req.uid });
            await like.save();
        }        

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);
        res.json({ ok: false, error: "Error en el servidor" });
    }
}

export const commentPost = async(req, res) =>{
    const { postId, comment } = req.body;

    try {
        const comentario = new CommentPost({ id_post: postId, id_usuario: req.uid, texto: comment });
        await comentario.save();
        const usuario = await User.findById(req.uid);
        res.json({ ok: true, comentario: {
                _id: comentario._id,
                usuario: usuario.usuario,
                fotoPerfil: usuario.foto,
                texto: comentario.texto,
                fecha: comentario.createdAt
        }});
    } catch (error) {
        console.log(error);
        res.json({ ok: false, error: "Error en el servidor" });
    }
}

export const getComments = async(req, res) =>{
    const postId = req.params.idPost;
    
    try {
        let comentarios = await CommentPost.find({ id_post: postId }).populate("id_usuario", "usuario foto").sort({ createdAt: -1 });
        comentarios = comentarios.map(com =>{
            return {
                _id: com._id,
                usuario: com.id_usuario.usuario,
                fotoPerfil: com.id_usuario.foto,
                texto: com.texto,
                fecha: com.createdAt
            }
        })
        res.json({ ok: true, comentarios });
    } catch (error) {
        console.log(error);
        res.json({ ok: false, error: "Error en el servidor." });
    }
}

export const explorePosts = async(req, res) =>{

    try {
        const userId = new mongoose.Types.ObjectId(req.uid); //Convertir el String en ObjectId.
        let posts;
        if(req.params.modo == "home"){
            const follows = await Follower.find({ usuario: req.uid });
            const idsQueSigoObjectId = follows.map(follow => new mongoose.Types.ObjectId(follow.seguido));
            posts = await Post.aggregate([
            {
                $match: {
                id_usuario: {
                    $in: idsQueSigoObjectId,
                    $ne: userId
                }
                }
            },
            { $sort: { fecha: -1 } }
            ]);
        }else{
            const total = await Post.countDocuments({ id_usuario: { $ne: req.uid } }); //Total de documentos o datos excluyendo los del usuario.
            posts = await Post.aggregate([
                { $match: { id_usuario: { $ne: userId } } }, //Sacar datos excluyendo los que tengan el id del usuario.
                { $sample: { size: total } } //Sacar datos aleatoriamente y cantidad
            ]);
        }
        
        const postsAleatorios = await Promise.all(
            posts.map(async (post) => {
                const [likes, comentarios] = await Promise.all([
                LikePost.countDocuments({ id_post: post._id }),
                CommentPost.countDocuments({ id_post: post._id }),
                ]);

                const likeado = await LikePost.findOne({ id_post: post._id, id_usuario: req.uid }) ? true : false;
                const perfil = await User.findById(post.id_usuario).select("-passwd -email").lean();
                return {
                ...post,
                likes,
                comentarios,
                likeado,
                perfil
                };
            })
        );

        return res.json({ ok: true, posts: postsAleatorios });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error en el servidor" });
    }
}