import CommentPost from "../models/CommentPost.js";
import LikePost from "../models/LikePost.js";
import Post from "../models/Post.js";

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
        res.json({ ok: true });
    } catch (error) {
        console.log(error);
        res.json({ ok: false, error: "Error en el servidor" });
    }
}