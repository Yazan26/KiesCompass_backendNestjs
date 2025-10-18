import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply ValidationPipe like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueId = Date.now().toString().slice(-8); // Last 8 digits to keep username short
      const registerDto = {
        username: `user${uniqueId}`,
        email: `user${uniqueId}@example.com`,
        firstname: 'Test',
        lastname: 'User',
        password: 'password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', registerDto.username);
      expect(response.body).toHaveProperty('email', registerDto.email);
      expect(response.body).toHaveProperty('firstname', registerDto.firstname);
      expect(response.body).toHaveProperty('lastname', registerDto.lastname);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to register with invalid username', async () => {
      const uniqueId = Date.now();
      const registerDto = {
        username: 'ab', // Too short
        email: `test${uniqueId}@example.com`,
        firstname: 'Test',
        lastname: 'User',
        password: 'password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to register with weak password', async () => {
      const uniqueId = Date.now().toString().slice(-8);
      const registerDto = {
        username: `valid${uniqueId}`,
        email: `weak${uniqueId}@example.com`,
        firstname: 'Test',
        lastname: 'User',
        password: 'password', // No symbol
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    const uniqueId = Date.now().toString().slice(-8);
    const testUser = {
      username: `login${uniqueId}`,
      email: `login${uniqueId}@example.com`,
      firstname: 'Login',
      lastname: 'Test',
      password: 'password123!',
    };

    beforeAll(async () => {
      // Create a test user
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
      
      // Ensure user was created successfully
      expect(response.status).toBe(201);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(201); // POST endpoints default to 201 in NestJS

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(0);
    });

    it('should fail to login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail to login with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistentuser999',
          password: 'password123!',
        })
        .expect(401);
    });
  });
});
