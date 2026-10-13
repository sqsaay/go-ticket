const router = require('express').Router();
const usersController = require('../controllers/users');
const { validateId, validateUser } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', usersController.getAll);
router.get('/:id', validateId, usersController.getSingle);
router.post('/', isAuthenticated, validateUser, usersController.create);
router.put('/:id', isAuthenticated, validateId, validateUser, usersController.update);
router.delete('/:id', isAuthenticated, validateId, usersController.remove);

module.exports = router;
