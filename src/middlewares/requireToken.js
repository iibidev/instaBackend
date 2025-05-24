import jwt from "jsonwebtoken";

export const requireToken = (req, res, next) =>{
    try {
        let token = req.headers?.authorization;
        if(!token) return res.json({ ok: false, error: "Es necesario un token para las peticiones." });

        token = token.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET); //verificar si es válido el token enviado.
        req.uid = payload.uid;

        next();
    } catch (err) {
        console.log(err);
        const tokenVerificationErrors ={
            "invalid signature": "La firma del JWT no es válida.",
            "jwt expired": "JWT expirado.",
            "invalid token": "Token no válido.",
            "No Bearer": "Utiliza formato Bearer.",
            "jwt malformed": "JWT malformado."
        }
        return res.json({ ok: false, error: tokenVerificationErrors[err.message] });
    }
}