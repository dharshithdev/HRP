const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(401).json({message: "Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error) {
        console.log("Error Occured, Error : ", error.message);
        return res.status(401).json({message: "Error while authorization"});
    }
}

module.exports = {protect};