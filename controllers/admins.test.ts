import request from 'supertest';
import 'jest-extended';
import app from '../app';
import prisma from '../prisma/client';
import {
  errorTypes,
  authRequiredError,
  incorrectCredentialsError,
  unauthorizedError
} from '../utils/errorObject';

const url = '/api/v1/admins';

type AdminType = {
  username: string;
  email: string;
  password: string;
  role?: 'SUPERADMIN' | 'ADMIN' | 'MOERATOR';
};

const testAdmin: AdminType = {
  username: 'testadmin',
  email: 'testadmin7@gmail.com',
  password: 'testadminpassword'
};

let authToken = '';

describe('Admins', () => {
  describe('Login Admin', () => {
    it('POST /admins/login --> should login as admin', async () => {
      const response = await request(app)
        .post(`${url}/login`)
        .send({ email: 'superadmin@gmail.com', password: 'superadmin' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeString();
      authToken = response.body.token;
    });

    it('POST /admins/login --> should throw error if required fields not include', async () => {
      const response = await request(app)
        .post(`${url}/login`)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        status: 400,
        type: 'invalidArgument',
        message: 'invalid one or more argument(s)',
        detail: [
          {
            code: 'missingEmail',
            message: 'email field is missing'
          },
          {
            code: 'missingPassword',
            message: 'password field is missing'
          }
        ]
      });
    });

    it('POST /admins/login --> should throw error if email or password is incorrect', async () => {
      const response = await request(app)
        .post(`${url}/login`)
        .send({ email: 'dummy@gmail.com', password: 'wrongpassword' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual(incorrectCredentialsError);
    });
  });

  describe('Create Admin', () => {
    it('POST /admins --> should create an admin', async () => {
      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + authToken)
        .send(testAdmin)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining(testAdmin));

      // delete admin after register and test
      const deleteAdmin = await prisma.admin.delete({
        where: { email: testAdmin.email }
      });
      expect(deleteAdmin).toBeDefined();
    });

    it('POST /admins --> should throw error if not authorized', async () => {
      const loginResponse = await request(app)
        .post(`${url}/login`)
        .send({ email: 'admin@gmail.com', password: 'admin' })
        .expect('Content-Type', /json/)
        .expect(200);
      const loginAdminToken = loginResponse.body.token;

      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + loginAdminToken)
        .send(testAdmin)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual(unauthorizedError);
    });

    it('POST /admins --> should throw error if email already exists', async () => {
      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + authToken)
        .send({ ...testAdmin, email: 'superadmin@gmail.com' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        status: 400,
        type: 'alreadyExists',
        message: 'email already exists'
      });
    });

    it('POST /admins --> throws error if required field is missing', async () => {
      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + authToken)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        status: 400,
        type: 'invalidArgument',
        message: 'invalid one or more argument(s)',
        detail: [
          {
            code: 'missingUsername',
            message: 'username field is missing'
          },
          {
            code: 'missingEmail',
            message: 'email field is missing'
          },
          {
            code: 'missingPassword',
            message: 'password field is missing'
          }
        ]
      });
    });

    it('POST /admins --> should validate email', async () => {
      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + authToken)
        .send({ ...testAdmin, email: 'thisisnotavalidemailaddress' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        status: 400,
        type: errorTypes.invalidArgument,
        message: 'email is not valid'
      });
    });

    it('POST /admins --> should throw error if role is not superadmin, admin, or mod', async () => {
      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + authToken)
        .send({ ...testAdmin, role: 'DUMMY' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual({
        status: 400,
        type: errorTypes.invalidArgument,
        message: 'role type is not valid',
        detail: [
          {
            code: 'invalidRole',
            message:
              "role must be one of 'SUPERADMIN', 'ADMIN', and 'MODERATOR'"
          }
        ]
      });
    });
  });

  describe('Access Protected Route', () => {
    it('GET /admins/me --> should require authentication', async () => {
      const response = await request(app)
        .get(`${url}/me`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual(authRequiredError);
    });

    it('GET /admins/me --> should return logged in user', async () => {
      const response = await request(app)
        .get(`${url}/me`)
        .set('Authorization', 'Bearer ' + authToken)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: expect.any(Number),
        username: expect.any(String),
        email: expect.any(String),
        role: expect.toBeOneOf(['SUPERADMIN', 'ADMIN', 'MODERATOR'])
      });
    });
  });
});
