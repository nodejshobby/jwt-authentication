const express=require('express');
const router=express.Router();
const authController=require('../controllers/auth.controller');
const validation=require('../validation/user.validation');
const authMiddleware=require('../middlewares/auth');


router.post("/register",validation.signUp,authController.register)
router.get("/activate/:code",authController.activate)
router.post("/login",validation.signIn,authController.login)
router.get("/userdetail",authMiddleware.isAuthenticated,authMiddleware.isVerified,authController.getDetail)
router.get("/logout",authMiddleware.isAuthenticated,authController.logout)
router.post("/refresh",authController.refreshAccess);
router.post("/forgot",validation.forgot,authController.forgotPassword)
router.post("/reset/:token",validation.reset,authController.resetPassword);

module.exports=router;