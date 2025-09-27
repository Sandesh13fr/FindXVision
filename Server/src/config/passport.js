import passport from 'passport';
import { Strategy , ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user && user.isActive && !user.isLocked) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'oauth.google.id': profile.id });
      
      if (user) {
        // User exists, return user
        return done(null, user);
      }
      
      // Check if user exists with the same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
          // Link Google account to existing user
          user.oauth.google = {
            id: profile.id,
            email,
          };
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      if (email) {
        const newUser = new User({
          email: email.toLowerCase(),
          firstName: profile.name?.givenName || 'User',
          lastName: profile.name?.familyName || '',
          oauth: {
            google: {
              id: profile.id,
              email,
            },
          },
          profileImage: profile.photos?.[0]?.value,
        });
        
        await newUser.save();
        return done(null, newUser);
      }
      
      return done(new Error('No email found in Google profile'), false);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Passport session serialization (not used with JWT, but required)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
