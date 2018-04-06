const express =     require('express');
const bodyParser =  require('body-parser');
const sessions =    require('client-sessions');
const bcrypt =      require('bcryptjs');
const csurf =       require('csurf');
const helmet =      require('helmet');

//require DB connection module
const mongoose = require('mongoose');
//connect to the database
mongoose.connect('mongodb://localhost/ss-auth');
// define model(Schema) for your database
let User = mongoose.model('User', new mongoose.Schema({
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
}));

/************* loginRequired middleware ********************* */
function loginRequired(req, res, next){
    if(!req.user){
        return res.redirect('/login');
    }
    next();
}


let app = express();

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: false
}));

/*******CSRF Cross Site Request Forgery handling ********** */
app.use(csurf());
/* now add { csrfToken: req.csrfToken() } to any places that call render
and have a form */

app.use(sessions({
    cookieName: 'session',
    secret: 'qapernfhd3241edrf',
    duration: 30 * 60 * 1000,    //30 mins
    activeDuration: 5 * 60 * 1000, //5 minutes
    httpOnly: true, // don't let JS code access cookies
    secure: true,   // only set cookies over https
    ephemeral: true // destroy cookies when the browser closes
}));


/**********manage http header security****** */
app.use(helmet());

/**************************************************************************** */
/**                        Routes                                             */
/**************************************************************************** */
app.get('/', (req, res)=>{
    res.render('index');
});

/************************* register Routes *********************************** */
app.get('/register', (req, res)=>{
    res.render('register', { csrfToken: req.csrfToken() });
});

app.post('/register', (req, res)=>{
    /* 14 is the encryption factor for bcrypt. The higher the level 
    the safer it will be, but it will also take longer ot calculate, so use
    it care. 14 is the current feasible value being used */
    let hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;
    let user = new User(req.body);
    user.save((err)=>{
        if(err){
            let error = 'Something bad happened! Please try again.'

            if(err.code === 11000){
                error = 'That email is already taken, please try another.'
            }

            return res.render('register', {
                error:error,
                csrfToken: req.csrfToken()
            });
        }

        res.redirect('/dashboard');
    });

});
/****************************** login Routes ************************************* */
app.get('/login', (req, res)=>{
    res.render('login', { csrfToken: req.csrfToken() });
});

app.post('/login', (req, res)=>{
    User.findOne({ email: req.body.email }, (err, user)=>{
        if(!user || !bcrypt.compareSync(req.body.password, user.password)){
            return res.render('login', {
                error: 'Incorrect email / password.'
            });
        }
        req.session.userId = user._id;
        res.redirect('/dashboard');
    });
});
/********************** dashboard routes ******************************************** */
app.get('/dashboard', loginRequired, (req, res, next)=>{
    if(!(req.session && req.session.userId)){
        return res.redirect('/login');
    }
    User.findById(req.session.userId, (err, user)=>{
        if(err){
            return next(err);
        }
        if(!user){
            return res.redirect('/login');
        }
        res.render('dashboard');
    });
});

/****************************************************************** */
app.listen(3000, ()=>{
    console.log('server running on port 3000');
});