const isObject = (value) => value !== null
  && typeof value === 'object'
  && !Array.isArray(value);

const isObjectId = (value) => typeof value === 'string'
  && /^[a-f\d]{24}$/i.test(value);

const isDateValue = (value) => typeof value === 'string'
  && !Number.isNaN(Date.parse(value));

const validateBody = (resource, requiredFields, optionalChecks = {}) => (req, res, next) => {
  const body = req.body;
  const errors = [];

  if (!isObject(body) || Object.keys(body).length === 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [`${resource} must be a non-empty JSON object`]
    });
  }

  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      errors.push(`${field} is required and must be a non-empty string`);
    }
  }

  for (const [field, validate] of Object.entries(optionalChecks)) {
    if (body[field] !== undefined && !validate(body[field])) {
      errors.push(`${field} has an invalid value`);
    }
  }

  if (resource === 'User'
    && typeof body.email === 'string'
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push('email must be a valid email address');
  }

  if (resource === 'User') {
    if (typeof body.firstName === 'string' && body.firstName.trim().length > 50) {
      errors.push('firstName must be 50 characters or fewer');
    }
    if (typeof body.lastName === 'string' && body.lastName.trim().length > 50) {
      errors.push('lastName must be 50 characters or fewer');
    }
    if (body.role !== undefined && !['attendee', 'admin'].includes(body.role)) {
      errors.push('role must be attendee or admin');
    }
    if (body.oauthProvider !== undefined && !['google', 'github'].includes(body.oauthProvider)) {
      errors.push('oauthProvider must be google or github');
    }
    if (body.phone !== undefined
      && typeof body.phone === 'string'
      && !/^[0-9+()\-\s]{7,20}$/.test(body.phone)) {
      errors.push('phone must be a valid phone number');
    }
  }

  if (resource === 'Event') {
    if (typeof body.title === 'string' && (body.title.trim().length < 3 || body.title.trim().length > 120)) {
      errors.push('title must be between 3 and 120 characters');
    }
    if (typeof body.description === 'string' && body.description.trim().length < 10) {
      errors.push('description must be at least 10 characters');
    }
    if (body.date !== undefined && !isDateValue(body.date)) {
      errors.push('date must be a valid date');
    }
    if (body.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) {
      errors.push('time must be in HH:MM 24 hour format');
    }
    if (body.venueId !== undefined && !isObjectId(body.venueId)) {
      errors.push('venueId must be a 24-character MongoDB ID');
    }
    if (body.organizerId !== undefined && !isObjectId(body.organizerId)) {
      errors.push('organizerId must be a 24-character MongoDB ID');
    }
    if (body.price !== undefined
      && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0)) {
      errors.push('price must be a non-negative number');
    }
    if (body.price === undefined) {
      errors.push('price is required and must be a non-negative number');
    }
    if (body.category !== undefined
      && !['concert', 'conference', 'sports', 'theatre', 'festival', 'workshop', 'other'].includes(body.category)) {
      errors.push('category has an invalid value');
    }
    if (body.status !== undefined
      && !['draft', 'published', 'cancelled', 'completed'].includes(body.status)) {
      errors.push('status has an invalid value');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  return next();
};

const validateId = (req, res, next) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: ['id must be a 24-character MongoDB ID']
    });
  }

  return next();
};

const validateUser = validateBody('User', ['firstName', 'lastName', 'email'], {
  oauthId: (value) => typeof value === 'string',
  phone: (value) => typeof value === 'string',
  isActive: (value) => typeof value === 'boolean'
});

const validateEvent = validateBody('Event', [
  'title',
  'description',
  'date',
  'time',
  'venueId',
  'category'
], {
  date: isDateValue,
  time: (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
  venueId: isObjectId,
  organizerId: isObjectId,
  price: (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
  category: (value) => ['concert', 'conference', 'sports', 'theatre', 'festival', 'workshop', 'other'].includes(value),
  status: (value) => ['draft', 'published', 'cancelled', 'completed'].includes(value),
  isActive: (value) => typeof value === 'boolean'
});

module.exports = { validateId, validateUser, validateEvent };
