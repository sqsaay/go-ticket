const router = require('express').Router();
const passport = require('passport');

router.use('/', require('./swagger'));
router.use('/users', require('./users'));
router.use('/events', require('./events'));
router.use('/venues', require('./venues'));
router.use('/tickets', require('./tickets'));

router.get('/', (req, res) => {
  const user = req.session?.user;
  const identity = user
    ? `<p>Signed in as ${escapeHtml(user.displayName)}</p><a href="/logout">Log out</a>`
    : '<a href="/login">Log in with GitHub</a>';

  return res.type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>GoTicket API</title></head>
<body>
  <h1>Welcome to GoTicket API</h1>
  ${identity}
  <p><a href="/api-docs">API documentation</a></p>
</body>
</html>`);
});

router.get('/login', (req, res, next) => {
  if (!req.app.locals.oauthEnabled) {
    return res.status(503).json({ message: 'GitHub OAuth is not configured' });
  }

  return passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  if (!req.app.locals.oauthEnabled) {
    return res.status(503).json({ message: 'GitHub OAuth is not configured' });
  }

  return passport.authenticate('github', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'GitHub authentication failed or user is inactive' });
    }

    return req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.session.user = {
        id: user._id.toString(),
        displayName: `${user.firstName} ${user.lastName}`,
        role: user.role
      };

      return req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }
        return res.redirect('/');
      });
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  if (!req.session) {
    return res.redirect('/');
  }

  return req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie('goticket.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return res.redirect('/');
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

module.exports = router;
