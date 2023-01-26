const express = require('express')
const model = require('../models/dbGadget');
const usermodel = require('../models/user');

//renders all gadgets from the DB to view ejs
//GET '/'
exports.index = (req, res, next) => {
    let sortedResult = {};
     model.find()
    .then(trades => {
        if(!trades){
            console.log("no trades to dispaly")
            res.render('./trades/Gadgets', {sortedResult})
        }
        let result = trades.reduce(function(groups, item){
        const val = item.category;
        groups[val] = groups[val] || []
        groups[val].push(item)
        return groups
        }, {})
        sortedResult= Object.assign(...Object.entries(result).sort().map(([key, value])=> {
               return {
                  [key]: value
               }
            }));
       // console.log(sortedResult);
        res.render('./trades/Gadgets', {sortedResult})
    })
.catch(err => { 
    req.flash('error', "No trades to display.");
    res.redirect('/')
   });
};

//render the new gadget form
//GET '/trades/new
exports.new = (req, res) => {
  res.render('./trades/newform');
}

//receives teh new gadget req body and adds into trades DB, then redirects ti /trades 
//POST '/trades'
exports.create = (req, res, next) => {
    let newtrade = new model(req.body);
    newtrade.author = req.session.user;
     newtrade.save()
    .then((newtrade) => {
       req.flash('success', 'New gadget has been created successfully');
        res.redirect('/trades');
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message);
            return res.redirect('back');
         }
        next(err);
    });
};

//extracts a gadget doc with given id and renders displaygadget view
//GET /trades/:id
exports.show = async(req, res, next) => {
    let trade_id = req.params.id; 
    let userid = req.session.user;
    let watching = false
    let trading = true
    if(userid){
        await Promise.all([model.findById(trade_id), usermodel.findById(userid) ])
        .then(results=> {
            const [trade, user] = results;
            if(!trade){
                let err = new Error('Cannot find a gadget with id ' + trade_id);
                err.status = 404;
                return next(err);
            }
            let watchedlist = user.watched;
            if (watchedlist.some(function (item){
                return item.equals(trade_id)
            } ) )  watching = true
        
            if(trade.status != "Available")  trading = false
            // console.log(watching)
            return res.render('./trades/DisplayGadget', {trade, userid, watching, trading}); 
            })
        .catch(err => { next(err)});    
        }
    else {
        model.findById(trade_id)
        .then(trade => {
            if(!trade){
                let err = new Error('Cannot find a gadget with id ' + trade_id);
                err.status = 404;
                return next(err);
            }
            if(trade.status != "Available")  trading = false
           return res.render('./trades/DisplayGadget', {trade, userid, watching, trading}); 
        })
        .catch(err => next(err)); 
    }
};

//GET /trades/:id/edit
//display the edit form
exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(item => {
         return res.render('./trades/editForm',{item});
    })
    .catch(err => next(err));  
};

//GET /trades/:id/unwatch
//removes the trade id from users db and display the changed profile page
exports.unwatch = (req, res, next) => {
    let trade_id = req.params.id
    let userid = req.session.user;
     usermodel.findById(userid)
    .then(userdetails => {
        model.findById(trade_id)
        .then(trade => {
            if(!trade){
                let err = new Error('Cannot find a gadget with id ' + trade_id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));  
        let rec = userdetails;
        let idx = rec.watched.indexOf(trade_id)
        if(idx >= 0) rec.watched.splice(idx, 1) //rec.watched.remove(idx)
        
        usermodel.findByIdAndUpdate(userid, rec, {runValidators:true})
        .then( det => {
            req.flash('success', 'User Watched list updated successfully');
            res.redirect('/users/profile');
        })
        .catch(err => {
            if(err.name === 'ValidationError') {
                err.status = 400;
                req.flash('error', err.message);
                return res.redirect('back');
             }
            next(err);  
        });
    })
    .catch(err => next(err));  
};


//PUT /trades/:id
//update the gadget identified by id and redirects to edit trade route, otherwise retuns null
exports.update = (req, res, next) => {
    let item = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, item, {runValidators: true})
    .then(item => {
        res.redirect('/trades/'+id);
   })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message);
            return res.redirect('back');
          }
        next(err);
    });
};

