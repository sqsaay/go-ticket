const router = require('express').Router();
const usersController = require('../controllers/users');
const { validateId, validateUser } = require('../middleware/validation');

router.get('/', usersController.getAll);
router.get('/:id', validateId, usersController.getSingle);
router.post('/', validateUser, usersController.create);
router.put('/:id', validateId, validateUser, usersController.update);
router.delete('/:id', validateId, usersController.remove);

module.exports = router;
