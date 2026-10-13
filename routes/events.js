const router = require('express').Router();
const eventsController = require('../controllers/events');
const { validateId, validateEvent } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', eventsController.getAll);
router.get('/:id', validateId, eventsController.getSingle);
router.post('/', isAuthenticated, validateEvent, eventsController.create);
router.put('/:id', isAuthenticated, validateId, validateEvent, eventsController.update);
router.delete('/:id', isAuthenticated, validateId, eventsController.remove);

module.exports = router;
