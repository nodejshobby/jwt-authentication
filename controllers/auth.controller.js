const User=require('../models/User');
const jwt=require('jsonwebtoken');
const sendMail=require('../config/sendMail');
const { validationResult } = require('express-validator');
const client=require('../database/redisConnect');
const bcrypt=require('bcrypt');

exports.register=async (req,res,next)=>{
    const { email, password}=req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
        const userExist=await User.findOne({ email });
        if(userExist) return res.status(400).json({message: "Use another email"});

        const activate_token = await jwt.sign({ email }, process.env.ACTIVATE_SECRET_TOKEN,{expiresIn: '1h'});
        const activate_link=`${process.env.CLIENT_URL}/auth/activate/${activate_token}`;
        sendMail(email,'activate',{ email: email, link: activate_link});
        salt=await bcrypt.genSalt(10);
        hashedPassword=await bcrypt.hash(password, salt)
        await User.create({
            email,
            password: hashedPassword
        });
        return res.status(201).json({status: "Ok", message: "User registration successful"});
    }catch(error){
        next(error)
    }
}

exports.activate=async (req,res,next)=>{
    const code=req.params.code;
    if(!code) return res.status(400).json({ message: "Invalid request!"});

    try{
        user=await jwt.verify(code,process.env.ACTIVATE_SECRET_TOKEN);
        userExist=await User.findOne({ email: user.email});
        if(!userExist) return res.status(400).json({ message: "Invalid activation link"})
        await User.findByIdAndUpdate(userExist._id,{
            emailVerifiedAt: Date.now()
        })
        return res.status(200).json({ status: "Ok", message: "Email was sucessfully verified" })
    }catch(error){
        next(error)
    }
}

exports.login=async (req,res,next)=>{
    const { email, password}=req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
        userExist=await User.findOne({ email });
        if(!userExist) return res.status(400).json({ message: "Invalid credentials"})
        userId=userExist._id.toString();
        const validPassword=await userExist.validatePassword(password)
        if(!validPassword) return res.status(400).json({ message: "Invalid credentials" })
        accessToken=await jwt.sign({ _id: userId }, process.env.ACCESS_SECRET_TOKEN,{expiresIn: '1h'});
        refreshToken=generateRefreshToken(userId);
        return res.status(200).json({ status: "Ok", data: {
            accessToken, 
            refreshToken
        } });
    }catch(error){
        next(error)
    }
}

exports.getDetail=async (req,res,next)=>{
    try{
        user=await User.findById(req.userId).select("email");
        res.status(200).json({ status: "Ok", data: { user }})
    }catch(error){
        next(error)
    }
}

exports.logout=async (req,res)=>{
    accessToken=req.headers.authorization.split(' ')[1];
    client.set('IN_'+accessToken,accessToken);
    return res.status(200).json({message: "You are sucessfully logout"})
}

exports.refreshAccess=async (req,res,next)=>{
    refreshToken=req.body.token;

    if(!refreshToken) return res.status(400).json({ message: "Incomplete request!"})

    try {
        decoded=await jwt.verify(refreshToken,process.env.REFRESH_SECRET_TOKEN);
        userId=decoded._id;
    }catch(error){
        next(error)
        return 
    }

    client.get(userId,async (error,data)=>{
        if(error) throw error;
        
        if(refreshToken !== data){
            return res.status(401).json({ message: "Forbidden!"});
        }

        try{
            accessToken=await jwt.sign({ _id: userId }, process.env.ACCESS_SECRET_TOKEN,{expiresIn: '1h'});
            refreshToken=generateRefreshToken(userId);
            return res.status(200).json({ status: "Ok", data:{
                accessToken, 
                refreshToken
                } });
        }catch(error){
            next(error)
        }
    })
    
}

exports.forgotPassword=async (req,res,next)=>{
    const { email }=req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
        user=await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Something went wrong"})
        userId=user._id;
        reset_token=await jwt.sign({ _id: userId },process.env.RESET_SECRET_TOKEN,{ expiresIn: "1h"});
        const reset_link=`${process.env.CLIENT_URL}/auth/reset/${reset_token}`;
        sendMail(email,'reset',{ email: email, link: reset_link});
        await User.findByIdAndUpdate(userId,{
            resetCode: reset_token
        });
        res.status(200).json({ message: "Reset link has been sent to your email"});
    }catch(error){
        next(error)
    }
}

exports.resetPassword=async (req,res,next)=>{
    const resetCode=req.params.token;
    if(!resetCode) return res.status(400).json({ message: "Invalid request!"});

    const { password }=req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
        decoded=await jwt.verify(resetCode,process.env.RESET_SECRET_TOKEN);
        userId=decoded._id;
        user=await User.findOne({ _id: userId , resetCode });
        salt=await bcrypt.genSalt(10);
        hashedPassword=await bcrypt.hash(password, salt)
        await User.findByIdAndUpdate(userId,{
            password : hashedPassword
        });

        res.status(200).json({ message: "Your password has been sucessfully reset"});
    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}

function generateRefreshToken(userId){
    refreshToken=jwt.sign({ _id: userId }, process.env.REFRESH_SECRET_TOKEN,{expiresIn: '7d'});
    client.set(userId,refreshToken);
    return refreshToken;
}
