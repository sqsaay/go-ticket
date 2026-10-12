const User = require('../models/user');

const getAll = async (req, res) => {
  //#swagger.tags = ['Users']
  //#swagger.responses[200] = { description: 'OK' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags = ['Users']
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[200] = { description: 'OK' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const create = async (req, res) => {
  //#swagger.tags = ['Users']
  //#swagger.parameters['body'] = { in: 'body', description: 'User document to create', required: true, schema: { $ref: '#/definitions/UserCreate' } }
  //#swagger.responses[201] = { description: 'Created' }
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[409] = { description: 'Conflict' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  const input = req.body;
  const userData = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    role: input.role === undefined ? 'attendee' : input.role,
    oauthProvider: input.oauthProvider,
    oauthId: input.oauthId,
    phone: input.phone,
    isActive: input.isActive
  };

  try {
    const user = await User.create(userData);
    return res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.name === 'ValidationError'
          ? Object.values(err.errors).map((validationError) => validationError.message)
          : [err.message]
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exists' });
    }

    return res.status(500).json({ message: 'Failed to create user' });
  }
};

const update = async (req, res) => {
  //#swagger.tags = ['Users']
  //#swagger.parameters['body'] = { in: 'body', description: 'Replacement user document', required: true, schema: { $ref: '#/definitions/UserUpdate' } }
  //#swagger.responses[204] = { description: 'No Content' }
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[409] = { description: 'Conflict' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  const input = req.body;
  const userData = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    role: input.role === undefined ? 'attendee' : input.role,
    oauthProvider: input.oauthProvider,
    oauthId: input.oauthId,
    phone: input.phone,
    isActive: input.isActive === undefined ? true : input.isActive
  };

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.overwrite(userData);
    await user.save();
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.name === 'ValidationError'
          ? Object.values(err.errors).map((validationError) => validationError.message)
          : [err.message]
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exists' });
    }

    return res.status(500).json({ message: 'Failed to update user' });
  }
};

const remove = async (req, res) => {
  //#swagger.tags = ['Users']
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[204] = { description: 'No Content' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = { getAll, getSingle, create, update, remove };
