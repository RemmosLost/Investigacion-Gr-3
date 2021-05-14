const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const passport = require('passport');

//init
const app = express();
require('./database');
require('./config/passport');

// settings
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// routes
app.use(require('./routes'));
app.use('/auth',require('./routes/authentication'));
app.use('/notes',require('./routes/note'));

// statics
app.use(express.static(path.join(__dirname, 'public')));

// start the server
app.listen(app.get('port') , () => {
    console.log('Server on port ', app.get('port'))
});