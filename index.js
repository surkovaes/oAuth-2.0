const express = require('express');
const app = express();
const port = 8081;
const path = require('path');
const session = require('express-session');

// Yandex
const YANDEX_CLIENT_ID = '5db2b6dc6414413b97161c67a6c0ae7d';
const YANDEX_CLIENT_SECRET = '049ec6568c4841c3954464db51224a74';

// Github
const GITHUB_CLIENT_ID = '45287694513cdc6db8eb';
const GITHUB_CLIENT_SECRET = '6027fcef96b597e494c1258c7a363eaa1aecdda9';

const passport = require('passport');
const res = require('express/lib/response');

// Yandex
const YandexStrategy = require('passport-yandex').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

app.use(session({ secret: "supersecret", resave: true, saveUninitialized: true }));

let Users = [
    {
        "login": "admin",
        "username": "surkovaes",
        "email": "lisa.srkv@yandex.ru"
    },
    {
        "login": "local_js_god",
        "username": "IliaGoss",
        "email": "ilia-gossudarev@yandex.ru"
    }
];

const findUserByLogin = (login) => {
    return Users.find((element) => {
        return element.login == login;
    });
}

// Yandex
const findUserByEmail = (email) => {
    return Users.find((element) => {
        return element.email.toLocaleLowerCase() == email.toLocaleLowerCase();
    });
}

// Github
const findUserByUsername = (username) => {
    return Users.find((element) => {
        return element.username == username;
    });
}

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.login);
});

passport.deserializeUser((login, done) => {
    user = findUserByLogin(login);
        done(null, user);
});

// Yandex
passport.use(new YandexStrategy({
    clientID: YANDEX_CLIENT_ID,
    clientSecret: YANDEX_CLIENT_SECRET,
    callbackURL: "http://localhost:8081/auth/yandex/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByEmail(profile.emails[0].value);

    user.profile = profile;

    if (user) {
        done(null, user);
    } else {
        done(true, null);
    }
  }
));

// Github
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8081/auth/github/callback"
    
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByUsername(profile.username);

    user.profile = profile;

    if (user) {
        done(null, user);
    } else {
        done(true, null);
    }
  }
));

const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/sorry');
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/sorry', (req, res) => {
    res.sendFile(path.join(__dirname, 'sorry.html'));
});

// Yandex
app.get('/auth/yandex', passport.authenticate('yandex'));
app.get('/auth/yandex/callback', passport.authenticate('yandex', { failureRedirect: '/sorry', successRedirect: '/private' }));

// Github
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/sorry', successRedirect: '/private' }));

app.get('/private', isAuth, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));