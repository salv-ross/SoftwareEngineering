import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';


const adminAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJlbWFpbCI6InRlc3RAZW1haWwuaXQiLCJyb2xlIjoiQWRtaW4iLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE4NCJ9.tLKsJc1RZ_fPDwaTNM8Ur4ru4N8rJEZ4C2nXxN_99BA";
const adminRefreshToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJlbWFpbCI6InRlc3RAZW1haWwuaXQiLCJyb2xlIjoiQWRtaW4iLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE4NCJ9.tLKsJc1RZ_fPDwaTNM8Ur4ru4N8rJEZ4C2nXxN_99BA";
/*{
  "iss": "EzWallet",
  "iat": 1685369734,
  "exp": 1716905734,
  "aud": "www.ezwallet.it",
  "sub": "noreply@ezwallet.it",
  "username": "test_user",
  "email": "test@email.it",
  "role": "Admin",
  "id": "645b5ac02472c24b7856aa84"
} */
const regularUserAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXJfcmVndWxhciIsImVtYWlsIjoidGVzdF9yZWd1bGFyQGVtYWlsLml0Iiwicm9sZSI6IlVzZXIiLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE3NCJ9.Xbxg3WB2Wb9OFEhVwiYVaEtYLwsjpWAL0nQTPhwTG-k";
const regularUserRefreshToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJFeldhbGxldCIsImlhdCI6MTY4NTM2OTczNCwiZXhwIjoxNzE2OTA1NzM0LCJhdWQiOiJ3d3cuZXp3YWxsZXQuaXQiLCJzdWIiOiJub3JlcGx5QGV6d2FsbGV0Lml0IiwidXNlcm5hbWUiOiJ0ZXN0X3VzZXJfcmVndWxhciIsImVtYWlsIjoidGVzdF9yZWd1bGFyQGVtYWlsLml0Iiwicm9sZSI6IlVzZXIiLCJpZCI6IjY0NWI1YWMwMjQ3MmMyNGI3ODU2YWE3NCJ9.Xbxg3WB2Wb9OFEhVwiYVaEtYLwsjpWAL0nQTPhwTG-k";
/*{
    "iss": "EzWallet",
    "iat": 1685369734,
    "exp": 1716905734,
    "aud": "www.ezwallet.it",
    "sub": "noreply@ezwallet.it",
    "username": "test_user_regular",
    "email": "test_regular@email.it",
    "role": "User",
    "id": "645b5ac02472c24b7856aa74"
}*/


/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('not an Admin', (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
      .send({})
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("Regular user not allowed");
        done();
      })
      .catch((err) => done(err));
  });

  test('no users in database', (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .send({})
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: [], refreshedTokenMessage: 'message' });
        done();
      })
      .catch((err) => done(err));
  });

  test('users correctly returned', (done) => {

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

    existingUser.save().then(() => {
      existingAdmin.save().then(() => {
        request(app)
          .get("/api/users")
          .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
              data: [{
                "email": "existingEmail@email.com",
                "role": "User",
                "username": "existingUsername",
              }, {
                "email": "existingAdmin@email.com",
                "role": "Admin",
                "username": "existingAdmin",
              },
              ], refreshedTokenMessage: 'message'
            });
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
})

describe("getUser", () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })


  test('user is not in database', (done) => {

    request(app)
      .get("/api/users/test_user_regular")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("User not found");
        done();
      })
      .catch((err) => done(err));

  });

  test('cookie does not match with username', (done) => {
    const testRegister = new User({
      username: "test_user_regular_2",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });

    testRegister.save().then(() => {
      request(app)
        .get("/api/users/test_user_regular")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({})
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("User not found");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('correct execution', (done) => {
    const testRegister = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });

    testRegister.save().then(() => {
      request(app)
        .get("/api/users/test_user_regular")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({})
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ data: { username: "test_user_regular", email: "email@gmail.com", role: "Regular" }, refreshedTokenMessage: 'message' });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('unauthorized', (done) => {
    request(app)
      .get("/api/users/test_user_regularr")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)

      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual("User not allowed");
        done();
      })
      .catch((err) => done(err));
  });

})

