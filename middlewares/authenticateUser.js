const jwt = require("jsonwebtoken");

exports.authenticateUser = (req, res, next) => {
    
    const authHeader = req.header("Authorization");
    console.log(authHeader);
    
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received Token:", token); 
    if (!token) {
        return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(403).json({ message: "Invalid or expired token." });
    }
};
