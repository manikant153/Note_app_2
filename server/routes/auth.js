const express = require('express');
const passport = require('passport');
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async function (accessToken, refreshToken, profile, done) {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName || 'No last Name',
      profileImage: profile.photos[0].value,
    };
    try {
      // Find user by googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (error) {
      console.log(error);
      done(error, null);
    }
  }
));

// Google OAuth routes
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account'  // Force Google to show the sign-up page
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard'
  })
);

router.get('/login-failure', (req, res) => {
  res.send('Something went wrong');
});

// Destroy the session and log the user out
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log('Error logging out:', err);
      res.send('Error logging out');
    } else {
      req.session.destroy(error => {
        if (error) {
          console.log('Error destroying session:', error);
        } else {
          // Clear the cookie and redirect to the home page
          res.clearCookie('connect.sid', { path: '/' });
          res.redirect('/');  // Redirect to home page after logout
        }
      });
    }
  });
});

// Session serialization and deserialization
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = router;
