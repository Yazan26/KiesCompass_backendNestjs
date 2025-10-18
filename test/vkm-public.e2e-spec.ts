import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('VkmController - Public Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /vkm', () => {
    it('should retrieve all VKMs without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const vkm = response.body[0];
        expect(vkm).toHaveProperty('id');
        expect(vkm).toHaveProperty('name');
        expect(vkm).toHaveProperty('shortDescription');
        expect(vkm).toHaveProperty('description');
        expect(vkm).toHaveProperty('studyCredit');
        expect(vkm).toHaveProperty('location');
        expect(vkm).toHaveProperty('level');
        expect(vkm).toHaveProperty('isActive');
      }
    });

    it('should filter VKMs by location', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm?location=Den Bosch')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vkm: any) => {
        expect(vkm.location.toLowerCase()).toContain('den bosch'.toLowerCase());
      });
    });

    it('should filter VKMs by study credits', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm?studyCredit=15')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vkm: any) => {
        expect(vkm.studyCredit).toBe(15);
      });
    });

    it('should filter VKMs by level', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm?level=NLQF5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vkm: any) => {
        expect(vkm.level).toBe('NLQF5');
      });
    });

    it('should return empty array when no VKMs match filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/vkm?name=NonExistentVKM12345XYZ')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
