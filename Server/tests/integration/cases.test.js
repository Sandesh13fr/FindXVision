import request from 'supertest';
import app from '../../src/index';
import { User } from '../../src/models/User';
import { Case } from '../../src/models/Case';
import { generateTokens } from '../../src/middleware/auth';

describe('Case Management Endpoints', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'GENERAL_USER',
    });
    await user.save();
    
    userId = user._id.toString();
    const tokens = generateTokens(user);
    userToken = tokens.accessToken;
  });

  describe('POST /api/cases', () => {
    it('should create a new case successfully', async () => {
      const caseData = {
        missingPerson: {
          firstName: 'Jane',
          lastName: 'Smith',
          age: 25,
          gender: 'FEMALE',
        },
        lastSeenLocation: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
        lastSeenDate: new Date().toISOString(),
        circumstances: 'Last seen leaving work at approximately 6 PM.',
        reportedBy: {
          name: 'John Doe',
          relationship: 'Brother',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
        },
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${userToken}`)
        .send(caseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.case.missingPerson.firstName).toBe('Jane');
      expect(response.body.data.case.caseNumber).toMatch(/^FXV-\d{4}-\d{6}$/);
    });

    it('should reject case without authentication', async () => {
      const caseData = {
        missingPerson: {
          firstName: 'Jane',
          lastName: 'Smith',
          age: 25,
          gender: 'FEMALE',
        },
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid case data', async () => {
      const invalidCaseData = {
        missingPerson: {
          firstName: '',
          lastName: 'Smith',
          age: -5,
          gender: 'INVALID',
        },
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidCaseData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/cases', () => {
    beforeEach(async () => {
      // Create some test cases
      const cases = [
        {
          missingPerson: { firstName: 'Alice', lastName: 'Johnson', age: 30, gender: 'FEMALE' },
          lastSeenLocation: {
            address: '456 Oak St',
            city: 'Somewhere',
            state: 'NY',
            country: 'USA',
            coordinates: { latitude: 40.7128, longitude: -74.0060 },
          },
          lastSeenDate: new Date(),
          circumstances: 'Test circumstances',
          reportedBy: { name: 'Reporter', relationship: 'Friend', phoneNumber: '+1234567890' },
          createdBy,
          lastUpdatedBy,
        },
        {
          missingPerson: { firstName: 'Bob', lastName: 'Wilson', age: 45, gender: 'MALE' },
          lastSeenLocation: {
            address: '789 Pine St',
            city: 'Elsewhere',
            state: 'TX',
            country: 'USA',
            coordinates: { latitude: 29.7604, longitude: -95.3698 },
          },
          lastSeenDate: new Date(),
          circumstances: 'Another test case',
          reportedBy: { name: 'Reporter2', relationship: 'Spouse', phoneNumber: '+1234567891' },
          createdBy,
          lastUpdatedBy,
        },
      ];

      await Case.insertMany(cases);
    });

    it('should retrieve cases for authenticated user', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cases).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter cases by status', async () => {
      const response = await request(app)
        .get('/api/cases?status=OPEN')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cases).toHaveLength(2);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/cases?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cases).toHaveLength(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });
});
