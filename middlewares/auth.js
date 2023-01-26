const Trade = require('../models/dbGadget');

//check if user is a guest
exports.isGuest = (req, res, next) =>{
    if(!req.session.user)
    return  next();
   else {
       req.flash('error', 'You are logged in already');
       return res.redirect('/users/profile');
   }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user) { 
         return  next();
    }
   else {
       req.flash('error', 'You need to loggin first');
       return res.redirect('/users/login');
   } 
};

//check if user is author of the story
exports.isAuthor = (req, res, next) => {
 let id = req.params.id;
 Trade.findById(id)
 .then(trade => {
 if(trade){
    if(trade.author == req.session.user)
        return next();
    else {
        let err = new Error('Unauthorized to access the resource.')
        err.status = 404;
        return next(err);
    }
 } else {
    let err = new Error('Cannot find a gadget with id ' + req.params.id);
    err.status = 404;
    return next(err);
}
 })
 .catch(err=>next(err));
};