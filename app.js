const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const connectDb = require('./config/db');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

// load config
dotenv.config({ path: './config/config.env' });

// passport config
require('./config/passport')(passport);

// logging
const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

connectDb();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  }),
);

// handlebar helpers
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require('./helpers/hbs');

// handlebars
app.engine(
  '.hbs',
  exphbs({
    helpers: {
      formatDate,
      truncate,
      stripTags,
      editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  }),
);
app.set('view engine', '.hbs');

// sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }),
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// local variables
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// static
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server is running in ${process.env.NODE_ENV} mode on ${PORT}`),
);
