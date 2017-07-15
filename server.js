const Promise = require(`bluebird`);
const express = require(`express`);
const passport = require(`passport`);
const Strategy = require(`passport-local`).Strategy;
const db = require(`./temp-db`);
const port = process.env.PORT || 8080;
const LocalStrategy = require(`passport-local`).Strategy;

const admin = require(`firebase-admin`);
const serviceAccount = require(`./firebase-key.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://personal-trainer-49ca7.firebaseio.com/`
});

const root = admin.database().ref(`/`);
const users = admin.database().ref(`/users`);

passport.use(new Strategy(
  function(username, password, cb) {
    // Change this to use Firebase.
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set(`views`, __dirname + `/views`);
app.set(`view engine`, `html`);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
//app.use(require(`cookie-parser`)());
//app.use(require(`cookie-parser`)());
app.use(require(`body-parser`).urlencoded({ extended: true }));
app.use(require(`express-session`)({ secret: `keyboard cat`, resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get(`/`,
  function(req, res) {
    if (req.user) {
      res.json({ message: `home` });
    } else {
      res.json({ message: `You are not logged in!` });
    }
  });

app.get(`/login`,
  function(req, res){
    if (req.user) {
      res.json({ message: `Welcome, ${req.user.username}`})
    } else {
        res.json({ message: `Please log in!` });
    }
  });

app.post(`/signup`,
  (req, res) => {
    users.once(`value`).then((snapshot) => {
      let users = snapshot.val();
      for (let user in users) {
        if (users[user].name == req.body.username) {
          res.json({
            message: `That username is already taken.`
          });
        }
      }
      res.json({
        message: `That username is available!`
      });
    });
  }
);

app.post(`/login`,
  passport.authenticate(`local`, { failureRedirect: `/login` }),
  function(req, res) {
    res.redirect(`/`);
  }
);

app.get(`/logout`,
  function(req, res){
    req.logout();
    res.redirect(`/`);
  }
);


app.listen(3000);