describe("createGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('not all attributes', (done) => {
    request(app)
      .post("/api/groups")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Missing attributes');
        done();
      })
      .catch((err) => done(err));
  });

  test('name is an empty string', (done) => {
    request(app)
      .post("/api/groups")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
      .send({ name: '', memberEmails: [] })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Name cannot be empty');
        done();
      })
      .catch((err) => done(err));
  });

  test('there is already a group with the same name', (done) => {
    const existingGroup = new Group({ name: 'existingGroup', members: [{ email: 'prova' }] });
    const testAdmin = new User({
      username: "admin",
      email: "email2@gmail.com",
      password: "prova2",
      role: 'Admin',
      refreshToken: adminRefreshToken
    });
    const testUser = new User({
      username: "test_user_regular",
      email: "test_regular@email.it",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([existingGroup.save(), testUser.save(), testAdmin.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'existingGroup', memberEmails: ['email2@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('Group with this name already exists');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('User not found', (done) => {
    const testAdmin = new User({
      username: "admin",
      email: "email2@gmail.com",
      password: "prova2",
      role: 'Admin',
      refreshToken: adminRefreshToken
    });

    Promise.all([testAdmin.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'existingGroup', memberEmails: ['email2@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('User not found');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('no valid user', (done) => {
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    const existingGroup = new Group({ name: 'existingGroup', members: [{ email: 'email2@gmail.com' }] });
    const testAdmin = new User({
      username: "test_admin",
      email: "email2@gmail.com",
      password: "prova2",
      role: 'Admin',
      refreshToken: adminRefreshToken
    });

    Promise.all([testUser.save(), existingGroup.save(), testAdmin.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'Group', memberEmails: ['emailacaso@gmail.com', 'email2@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('Emails do not exist or are already in other groups');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('user is already in a group', (done) => {
    const existingGroup = new Group({ name: 'existingGroup', members: [{ email: 'email@gmail.com' }] });
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([existingGroup.save(), testUser.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'Group', memberEmails: ['emailacaso@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('User already in a group');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('wrong email format', (done) => {
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'existingGroup', memberEmails: ['emailacaso'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('wrong email format');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('empty email', (done) => {
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'existingGroup', memberEmails: [''] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual('email cannot be empty');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('user not autenthicated', (done) => {
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .send({ name: 'existingGroup', memberEmails: ['email@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.message).toEqual('Unauthorized');
          done();
        })
        .catch((err) => done(err));
    });
  })

  test('group correctly added and user email added', (done) => {
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    const testAdmin = new User({
      username: "test_admin",
      email: "admin@gmail.com",
      password: "prova",
      refreshToken: adminRefreshToken
    });
    Promise.all([testUser.save(), testAdmin.save()]).then(() => {

      request(app)
        .post("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserAccessToken}`)
        .send({ name: 'Family', memberEmails: ['admin@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: {
              group: { name: "Family", members: [{ email: "admin@gmail.com" }, { email: "email@gmail.com" }] },
              membersNotFound: [], alreadyInGroup: []
            }, refreshedTokenMessage: 'message'
          });
          done();
        })
        .catch((err) => done(err));
    });
  })

})

describe("getGroups", () => {

  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('correct execution', (done) => {
    const testGroup = new Group({
      name: "test_group",
      members: [{ email: "email@gmail.com" }, { email: "email2@gmail.com" }]
    });

    testGroup.save().then(() => {
      request(app)
        .get("/api/groups")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({})
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            data: [{
              name: "test_group", members:
                [{ email: "email@gmail.com" }, { email: "email2@gmail.com" }]
            }], refreshedTokenMessage: 'message'
          });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('not ad admin calling', (done) => {
    const testGroup = new Group({
      name: "test_group",
      members: [{ email: "email@gmail.com" }, { email: "email2@gmail.com" }]
    });

    testGroup.save().then(() => {
      request(app)
        .get("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.message).toEqual("Regular user not allowed");
          done();
        })
        .catch((err) => done(err));
    });
  });

})

describe("getGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('group is not in database', (done) => {
    request(app)
      .get("/api/groups/Family")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Group does not exist');
        done();
      })
      .catch((err) => done(err));
  });

  test('Unauthorized', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });

    Promise.all([testGroup.save()]).then(() => {
      request(app)
        .get("/api/groups/testGroup")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.message).toEqual('User not in group');
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('Group correclty retrieved', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    Promise.all([testGroup.save()]).then(() => {
      request(app)
        .get("/api/groups/testGroup")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            "data": {
              "group": {
                "members": [{ "email": "test_regular@email.it" }, { "email": "prova" }]
                , "name": "testGroup"
              }
            }, "refreshedTokenMessage": "message"
          });
          done();
        })
        .catch((err) => done(err));
    });
  });
})

describe("addToGroup", () => {

  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('missing attributes', (done) => {
    request(app)
      .patch("/api/groups/test_group/insert")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Missing attributes");
        done();
      })
      .catch((err) => done(err));
  });

  test('empty string', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });

    testGroup.save().then(() => {
      request(app)
        .patch("/api/groups/testGroup/insert")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({
          emails: ["email@email.com", "", "email2@email.com"]
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("email cannot be empty");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('invalid email', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });

    testGroup.save().then(() => {
      request(app)
        .patch("/api/groups/testGroup/insert")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({
          emails: ["email@email.com", "aa", "email2@email.com"]
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("one of the emails is not valid");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('group not found', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });

    testGroup.save().then(() => {
      request(app)
        .patch("/api/groups/testGroupp/insert")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({
          emails: ["email@email.com", "aa@gmail.com", "email2@email.com"]
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Group does not exist");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('all emails are already in a group or do not exist', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });


    const existingGroup = new Group({ name: 'existingGroup', members: [{ email: 'email2@gmail.com' }] });
    const testAdmin = new User({
      username: "test_admin",
      email: "email2@gmail.com",
      password: "prova2",
      role: 'Admin',
      refreshToken: adminRefreshToken
    });

    Promise.all([existingGroup.save(), testAdmin.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/insert")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({
          emails: ["email@email.com", "aa@gmail.com", "email2@gmail.com"]
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Emails do not exist or are already in other groups");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('user not in the group', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testGroup.save(), testUser.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/add")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({
          emails: ["test_regular@email.it"]
        })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.error).toEqual("User not in group");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('not an admin', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'wrong_test_regular@email.it' }] });
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testGroup.save(), testUser.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/insert")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({
          emails: ["test_regular@email.it"]
        })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.error).toEqual("Regular user not allowed");
          done();
        })
        .catch((err) => done(err));
    })
  });

  test('function correctly executed', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }] });
    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testGroup.save(), testUser.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/add")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({
          emails: ["email@gmail.com"]
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ "data": { "alreadyInGroup": [], "group": { "members": [{ "email": "test_regular@email.it" }, { "email": "email@gmail.com" }], "name": "testGroup" }, "membersNotFound": [] } });
          done();
        })
        .catch((err) => done(err));
    })
  });

})

