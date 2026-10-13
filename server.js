const crypto = require('crypto');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const connectDatabase = require('./data/database');
const User = require('./models/user');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const oauthEnvironmentVariables = [
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];
const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL || process.env.CALLBACK_URL;
const missingOAuthVariables = oauthEnvironmentVariables.filter((name) => !process.env[name]);
if (!githubCallbackUrl) {
  missingOAuthVariables.push('GITHUB_CALLBACK_URL (or CALLBACK_URL)');
}
const oauthEnabled = missingOAuthVariables.length === 0;

app.locals.oauthEnabled = oauthEnabled;
app.set('trust proxy', 1);

app.use(express.json());
app.use(session({
  name: 'goticket.sid',
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

app.use(passport.session());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

if (oauthEnabled) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: githubCallbackUrl
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.find((entry) => entry.primary)?.value
        || profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('GitHub did not provide an email address'));
      }

      const displayName = profile.displayName?.trim() || profile.username;
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts.shift();
      const lastName = nameParts.join(' ') || 'GitHub User';

      const user = await User.findOneAndUpdate(
        { oauthProvider: 'github', oauthId: String(profile.id) },
        {
          $set: { firstName, lastName, email },
          $setOnInsert: { role: 'attendee', isActive: true }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      if (!user.isActive) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  console.warn(`GitHub OAuth disabled; configure: ${missingOAuthVariables.join(', ')}`);
}

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
  } else if (err.code === 11000) {
    statusCode = 409;
  }

  const message = statusCode === 500 ? 'Internal server error' : err.message;
  return res.status(statusCode).json({ message });
});

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Database is listening and server is running on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server', err);
    process.exitCode = 1;
  });
}

module.exports = app;
