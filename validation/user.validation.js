const { check } = require('express-validator');

exports.signUp=[check('email').not().isEmpty().bail().withMessage("Email cannot be empty").isEmail().withMessage("Enter a valid email").normalizeEmail(),
check('password').not().isEmpty().bail().withMessage("Password cannot be empty").isLength({ min: 6 }).withMessage("Password must be minimum of six characters"),] 

exports.signIn=[check('email').not().isEmpty().bail().withMessage("Email cannot be empty").isEmail().withMessage("Enter a valid email").normalizeEmail(),
check('password').not().isEmpty().withMessage("Password cannot be empty")] 

exports.forgot=[check('email').not().isEmpty().bail().withMessage("Email cannot be empty").isEmail().withMessage("Enter a valid email").normalizeEmail()] 

exports.reset=[check('password').not().isEmpty().bail().withMessage("Password cannot be empty").isLength({ min: 6 }).withMessage("Password must be minimum of six characters"),] 