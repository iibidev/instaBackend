import Follower from "../models/Follower.js";


export const followUser = async(req, res) =>{
    const usuario = req.uid; //La persona que manda solicitud o sigue
    const seguido = req.body.id_usuario; //La persona que es seguida

    try{
        let follow = await Follower.findOne({ usuario, seguido });
        if(follow){
            await follow.deleteOne();
            console.log("El usuario con el id " + usuario + " ha dejado de seguir al usuario con el id "+ seguido);
            return res.json({ ok: true, sigues: false });
        }

        follow = new Follower({ usuario, seguido });
        await follow.save();
        console.log("El usuario con el id " + usuario + " ha empezado a seguir al usuario con el id "+ seguido);
        return res.json({ ok: true, sigues: true });
    }catch(error){
        console.log(error);
        return res.json({ ok: false, error: "Error en el servidor."});
    }
}