const jwt=require('jsonwebtoken');
const User = require('../models/User');
const client=require('../database/redisConnect');

exports.isAuthenticated=async (req,res,next)=>{
    if(!req.headers.authorization) return res.status(400).json({ message: "Forbidden!"})
    accessToken=req.headers.authorization.split(' ')[1];
    if(!accessToken) return res.status(400).json({ message: "Invalid request!"});
    client.get('IN_'+accessToken,async (error,data)=>{
        if(error) throw error;
        
        if(accessToken === data){
            return res.status(401).json({ message: "Not Authenticated"});
        }

        try{
            decoded=await jwt.verify(accessToken,process.env.ACCESS_SECRET_TOKEN);
            req.userId=decoded._id
            next()
        }catch(error){
            next(error)
        }
    })
    
}

exports.isVerified=async (req,res,next)=>{
    try{
        userDetails=await User.findById(req.userId).select("emailVerifiedAt");
        if(!userDetails.emailVerifiedAt) return res.status(401).json({ message: "Email is not verified!"})
        next();
    }catch(error){
        next(error)
    }
}