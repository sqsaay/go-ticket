const request = require('supertest');
const app = require('../server');
const User = require('../models/user');
const Event = require('../models/event');
const Venue = require('../models/venue');
const Ticket = require('../models/ticket');

const validId = '507f1f77bcf86cd799439011';

const resources = [
  {
    name: 'Users',
    path: '/users',
    model: User,
    singular: 'user',
    record: { _id: validId, firstName: 'Taylor', lastName: 'Example' },
    emptyStatus: 200,
    emptyBody: [],
    listErrorBody: { message: 'Failed to fetch users' },
    singleErrorBody: { message: 'Failed to fetch user' },
    invalidIdBody: {
      message: 'Validation failed',
      errors: ['id must be a 24-character MongoDB ID']
    }
  },
  {
    name: 'Events',
    path: '/events',
    model: Event,
    singular: 'event',
    record: { _id: validId, title: 'Example event' },
    emptyStatus: 200,
    emptyBody: [],
    listErrorBody: { message: 'Failed to fetch events' },
    singleErrorBody: { message: 'Failed to fetch event' },
    invalidIdBody: {
      message: 'Validation failed',
      errors: ['id must be a 24-character MongoDB ID']
    }
  },
  {
    name: 'Venues',
    path: '/venues',
    model: Venue,
    singular: 'venue',
    record: { _id: validId, name: 'Example venue' },
    emptyStatus: 404,
    emptyBody: { message: 'No venues found' },
    listErrorBody: {
      message: 'Failed to fetch venues',
      error: 'database unavailable'
    },
    singleErrorBody: {
      message: 'Failed to fetch venue',
      error: 'database unavailable'
    },
    invalidIdBody: { message: 'Invalid venue ID' }
  },
  {
    name: 'Tickets',
    path: '/tickets',
    model: Ticket,
    singular: 'ticket',
    record: { _id: validId, name: 'Example ticket' },
    emptyStatus: 404,
    emptyBody: { message: 'No tickets found' },
    listErrorBody: {
      message: 'Failed to fetch tickets',
      error: 'database unavailable'
    },
    singleErrorBody: {
      message: 'Failed to fetch ticket',
      error: 'database unavailable'
    },
    invalidIdBody: { message: 'Invalid ticket ID' }
  }
];

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(resources)('$name GET routes', (resource) => {
  describe('GET collection', () => {
    it('returns all records with status 200', async () => {
      jest.spyOn(resource.model, 'find').mockResolvedValue([resource.record]);

      const response = await request(app).get(resource.path);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([resource.record]);
    });

    it('returns the expected response when no records exist', async () => {
      jest.spyOn(resource.model, 'find').mockResolvedValue([]);

      const response = await request(app).get(resource.path);

      expect(response.status).toBe(resource.emptyStatus);
      expect(response.body).toEqual(resource.emptyBody);
    });

    it('returns the expected error when the database query fails', async () => {
      jest.spyOn(resource.model, 'find').mockRejectedValue(new Error('database unavailable'));

      const response = await request(app).get(resource.path);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(resource.listErrorBody);
    });
  });

  describe('GET by ID', () => {
    it('returns the matching record with status 200', async () => {
      jest.spyOn(resource.model, 'findById').mockResolvedValue(resource.record);

      const response = await request(app).get(`${resource.path}/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(resource.record);
      expect(resource.model.findById).toHaveBeenCalledWith(validId);
    });

    it('returns 400 for an invalid ID', async () => {
      const findById = jest.spyOn(resource.model, 'findById');

      const response = await request(app).get(`${resource.path}/invalid-id`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(resource.invalidIdBody);
      expect(findById).not.toHaveBeenCalled();
    });

    it('returns 404 when no record matches the ID', async () => {
      jest.spyOn(resource.model, 'findById').mockResolvedValue(null);

      const response = await request(app).get(`${resource.path}/${validId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `${resource.singular[0].toUpperCase()}${resource.singular.slice(1)} not found` });
    });

    it('returns the expected error when the database query fails', async () => {
      jest.spyOn(resource.model, 'findById').mockRejectedValue(new Error('database unavailable'));

      const response = await request(app).get(`${resource.path}/${validId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(resource.singleErrorBody);
    });
  });
});
