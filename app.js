require('dotenv').config();

const express = require('express');
const expresslayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connecrtDB = require('./server/config/db');
// why using session -To user be log-in through the session
const session = require('express-session');
// authentication used passport
const passport = require('passport');
const MongoStore = require('connect-mongo');


const app = express();
const port = 5000 || process.env.PORT;

// Creating session
app.use(session({
    // secret key Coding is Everything
    secret: 'Coding is Everything',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
}));

// Initilize the passport
app.use(passport.initialize());
app.use(passport.session());

// To pass data from form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// connected to database
connecrtDB();

// static file
app.use(express.static('public'));

// template engine
app.use(expresslayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routing folder
app.use('/', require('./server/routes/auth'))
app.use('/', require('./server/routes/index'))
app.use('/', require('./server/routes/dashboard'))

app.get('*', function (req, res) {
    res.status(404).render('404');
})
app.listen(port, () => {
    console.log(`App listening on port ${port} `);

});