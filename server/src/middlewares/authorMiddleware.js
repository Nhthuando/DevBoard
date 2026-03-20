
export const authorize = (allowedRoles) => (req,res,next) => {
    try {
    const role = req.user.role;
    if(!role) return res.status(401).json({message: "Không lấy được role!"})
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if(!roles.includes(role)) return res.status(403).json({message: "Role không hợp lệ!"});
    next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}