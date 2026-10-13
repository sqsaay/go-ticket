const router = require('express').Router();
const venuesController = require('../controllers/venues');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', venuesController.getAll);
router.get('/:id', venuesController.getSingle);
router.post('/', isAuthenticated, venuesController.createVenue);
router.put('/:id', isAuthenticated, venuesController.updateVenue);
router.delete('/:id', isAuthenticated, venuesController.deleteVenue);

module.exports = router;
