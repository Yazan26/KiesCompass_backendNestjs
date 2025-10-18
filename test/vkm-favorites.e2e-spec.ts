import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('VkmController - Favorites (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let vkmId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login a test user
    const username = 'favoritetest' + Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        firstname: 'Favorite',
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

    // Get a VKM ID for testing
    const vkmsResponse = await request(app.getHttpServer())
      .get('/vkm')
      .expect(200);

    if (vkmsResponse.body.length > 0) {
      vkmId = vkmsResponse.body[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /vkm/:id/favorite', () => {
    it('should fail to toggle favorite without authentication', async () => {
      if (!vkmId) {
        console.log('Skipping test: No VKM available');
        return;
      }

      await request(app.getHttpServer())
        .post(`/vkm/${vkmId}/favorite`)
        .expect(401);
    });

    it('should toggle favorite status with authentication', async () => {
      if (!vkmId) {
        console.log('Skipping test: No VKM available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/vkm/${vkmId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isFavorited');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.isFavorited).toBe('boolean');
    });

    it('should return 404 for non-existent VKM', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      await request(app.getHttpServer())
        .post(`/vkm/${fakeId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /vkm/favorites', () => {
    it('should fail to get favorites without authentication', async () => {
      await request(app.getHttpServer())
        .get('/vkm/favorites')
        .expect(401);
    });

    it('should retrieve user favorites with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vkm: any) => {
        expect(vkm).toHaveProperty('id');
        expect(vkm).toHaveProperty('name');
        expect(vkm).toHaveProperty('isFavorited', true);
      });
    });
  });
});