describe("removeFromGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('Missing attributes', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    testGroup.save().then(() => {
      request(app)
        .patch("/api/groups/testGroup/pull")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({})
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Missing attributes");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('Group does not exist', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    testGroup.save().then(() => {
      request(app)
        .patch("/api/groups/wrongTestGroup/pull")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ emails: ['prova@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Group does not exist");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('Insert at least one valid member to delete', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/pull")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ emails: ['wrong@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Insert at least one valid member to delete");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('one of the emails is not valid', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/pull")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ emails: ['wrong'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("one of the emails is not valid");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('not an admin', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/pull")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({ emails: [''] })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.error).toEqual("Regular user not allowed");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('email cannot be empty', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/pull")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ emails: [''] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("email cannot be empty");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('user not in group', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'other_test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "email@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/remove")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({ emails: [''] })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.error).toEqual("User not in group");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('users correctly deleted', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova@gmail.com' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "prova@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/remove")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({ emails: ['prova@gmail.com'] })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            "data": {
              "group": {
                "members": [{ "email": "test_regular@email.it" }],
                "name": "testGroup"
              }, "membersNotFound": [], "notInGroup": []
            }, "refreshedTokenMessage": "message"
          });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('no more emails after popping one email', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }] });

    const testUser = new User({
      username: "test_user_regular",
      email: "test_regular@email.it",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });


    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .patch("/api/groups/testGroup/remove")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({ emails: ['prova@gmail.com', 'test_regular@email.it'] })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Insert at least one valid member to delete");
          done();
        })
        .catch((err) => done(err));
    });
  });

})

