const isAuthenticated = (req, res, next) => {
  if (!req.app.locals.oauthEnabled) {
    return res.status(503).json({ message: 'GitHub OAuth is not configured' });
  }

  if (!req.session?.user) {
    return res.status(401).json({ message: 'You do not have access' });
  }

  return next();
};

module.exports = { isAuthenticated };
