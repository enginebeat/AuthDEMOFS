const express = require('express');

const bodyParser = require('body-parser');

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

let app = express();

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: false
}))
app.get('/', (req, res)=>{
    res.render('index');
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.post('/register', (req, res)=>{
    let user = new User(req.body);
    user.save((err)=>{
        if(err){
            let error = 'Something bad happened! Please try again.'

            if(err.code === 11000){
                error = 'That email is already taken, please try another.'
            }

            return res.render('register', {error:error});
        }

        res.redirect('/dashboard');
    });

});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.post('/login', (req, res)=>{
    User.findOne({ email: req.body.email }, (err, user)=>{
        if(err || !user || req.body.password != user.password){
            return res.render('login', {
                error: 'Incorrect email / password.'
            });
        }
        res.redirect('/dashboard');
    });
});

app.get('/dashboard', (req, res)=>{
    res.render('dashboard');
});

app.listen(3000, ()=>{
    console.log('server running on port 3000');
});