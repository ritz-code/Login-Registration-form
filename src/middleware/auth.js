const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

//token authentication middleware function
const auth = async (req, res, next) => {
    try{
        console.log("HI");
        const token = req.cookies.jwt;
        console.log("token: "+token);
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);

        const user = await Register.findOne({_id:verifyUser._id});

        req.token = token;
        req.user = user;

        next();
    }catch(error){
        res.status(401).send(error);
    }
};

module.exports = auth;