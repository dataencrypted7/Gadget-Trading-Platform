const model = require('../models/user');
const Trade = require('../models/dbGadget');

//displays sign-up form to create a user
exports.new = (req, res)=>{
    return  res.render('./user/new');
  
};

//gets the sign-up form data and saves in users db
exports.create = (req, res, next)=>{
      let user = new model(req.body);//create a new user document
      if(user.email)
        user.email = user.email.toLowerCase();  
      user.save()       //insert the document to the database
        .then(user=> { 
            req.flash('success', 'Registration succeeded!');
            res.redirect('/users/login') 
        })
        .catch(err=>{
            if(err.name === 'ValidationError' ) {
                req.flash('error', err.message);  
                return res.redirect('/users/new');
            }
    
            if(err.code === 11000) {
                req.flash('error', 'Email has been used');  
                return res.redirect('/users/new');
            }
            
            next(err);
        }); 
   };

// displays login page 
exports.getUserLogin = (req, res, next) => {
        return res.render('./user/login');
    }

//implements login and renders profile page
exports.login = (req, res, next)=>{
        let email = req.body.email;
        if(email)
          email = email.toLowerCase();
        let password = req.body.password;
        model.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'wrong email address');  
                res.redirect('/users/login');
                } else {
                user.comparePassword(password)
                .then(result=>{
                    if(result) {
                        req.session.user = user._id;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/users/profile');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
                });     
            }     
        })
        .catch(err => next(err));
    };

//implementation of profile page, get the docs from users and trades dbs
exports.profile = async (req, res, next)=>{
    let id = req.session.user;
    let watchedTrades = []
    let trades = []
    await Promise.all([model.findById(id), Trade.find({author: id}),  model.findById(id).populate('watched'),
    Trade.find({$and: [{author: id}, {trade_initiated: true}, {status: {$eq: "Offer Pending"}}] }).populate('tradeitem').select('tradeitem') ])
    .then(results=> {
        if(results) { 
        const [user, trades, w, trading] = results;
        watchedTrades=  w.watched
        res.render('./user/profile', {user, trades, watchedTrades, trading})
      
        }
        else {
            let user= model.findById(id)
            res.render('./user/profile', {user, trades, watchedTrades})
        }
         })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }
        console.log("find status failed")
        next(err)});
};

//performs logout by destroying the session
exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



