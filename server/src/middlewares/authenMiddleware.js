import jwt from "jsonwebtoken";

export const verifyToken = (req,res,next) =>{
    try{
        const tokenHeader = req.header("authorization");
        if(!tokenHeader) return res.status(401).json({message: "Không tìm thấy token!"});
        if(!tokenHeader.startsWith("Bearer ")) return res.status(401).json({message: "Token không hợp lệ!"});
        const token = tokenHeader.split(" ")[1];
        if(!token) return res.status(401).json({message: "Không tìm thấy token!"});
        const jwtsecret = process.env.JWT_SECRET;
        if(!jwtsecret) return res.status(500).json({message: "Không tìm thấy JWT_SECRET!"});
        const decoded = jwt.verify(token,jwtsecret);
        const userId = decoded.userId;
        const email = decoded.email;
        const role = decoded.role;
        req.user = {userId,email,role};
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({message: 'Token hết hạn hoặc có lỗi token!'});
    }
}