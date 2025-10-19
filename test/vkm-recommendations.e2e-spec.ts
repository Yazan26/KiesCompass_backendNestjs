import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('VkmController - Recommendations (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login a test user
    const username = 'recommendtest' + Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        firstname: 'Recommend',
        lastname: 'Tester',
        password: 'password123!',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username,
        password: 'password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /vkm/recommendations/me', () => {
    it('should fail to get recommendations without authentication', async () => {
      await request(app.getHttpServer())
        .get('/vkm/recommendations/me')
        .expect(401);
    });

    it('should retrieve recommendations with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm/recommendations/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10); // Default limit

      if (response.body.length > 0) {
        const vkm = response.body[0];
        expect(vkm).toHaveProperty('id');
        expect(vkm).toHaveProperty('name');
        expect(vkm).toHaveProperty('shortDescription');
        expect(vkm).toHaveProperty('studyCredit');
      }
    });

    it('should respect limit query parameter', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/vkm/recommendations/me?limit=${limit}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(limit);
    });

    it('should handle limit of 1', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm/recommendations/me?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/vkm/recommendations/me')
        .set('Authorization', 'Bearer invalid_token_123')
        .expect(401);
    });
  });

  describe('GET /vkm/:id', () => {
    it('should retrieve a single VKM by ID without authentication', async () => {
      // First get a list of VKMs
      const vkmsResponse = await request(app.getHttpServer())
        .get('/vkm')
        .expect(200);

      if (vkmsResponse.body.length === 0) {
        console.log('Skipping test: No VKMs available');
        return;
      }

      const vkmId = vkmsResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/vkm/${vkmId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', vkmId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('shortDescription');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('studyCredit');
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('isActive');
    });

    it('should return 404 for non-existent VKM ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      await request(app.getHttpServer())
        .get(`/vkm/${fakeId}`)
        .expect(404);
    });

    it('should include isFavorited field when authenticated', async () => {
      const vkmsResponse = await request(app.getHttpServer())
        .get('/vkm')
        .expect(200);

      if (vkmsResponse.body.length === 0) {
        console.log('Skipping test: No VKMs available');
        return;
      }

      const vkmId = vkmsResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/vkm/${vkmId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isFavorited');
      expect(typeof response.body.isFavorited).toBe('boolean');
    });
  });
});
