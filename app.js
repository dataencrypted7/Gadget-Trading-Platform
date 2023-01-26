const express = require('express');
//const {check, validationResult} = require('express-validator')

const morgan = require('morgan');
const ejs = require('ejs');
const dotenv = require('dotenv');
const methodOverride=require('method-override');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const tradeRoutes=require('./routes/tradeRouter');
const tradingRoutes=require('./routes/tradingRouter');
const userRoutes=require('./routes/userRouter');
const siteRoutes=require('./routes/siteRouter');

dotenv.config({path: '.env-local'});
const app = express();

const port = process.env.PORT || '3000';
let host = 'localhost';

// connect to database
mongoose.connect('mongodb://localhost:27017/demos') // , {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(() => {
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    });
})
.catch(err => console.log(err.message));

//mount session middlware
app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
        cookie: {maxAge: 60*60*1000},
        })
);

//use flash should be declared after initiating the session
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

//middle wares
app.use(cors())

//to encode the response object
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//to access the static pages which are in the public folder
app.use(express.static('./assets'));

//set the view engine as embedded js. which is used to render the data into html pages.
app.set('view engine', 'ejs');

// override with POST having ?_method=PUT or DELETE
app.use(methodOverride('_method'));

//logger for all URIs
app.use(morgan('tiny'));

app.get('/', (req, res) => {
    //the root route will be rendered with index.html
    res.render('index', { root: __dirname });
});

//mount the route module, which handles all
//requests with the url prefix ‘/stories’
app.use('/trades',tradeRoutes);
app.use('/trading',tradingRoutes);
app.use('/users', userRoutes);
app.use('/site',siteRoutes);

//middleware function which recieves all urls other than /stories and loads an 404 error
app.use((req,res,next)=>{
    let err=new Error('The server cannot locate'+ req.url);
    err.status=404;
    next(err);
})

app.use((err,req,res,next)=>{
   // console.log(err.stack);
    if(!err.status){
       err.status=500;
       err.message=("Internal Server Error");
   } 
   res.status(err.status);
   res.render('./OtherPages/error',{error:err});
});

