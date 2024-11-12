import * as request from 'supertest';
import app from '../app';
import 'jest-extended';
import { resource404Error } from '../utils/errorObject';
import prisma from '../prisma/client';

const url = '/api/v1/customers';

describe('Customers', () => {
  describe('Get Customers', () => {
    it('GET /customers --> should return all customers', async () => {
      const response = await request(app)
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            fullname: expect.any(String),
            email: expect.any(String),
            shippingAddress: expect.any(String),
            phone: expect.toBeOneOf([expect.any(String), null]),
            createdAt: expect.any(String),
            updatedAt: expect.toBeOneOf([expect.any(String), null])
          }
        ])
      );
    });

    it('GET /customers/:id --> should return specific customer', async () => {
      const response = await request(app)
        .get(`${url}/3`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: expect.any(Number),
        fullname: expect.any(String),
        email: expect.any(String),
        shippingAddress: expect.any(String),
        phone: expect.toBeOneOf([expect.any(String), null]),
        createdAt: expect.any(String),
        updatedAt: expect.toBeOneOf([expect.any(String), null])
      });
    });

    it('GET /customers/:id --> should throw 404 if user not found', async () => {
      const response = await request(app)
        .get(`${url}/999`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual(resource404Error);
    });
  });

  describe('Delete Customer', () => {
    it('DELETE /customers/:id --> should delete a customer', async () => {
      // create a customer to be deleted
      const customer = await prisma.customer.create({
        data: {
          email: 'testuser2@gmail.com',
          fullname: 'testuser',
          password: 'somerandompwd',
          shippingAddress: 'someaddr',
          createdAt: new Date().toISOString()
        }
      });
      const response = await request(app)
        .delete(`${url}/${customer.id}`)
        .expect(204);
    });

    it('DELETE /customers/:id --> should return 404 if user not found', async () => {
      const response = await request(app)
        .delete(`${url}/9999`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        ...resource404Error,
        message: 'record to delete does not exist.'
      });
    });
  });
});