describe("deleteUser", () => {

  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('missing attributes', (done) => {
    request(app)
      .delete("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("Missing attributes");
        done();
      })
      .catch((err) => done(err));
  });

  test('email cannot be empty', (done) => {
    request(app)
      .delete("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .send({ email: '' })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("email cannot be empty");
        done();
      })
      .catch((err) => done(err));
  });

  test('email is not valid', (done) => {
    request(app)
      .delete("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .send({ email: 'aa' })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("email is not valid");
        done();
      })
      .catch((err) => done(err));
  });

  test('User does not exist', (done) => {
    request(app)
      .delete("/api/users")
      .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
      .send({ email: 'aa@gmail.com' })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual("User does not exist");
        done();
      })
      .catch((err) => done(err));
  });

  test('Admins cannot be deleted', (done) => {
    const testUser = new User({
      username: "test_admin",
      email: "admin@gmail.com",
      password: "prova",
      role: "Admin",
      refreshToken: adminRefreshToken
    });
    testUser.save().then(() => {
      request(app)
        .delete("/api/users")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ email: 'admin@gmail.com' })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Admins cannot be deleted");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('not an admin', (done) => {
    request(app)
      .delete("/api/users")
      .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
      .send({ email: 'aa@gmail.com' })
      .then((response) => {
        expect(response.status).toBe(401);
        expect(response.body.error).toEqual("Regular user not allowed");
        done();
      })
      .catch((err) => done(err));
  });

  test('200 ok', (done) => {
    const testUser = new User({
      username: "test_user",
      email: "user@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    testUser.save().then(() => {
      request(app)
        .delete("/api/users")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ email: 'user@gmail.com' })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ "data": { "deletedFromGroup": false, "deletedTransactions": 0 } });
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('200 ok and delete group if only one user remaining', (done) => {
    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'user@gmail.com' }] });

    const testUser = new User({
      username: "test_user",
      email: "user@gmail.com",
      password: "prova",
      refreshToken: regularUserRefreshToken
    });
    Promise.all([testUser.save(), testGroup.save()]).then(() => {
      request(app)
        .delete("/api/users")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ email: 'user@gmail.com' })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ "data": { "deletedFromGroup": true, "deletedTransactions": 0 } });
          done();
        })
        .catch((err) => done(err));
    });
  });

})

describe("deleteGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({}),
      await Group.deleteMany({})
  })

  test('missing attributes', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    testGroup.save().then(() => {
      request(app)
        .delete("/api/groups")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({})
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Missing attributes");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('empty string', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    testGroup.save().then(() => {
      request(app)
        .delete("/api/groups")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ name: '' })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("name cannot be empty");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('not a group in database', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    testGroup.save().then(() => {
      request(app)
        .delete("/api/groups")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ name: 'prova' })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.message).toEqual("Group does not exist");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('not an admin', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    testGroup.save().then(() => {
      request(app)
        .delete("/api/groups")
        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
        .send({ name: 'testGroup' })
        .then((response) => {
          expect(response.status).toBe(401);
          expect(response.body.error).toEqual("Regular user not allowed");
          done();
        })
        .catch((err) => done(err));
    });
  });

  test('group deleted successfully', (done) => {

    const testGroup = new Group({ name: 'testGroup', members: [{ email: 'test_regular@email.it' }, { email: 'prova' }] });

    testGroup.save().then(() => {
      request(app)
        .delete("/api/groups")
        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
        .send({ name: 'testGroup' })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body.data.message).toEqual("Group deleted");
          done();
        })
        .catch((err) => done(err));
    });
  });
})
