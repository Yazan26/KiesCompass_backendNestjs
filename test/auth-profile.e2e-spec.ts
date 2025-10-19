import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('AuthController - Profile (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let userId: string;
  const testUser = {
    username: 'profiletest' + Date.now(),
    email: `profiletest${Date.now()}@example.com`,
    firstname: 'Profile',
    lastname: 'Tester',
    password: 'password123!',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    userId = registerResponse.body.id;

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/profile', () => {
    it('should fail to get profile without authentication', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should retrieve user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('firstname', testUser.firstname);
      expect(response.body).toHaveProperty('lastname', testUser.lastname);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);
    });

    it('should fail with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', authToken) // Missing 'Bearer' prefix
        .expect(401);
    });
  });
});
