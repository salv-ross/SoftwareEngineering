import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import { register, registerAdmin, login, logout } from '../controllers/auth.js'

dotenv.config();

// admin cookies
const adminAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJlbWFpbCI6InRlc3RAZW1haWwuaXQiLCJyb2xlIjoiQWRtaW4iLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE4NCJ9.tLKsJc1RZ_fPDwaTNM8Ur4ru4N8rJEZ4C2nXxN_99BA";
const adminRefreshToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJlbWFpbCI6InRlc3RAZW1haWwuaXQiLCJyb2xlIjoiQWRtaW4iLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE4NCJ9.tLKsJc1RZ_fPDwaTNM8Ur4ru4N8rJEZ4C2nXxN_99BA";


// user cookies
const regularUserAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXJfcmVndWxhciIsImVtYWlsIjoidGVzdF9yZWd1bGFyQGVtYWlsLml0Iiwicm9sZSI6IlVzZXIiLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE3NCJ9.Xbxg3WB2Wb9OFEhVwiYVaEtYLwsjpWAL0nQTPhwTG-k";
const regularUserRefreshToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXJfcmVndWxhciIsImVtYWlsIjoidGVzdF9yZWd1bGFyQGVtYWlsLml0Iiwicm9sZSI6IlVzZXIiLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE3NCJ9.Xbxg3WB2Wb9OFEhVwiYVaEtYLwsjpWAL0nQTPhwTG-k";


beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('register', () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('user already registered', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "email@gmail.com",
      password: "prova"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/register")
        .send({
          username: "existingUsername",
          email: "email@gmail.com",
          password: "prova"
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("you are already registered");
          done();
        })
        .catch((err) => done(err));
    });
  });


  test('email already registered', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "email@gmail.com",
      password: "prova"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/register")
        .send({
          username: "newUsername",
          email: "email@gmail.com",
          password: "prova"
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("email already registered");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('body does not contain all necessary attributes', (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "",
        email: "email@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("One of the attributes is empty");
        done();
      })
      .catch((err) => done(err));
  });

  test('email with wrong format', (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "newUsername",
        email: "email",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Email not valid format");
        done();
      })
      .catch((err) => done(err));
  });

  test('body does contain an empty string', (done) => {
    request(app)
      .post("/api/register")
      .send({
        email: "email@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes");
        done();
      })
      .catch((err) => done(err));
  });

  test('correct registration', (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "newUsername",
        email: "newemail@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("User added successfully");
        done();
      })
      .catch((err) => done(err));
  });

});

describe("registerAdmin", () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('missing attributes', (done) => {
    request(app)
      .post("/api/admin")
      .send({
        // username missing
        email: "email@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes");
        done();
      })
      .catch((err) => done(err));
  });

  test('empty string', (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "",
        email: "email@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("One of the attributes is empty");
        done();
      })
      .catch((err) => done(err));
  });

  test('email not in a valid format', (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "newUsername",
        email: "emailNotValid",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Email not valid format");
        done();
      })
      .catch((err) => done(err));
  });

  test('user already registered', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "email@gmail.com",
      password: "prova"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/admin")
        .send({
          username: "existingUsername",
          email: "newEmail@gmail.com",
          password: "prova"
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("you are already registered");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('email already registered', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "existingEmail@gmail.com",
      password: "prova"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/admin")
        .send({
          username: "newUsername",
          email: "existingEmail@gmail.com",
          password: "prova"
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("email already registered");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('correct registration', (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "newUsername",
        email: "existingEmail@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.message).toEqual("User added successfully");
        done();
      })
      .catch((err) => done(err));
  });
});

describe('login', () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('missing attributes', (done) => {
    request(app)
      .post("/api/login")
      .send({
        // email missing
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Missing attributes");
        done();
      })
      .catch((err) => done(err));
  });

  test('empty string', (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("One of the attributes is empty");
        done();
      })
      .catch((err) => done(err));
  });

  test('email not in a valid format', (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "emailNotValid",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("Email not valid format");
        done();
      })
      .catch((err) => done(err));
  });

  test('user does not exist', (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "email@gmail.com",
        password: "prova"
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("please you need to register");
        done();
      })
      .catch((err) => done(err));
  });

  test('password does not match', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "existingEmail@gmail.com",
      password: "myPassword"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/login")
        .send({
          email: "existingEmail@gmail.com",
          password: "otherPassword"
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("wrong credentials");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('you re already logged in', (done) => {

    request(app)
      .post("/api/login")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
      .send({
        email: "existingEmail@gmail.com",
        password: "otherPassword",

      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.error).toEqual("you are already logged in");
        done();
      })
      .catch((err) => done(err));
  });


  test('correct login', (done) => {
    const testRegister = new User({
      username: "existingUsername",
      email: "existingEmail@gmail.com",
      password: "$2a$12$xNevBpwBlqdiaCekP34l8OslqAEhjOdCHPEu6q6MUSyEP0CvQvp6a"
    });

    testRegister.save().then(() => {
      request(app)
        .post("/api/login")
        .send({
          email: "existingEmail@gmail.com",
          password: "admin"
        })
        .then((response) => {
          expect(response.status).toBe(200);
          done();
        })
        .catch((err) => done(err));
    });
  });

});

describe('logout', () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('logout correctly', (done) => {

    const existingAdmin = new User({
      username: "existingAdmin",
      email: "existingAdmin@email.com",
      password: "myAdmin",
      refreshToken: adminRefreshToken,
      role: "Admin",
    });

    const existingUser = new User({
      username: "existingUsername",
      email: "existingEmail@email.com",
      password: "myPassword",
      refreshToken: regularUserRefreshToken,
      role: "User",
    });

    Promise.all([existingUser.save(), existingAdmin.save()]).then(() => {
      request(app)
        .get("/api/logout")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body.data.message).toEqual("User logged out");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('missing cookies', (done) => {

    const existingAdmin = new User({
      username: "existingAdmin",
      email: "existingAdmin@email.com",
      password: "myAdmin",
      refreshToken: adminRefreshToken,
      role: "Admin",
    });

    const existingUser = new User({
      username: "existingUsername",
      email: "existingEmail@email.com",
      password: "myPassword",
      refreshToken: regularUserRefreshToken,
      role: "User",
    });

    Promise.all([existingUser.save(), existingAdmin.save()]).then(() => {
      request(app)
        .get("/api/logout")
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("You have to be logged in to log out");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('refresh token does not represent any user', (done) => {

    const existingAdmin = new User({
      username: "existingAdmin",
      email: "existingAdmin@email.com",
      password: "myAdmin",
      refreshToken: adminRefreshToken,
      role: "Admin",
    });

    const existingUser = new User({
      username: "existingUsername",
      email: "existingEmail@email.com",
      password: "myPassword",
      refreshToken: regularUserRefreshToken,
      role: "User",
    });

    Promise.all([existingUser.save(), existingAdmin.save()]).then(() => {
      request(app)
        .get("/api/logout")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=randomRefreshToken`)
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.error).toEqual("user not found");
          done();
        })
        .catch((err) => done(err));
    });
  });


});