//PUT /trades/:id/watch
//adds the trade id ito users db and renders the profile, otherwise retuns null
exports.watch = async(req, res, next) => {
    let item = req.body;
    let userid = req.session.user; 
    let trade_id = req.params.id;
    await usermodel.findById(userid)
    .then(user => {
        model.findById(trade_id)
        .then(trade => {
            if(!trade){
                let err = new Error('Cannot find a gadget with id ' + trade_id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));

        user.watched.push(trade_id)
        usermodel.findByIdAndUpdate(userid, user, {runValidators:true})
        .then (tt => {
            req.flash('success', 'User Watched list updated successfully');
            res.redirect('/users/profile');})
        .catch(err => {
            if(err.name === 'ValidationError') {
                err.status = 400;
                req.flash('error', err.message);
                return res.redirect('back');
            }
            next(err);  
        });
    })
    .catch(err => next(err));
};

//DELETE /stories/:id, delete the trade identified by ID and also release it there any trades done
exports.delete = async(req, res, next) => {
    let trade_id = req.params.id;
    let trade2 = null
    await model.findById(trade_id)
    .then(trade1 => {
        trade2 = trade1.tradeitem
        model.findByIdAndDelete(trade_id, {useFindAndModify: false})
        .then(item => {      })
        .catch(err => next(err));
        })
        if(trade2) {
            model.findById(trade2)
            .then( t => {
                if(!t){
                    let err = new Error('Cannot find a gadget with id ' + trade2);
                    err.status = 404;
                    return next(err);
                }
                t.tradeitem=null;
                t.trade_initiated=false
                t.status="Available"
                model.findByIdAndUpdate(trade2, t,{runValidators:true} )
                .then( tt => {
                    req.flash('success', 'Gadget has been deleted successfully');
                    res.redirect('/trades');
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
        else{
            req.flash('success', 'Gadget has been deleted successfully');
            res.redirect('/trades');
        }

}
//display own trades list to select to trade.
exports.newtrading = async(req, res, next) => {
    let trade_id = req.params.id;
    req.session.temptrade = trade_id;  
    let userid = req.session.user;
   
    await Promise.all([model.find({author: userid}),model.findById(trade_id), usermodel.findById(userid)])
    .then(results => {
        const [trades, trade1, user] = results;
        if(!trade1){
            let err = new Error('Cannot find a gadget with id ' + trade_id);
            err.status = 404;
            return next(err);
        }
        res.render('./trades/owntrades', {trades, user, trade1});
    })
    .catch(err => next(err));
}

//implementation of trading functionality
exports.trading = async(req, res, next) => {
   let selectedVal = req.body.rad  //the id of the trade selected
 //console.log(selectedVal)
 //console.log(req.session)
    let trade1 = req.session.temptrade;
    req.session.temptrade=""
    if(selectedVal != null){
        await Promise.all([model.findById(selectedVal), model.findById(trade1)])
        .then(results => {
            const [ownitem, tradeditem] = results
            if(!ownitem || !tradeditem){
                let err = new Error('Cannot find gadgets' + selectedVal + " or " + trade1);
                err.status = 404;
                return next(err);
            }
            ownitem.status = "Offer Pending"
            ownitem.tradeitem = trade1
            ownitem.trade_initiated=true

            tradeditem.status = "Offer Pending"
            tradeditem.tradeitem = selectedVal
            Promise.all([model.findByIdAndUpdate(selectedVal, ownitem, {runValidators: true}),
                 model.findByIdAndUpdate(trade1, tradeditem, {runValidators:true})])
            .then(updates => {
                req.flash('success', 'Trading status has been successfully updated.');
                res.redirect('/users/profile');
            })
            .catch(err => {
                    if(err.name === 'ValidationError') {
                        err.status = 400;
                        req.flash('error', err.message);
                        return res.redirect('back');
                    }
                    next(err);  
            });
        })
            .catch(err => next(err));
    }
    else {
        req.flash('error', "Please select any trade item to trade.");
        return res.redirect('back');
    }
}

//displays manage trade view 
exports.manageView = async(req, res, next) => {
    let trade_id = req.params.id;
    let userid = req.session.user;
    let owner = true
    await Promise.all([model.findById(trade_id).populate('tradeitem'), usermodel.findById(userid)])
    .then(results => {
        const [trade1, user] = results;
        if(!trade1){
            let err = new Error('Cannot find the gadget with id: '  + trade_id);
                err.status = 404;
                return next(err); 
        }
        let trade2 = trade1.tradeitem
        if(!trade2){
            let err = new Error('Cannot find the traded gadget!');
                err.status = 404;
                return next(err); 
        }
        if(!trade1.trade_initiated){
            owner = false
        }
        // console.log("list of trades found", trades, res.locals.temptrade)
         res.render('./trades/managetradeView', {trade1, trade2, user, owner});
    })
    .catch(err => next(err));
}

//cancels the trading offer
exports.manageCancel = async(req, res, next) => {
    let trade_id = req.params.id;
    let trade2_id = (req.url.split('?')[1]).split('=')[1]
    await Promise.all([model.findById(trade_id), model.findById(trade2_id)])
    .then(results => {
        const [trade1, trade2] = results;
        if(!trade1 || !trade2){
            let err = new Error('Cannot find gadgets' + trade1 + " or " + trade2);
            err.status = 404;
            return next(err);
        }
        trade1.status = "Available"
        trade1.tradeitem = null
        trade1.trade_initiated=false

        trade2.status = "Available"
        trade2.tradeitem = null
        trade2.trade_initiated=false

        Promise.all([model.findByIdAndUpdate(trade_id, trade1, {runValidators: true}),
            model.findByIdAndUpdate(trade2_id, trade2, {runValidators:true})])
       .then(updates => {
           req.flash('success', 'Trading Offer has been successfully cancelled.');
           res.redirect('/users/profile');
       })
       .catch(err => {
               if(err.name === 'ValidationError') {
                   err.status = 400;
                   req.flash('error', err.message);
                   return res.redirect('back');
               }
               next(err);  
       });
    })
    .catch(err => next(err));
}

//implements the trade accept functionality
exports.manageAccept = async(req, res, next) => {
    let trade_id = req.params.id;
    let trade2_id = (req.url.split('?')[1]).split('=')[1]
    //console.log("manage cancel", trade_id, trade2)
    await Promise.all([model.findById(trade_id), model.findById(trade2_id)])
    .then(results => {
        const [trade1, trade2] = results;
        if(!trade1 || !trade2){
            let err = new Error('Cannot find gadgets' + trade1 + " or " + trade2);
            err.status = 404;
            return next(err);
        }
        trade1.status = "Traded"
        trade2.status = "Traded"
      
        Promise.all([model.findByIdAndUpdate(trade_id, trade1, {runValidators: true}),
            model.findByIdAndUpdate(trade2_id, trade2, {runValidators:true})])
       .then(updates => {
           req.flash('success', 'Trading Offer has been successfully Accepted.');
           res.redirect('/users/profile');
       })
       .catch(err => {
               if(err.name === 'ValidationError') {
                   err.status = 400;
                   req.flash('error', err.message);
                   return res.redirect('back');
               }
               next(err);  
       });
    })
    .catch(err => next(err));
}