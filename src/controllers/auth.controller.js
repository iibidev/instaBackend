import User from "../models/User.js";
import Post from "../models/Post.js";
import Follower from "../models/Follower.js";
import { generateToken } from "../utils/tokenManager.js";
import bcrypt from "bcryptjs";
import cloudinary from "./../config/cloudinary.js";
import LikePost from "../models/LikePost.js";
import CommentPost from "../models/CommentPost.js";

export const register = async(req, res) =>{
    const { email, password, usuario, nombre } = req.body;
    
    try{
        let user = await User.findOne({email}); //Buscar usuario por email

        if(user) return res.json({ ok: false, error: "Ese email ya está registrado." }); //Si existe se manda una respuesta.

        user = await User.findOne({usuario});

        if(user) return res.json({ ok: false, error: "Ese usuario está en uso." });

        user = new User({ email, passwd: password, nombre , usuario});
        await user.save(); //Guardar usuario

        //Generar JWT
        const { token } = generateToken(user._id);

        return res.json({ ok: true, token });
    }catch(err){
        console.log(err);
        return res.json({ ok: false, error: "Error al registrarse." });
    }
};

export const login = async(req, res) =>{
    const { email, password } = req.body;

    try {
        let user = await User.findOne({email});

        if(!user) return res.json({ ok: false, error: "Ese email no está registrado." });

        const is_equalPasswd = await bcrypt.compare(password, user.passwd);

        if(!is_equalPasswd) return res.json({ ok: false, error: "Contraseña incorrecta" });

        //Generar JWT
        const { token } = generateToken(user._id);

        return res.json({ ok: true, token });
    } catch (err) {
        console.log(err)
        return res.json({ ok: false, error: "Error al iniciar sesión." });
    }
};

export const userInfo = async(req, res) =>{
    try {
        let is_me = req.body.usuario == "me";
        let user;

        if(is_me){
            user = await User.findById(req.uid).select("-passwd -email").lean();
        }else{
            user = await User.findOne({ usuario: req.body.usuario }).select("-passwd -email").lean();
            if(!user){
                return res.json({ ok: false, error: "Usuario no encontrado" });
            }else{
                if(user._id == req.uid){
                    is_me = true;
                }
            }
        }

        
        const sigue = await Follower.findOne({
            usuario: req.uid,
            seguido: user._id
        }) ? true : false;

        const publicaciones = await Post.find({ id_usuario: user._id }).sort({ createdAt: -1 }); // Últimos posts primero

        const publicacionesConContadores = await Promise.all(
            publicaciones.map(async (post) => {
              const [likes, comentarios] = await Promise.all([
                LikePost.countDocuments({ id_post: post._id }),
                CommentPost.countDocuments({ id_post: post._id }),
              ]);

              const likeado = await LikePost.findOne({ id_post: post._id, id_usuario: req.uid }) ? true : false;
          
              return {
                ...post.toObject(),
                likes,
                comentarios,
                likeado
              };
            })
          );

        const numeroSeguidores = await Follower.countDocuments({ seguido: user._id });
        const numeroSeguidos = await Follower.countDocuments({ usuario: user._id });

        return res.json({ 
            ok: true, 
            me: is_me, 
            ...user, 
            posts: publicacionesConContadores, 
            seguidores: numeroSeguidores,
            seguidos: numeroSeguidos,
            sigues: sigue
        });
    } catch (err) {
        console.log(err)
        return res.json({ ok: false, error: "Error al recoger información del perfil." })
    }
}

export const searchUser = async(req, res) =>{
    const query = req.query.q;

    try {
        const resultados = await User.find({ usuario: { $regex: query, $options: 'i' }, _id: { $ne: req.uid } }) //Con $ne se puede no mostrar el id que quiera (el que hace la busqueda).
        .select("-descripcion -createdAt -updatedAt").limit(8);

        return res.json({ ok: true, usuarios: resultados });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error en el servidor" });
    }
}

export const updateUser = async(req, res) =>{
    const updates = req.body;
  
    try {
        let user = await User.findOne({ usuario: updates.usuario });
        if(user) return res.json({ ok: false, error: "Ese usuario ya existe." });
        
        await User.findByIdAndUpdate(req.uid, updates, { new: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al actualizar el perfil.' });
    }
}

export const updateUserPhoto = async(req, res) =>{
    const file = req.body.profilePic;
    const userId = req.uid;

    try {

        const user = await User.findById(userId);

        //Borrar la foto de cloudinary si es que ya tenia una el usuario (Para tener más espacio).
        if(user.foto != ""){
            const fotoBorrar = user.foto.split("/").reverse();
            const public_id = fotoBorrar[1] + "/" + fotoBorrar[0].split(".")[0];
            await cloudinary.uploader.destroy(public_id);
        }
    
        //En el caso de que el usuario borre la foto desde el front.
        if (file == "") {
            user.foto = "";

            await user.save();
  
            return res.json({ ok: true, message: 'Foto eliminada exitosamente' });
        }; 
    
        const result = await cloudinary.uploader.upload(file, {
            folder: 'fotos-perfil',
            resource_type: 'image',
            quality: "auto",
            fetch_format: "auto",
            transformation: [
                { width: 300, crop: 'limit' }
              ]
          });
          
        user.foto = result.secure_url;
        await user.save();
        
        return res.json({ ok: true, foto: result.secure_url });
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
      }
}