import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        index: { unique: true },
        required: true
    },
    passwd: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        default: ""
    },
    usuario: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    descripcion: {
        type: String,
        default: ""
    },
    foto: {
        type: String,
        default: ""
    }
}, { timestamps: true }); //Esto agrega createdAt y updatedAt

userSchema.pre("save", async function(next){
    const user = this;

    if(!user.isModified("passwd")) return next(); //Para que no se hashee la contraseña de nuevo al actualizar.

    try{
        const salt = await bcrypt.genSalt(10);
        user.passwd = await bcrypt.hash(user.passwd, salt);
        next();
    }catch(error){
        console.log(error);
        throw new Error("Falló el hash de la contraseña");
    }
});

export default mongoose.model("User", userSchema);
