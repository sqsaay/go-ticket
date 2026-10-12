const router = require('express').Router();
const eventsController = require('../controllers/events');
const { validateId, validateEvent } = require('../middleware/validation');

router.get('/', eventsController.getAll);
router.get('/:id', validateId, eventsController.getSingle);
router.post('/', validateEvent, eventsController.create);
router.put('/:id', validateId, validateEvent, eventsController.update);
router.delete('/:id', validateId, eventsController.remove);

module.exports = router;
