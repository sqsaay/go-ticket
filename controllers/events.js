const Event = require('../models/event');

const getAll = async (req, res) => {
  //#swagger.tags = ['Events']
  //#swagger.responses[200] = { description: 'OK' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const events = await Event.find();
    return res.status(200).json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags = ['Events']
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[200] = { description: 'OK' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch event' });
  }
};

const create = async (req, res) => {
  //#swagger.tags = ['Events']
  //#swagger.parameters['body'] = { in: 'body', description: 'Event document to create', required: true, schema: { $ref: '#/definitions/EventCreate' } }
  //#swagger.responses[201] = { description: 'Created' }
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  const input = req.body;
  const eventData = {
    title: input.title,
    description: input.description,
    date: input.date,
    time: input.time,
    venueId: input.venueId,
    price: input.price,
    category: input.category,
    status: input.status,
    organizerId: input.organizerId,
    isActive: input.isActive
  };

  try {
    const event = await Event.create(eventData);
    return res.status(201).json(event);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.name === 'ValidationError'
          ? Object.values(err.errors).map((validationError) => validationError.message)
          : [err.message]
      });
    }

    return res.status(500).json({ message: 'Failed to create event' });
  }
};

const update = async (req, res) => {
  //#swagger.tags = ['Events']
  //#swagger.parameters['body'] = { in: 'body', description: 'Replacement event document', required: true, schema: { $ref: '#/definitions/EventUpdate' } }
  //#swagger.responses[204] = { description: 'No Content' }
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  const input = req.body;
  const eventData = {
    title: input.title,
    description: input.description,
    date: input.date,
    time: input.time,
    venueId: input.venueId,
    price: input.price,
    category: input.category,
    status: input.status === undefined ? 'draft' : input.status,
    organizerId: input.organizerId,
    isActive: input.isActive === undefined ? true : input.isActive
  };

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.overwrite(eventData);
    await event.save();
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

    return res.status(500).json({ message: 'Failed to update event' });
  }
};

const remove = async (req, res) => {
  //#swagger.tags = ['Events']
  //#swagger.responses[400] = { description: 'Bad Request' }
  //#swagger.responses[204] = { description: 'No Content' }
  //#swagger.responses[404] = { description: 'Not Found' }
  //#swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const result = await Event.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete event' });
  }
};

module.exports = { getAll, getSingle, create, update, remove };
