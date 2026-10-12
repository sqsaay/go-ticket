const router = require('express').Router();

router.use('/', require('./swagger'));
router.use('/users', require('./users'));
router.use('/events', require('./events'));
router.use('/venues', require('./venues'));
router.use('/tickets', require('./tickets'));

router.get('/', (req, res) => {
  res.send('Welcome to GoTicket API');
});

module.exports = router;
