const {body} = require('express-validator')
const {validationResult}= require('express-validator')

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error("Invalid trade id");
        err.status = 400;
        return next(err);
    }
};

exports.validateSignup = 
[body('firstName', 'firstName cannot be empty').notEmpty().trim().escape(),
body('lastName', 'lastName cannot be empty.').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be atleast 8 chars and atmost 64 chars.').isLength({min: 8, max: 64})
]

exports.validateLogin = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be atleast 8 chars and atmost 64 chars.').isLength({min: 8, max: 64})]

exports.validateTrade = 
[body('category', 'category cannot be empty').notEmpty().trim().escape(),
body('brand', 'brand cannot be empty.').notEmpty().trim().escape(),
body('name', 'name cannot be empty').notEmpty().trim().escape(), 
body('details', 'details cannot be empty').notEmpty().trim().isLength({min: 10}).escape(), 
body('img', 'image url cannot be empty.').notEmpty().trim().escape(),
]

exports.validateResult = (req, res, next) => {
//console.log(req.body)    
let errors = validationResult(req);
if(!errors.isEmpty()){
   errors.array().forEach(error => {
    req.flash('error',  error.msg);
   });
   return res.redirect('back');
}
else 
return next();
}