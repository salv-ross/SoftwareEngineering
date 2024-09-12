import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User, Group } from '../models/User';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'

dotenv.config();

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

beforeAll(async () => {
    const dbName = "testingDatabaseController";
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
//should return 400 for null value
describe("createCategory", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
    });

    test('should return 400 for null value', (done) => {
        request(app)
            .post("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: null })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Incorrect values");
                done();
            })
            .catch((err) => done(err));
    });

    test('should return 200 for create a new category', (done) => {
        request(app)
            .post("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: "category1", color: "red" })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.data.type).toEqual("category1");
                expect(response.body.data.color).toEqual("red");
                done();
            })
            .catch((err) => done(err));
    });

    test('should return 400 for missing type or color', (done) => {
        request(app)
            .post("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: "category1" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Incorrect values");
                done();
            })
            .catch((err) => done(err));
    });

    test('should return 400 for existing category', (done) => {
        const testCategory = new categories({ type: "category1", color: "red" });

        testCategory.save().then(() => {
            request(app)
                .post("/api/categories")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ type: "category1", color: "blue" })
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.message).toEqual("Category already exists");
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test('should return 401 for unauthorized authentication', (done) => {
        request(app)
            .post("/api/categories")
            .send({ type: "category1", color: "red" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });

    test('should return 401 for unauthorized user authentication', (done) => {
        request(app)
            .post("/api/categories")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ type: "category1", color: "red" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
});

describe("updateCategory", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
    });

    test("should return 400 for null value", (done) => {
        request(app)
            .patch("/api/categories/test")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: "category1", color: null })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid parameters");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 401 for unauthorized authentication", (done) => {
        request(app)
            .patch("/api/categories/test")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ type: "category1", color: "red" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 for invalid parameters", (done) => {
        request(app)
            .patch("/api/categories/test")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: "category1", color: "" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid parameters");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 for existing category", (done) => {
        const existingCategory = new categories({ type: "category1", color: "red" });
        existingCategory.save().then(() => {
            request(app)
                .patch("/api/categories/test")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ type: "category1", color: "red" })
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Category already existing");
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 400 for category not found", (done) => {
        request(app)
            .patch("/api/categories/notExistingTest")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ type: "category1", color: "newColor" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Category not found");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 200 for update transactions and return success message", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category1", amount: 20 });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save()]).then(() => {
            request(app)
                .patch("/api/categories/category1")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ type: "category3", color: "yellow" })
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data.message).toEqual("Category updated succesfully!");
                    expect(response.body.data.count).toBe(2);
                    done();
                })
                .catch((err) => done(err));
        });
    });
})

describe("deleteCategory", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
    });

    test("should return 400 for null value", (done) => {
        request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ types: null })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid values");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 401 for unauthorized authentication", (done) => {
        request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ types: "category1" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 for invalid values", (done) => {
        request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ types: "" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid values");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 for only one category not deletable", (done) => {
        const category = new categories({ type: "category1", color: "red" });
        category.save().then(() => {
            request(app)
                .delete("/api/categories")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ types: "category1" })
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Only one category cannot be deleted");
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 400 for non-existing categories", (done) => {
        request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
            .send({ types: "category1" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Category not existing");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 200 for delete categories except one and update transactions", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category2", amount: 20 });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save()]).then(() => {
            request(app)
                .delete("/api/categories")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ types: ["category1"] })
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data.message).toEqual("Category deleted succesfully!");
                    expect(response.body.data.count).toBe(1);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 200 for trying delete all categories and update transactions", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category2", amount: 20 });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save()]).then(() => {
            request(app)
                .delete("/api/categories")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .send({ types: ["category1", "category2"] })
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data.message).toEqual("Category deleted succesfully!");
                    expect(response.body.data.count).toBe(1);
                    done();
                })
                .catch((err) => done(err));
        });
    });
})

describe("getCategories", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
    });

    test("should return 200 for get categories successfully", (done) => {
        const category1 = new categories({
            type: "category1",
            color: "red",
        });
        const category2 = new categories({
            type: "category2",
            color: "blue",
        });

        Promise.all([category1.save(), category2.save()]).then(() => {
            request(app)
                .get("/api/categories")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual(
                        expect.arrayContaining([
                            { type: "category1", color: "red" },
                            { type: "category2", color: "blue" },
                        ])
                    );
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 401 for unauthorized authentication", (done) => {
        request(app)
            .get("/api/categories")
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });
})

describe("createTransaction", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
    });

    test("should return 400 for null value", (done) => {
        const body = {
            username: "test_user_regular",
            type: null,
        };

        request(app)
            .post("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send(body)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid parameters");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 401 for unauthorized authentication", (done) => {
        request(app)
            .post("/api/users/test_user_regular/transactions")
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 200 for create a new transaction", (done) => {
        const body = {
            username: "test_user_regular",
            amount: "10",
            type: "category1",
        };

        const existingUser = new User({
            username: "test_user_regular",
            email: "test@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });


        Promise.all([category1.save(), category2.save(), existingUser.save()]).then(() => {
            request(app)
                .post("/api/users/test_user_regular/transactions")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .send(body)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toBeDefined();
                    expect(response.body.data.username).toEqual(body.username);
                    expect(response.body.data.amount).toEqual(parseFloat(body.amount));
                    expect(response.body.data.type).toEqual(body.type);
                    expect(response.body.data.date).toBeDefined();
                    //expect(response.body.refreshedTokenMessage).toBeDefined();
                    done();
                })
                .catch((err) => done(err));
        })
    });

    test("should return 400 if parameters are missing", (done) => {
        const body = {
            username: "test_user_regular",
            type: "category1",
        };

        request(app)
            .post("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send(body)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid parameters");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 if username in body does not match username in params", (done) => {
        const body = {
            username: "differentUser",
            amount: "10",
            type: "category1",
        };

        request(app)
            .post("/api/users/test_user_regular/transactions")
            .set(
                "Cookie",
                `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`
            )
            .send(body)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Username mismatch");
                done();
            })
            .catch((err) => done(err));
    });

    test("should return 400 if user does not exist", (done) => {
        const body = {
            username: "test_user_regular",
            amount: "10",
            type: "category1",
            password: "password",
            refreshToken: "token",
            timestamps: "2023-05-27T12:00:00Z"
        };

        const existingUser = new User({
            username: "user1",
            email: "user1@esempio.com",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        existingUser.save().then(() => {
            request(app)
                .post("/api/users/test_user_regular/transactions")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .send(body)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("User not existing");
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 400 if category does not exist", (done) => {
        const body = {
            username: "test_user_regular",
            amount: "10",
            type: "category1",
        };

        const existingUser = new User({
            username: "test_user_regular",
            email: "test@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        existingUser.save().then(() => {
            request(app)
                .post("/api/users/test_user_regular/transactions")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .send(body)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Category not existing");
                    done();
                })
                .catch((err) => done(err));
        });
    });

})

describe("getAllTransactions", () => {
    test("should return 200 for returning all transactions with category information successfully", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category2", amount: 20 });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save()]).then(() => {
            request(app)
                .get("/api/transactions")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .expect((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toBeDefined();
                    expect(response.body.data.length).toBe(2);
                    expect(response.body.data[0].username).toBeDefined();
                    expect(response.body.data[0].amount).toBeDefined();
                    expect(response.body.data[0].type).toBeDefined();
                    expect(response.body.data[0].color).toBeDefined();
                    expect(response.body.data[0].date).toBeDefined();
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("should return 401 for unauthorized authentication", (done) => {
        request(app)
            .get("/api/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .expect((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
})

describe("getTransactionsByUser", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
    });
    test('should return transactions if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual([{ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return transactions if called by admin user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/transactions/users/test_user_regular")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual([{ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by date "from" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T00:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T01:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-25T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?from=2023-05-28")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 20, color: "red", date: "2023-05-28T01:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by date "upTo" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-29T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?upTo=2023-05-27")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by date "from" and "upTo" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-29T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?from=2023-05-28&upTo=2023-05-28")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 20, color: "red", date: "2023-05-28T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by "date" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-29T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?date=2023-05-28")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 20, color: "red", date: "2023-05-28T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'date' and 'upTo' or 'From' are passed simultaneously", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?date=2023-05-28&from=2023-04-02")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Cannot use 'date' parameter together with 'from' or 'upTo'");
                    done();
                })
                .catch((err) => done(err));
        });
    });
    test("should return 400 if 'date' is not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?date=2023-05-80")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid date format");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'from' is not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?from=2023-05-80")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid date format");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'upTo' is not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?upTo=2023-05-80")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid date format");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'upTo' or 'From' are not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?upTo=2023-05-82&from=2023-04-02")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid date format");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by amount "min" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T00:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T01:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-25T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?min=30")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 30, color: "red", date: "2023-05-25T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by amount "max" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-29T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?max=10")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return filtered transactions by amount "min" and "max" if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category1", amount: 20, date: "2023-05-28T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular", type: "category1", amount: 30, date: "2023-05-29T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?min=20&max=20")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data[0]).toEqual({ username: "test_user_regular", type: "category1", amount: 20, color: "red", date: "2023-05-28T12:00:00" });
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'min' is not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?min=a")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid amount value");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'max' is not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?max=a")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid amount value");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 400 if 'min' or 'max' are not valid", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions?min=8&max=a")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Invalid amount value");
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 401 if no cookies are passed", (done) => {
        request(app)
            .get("/api/transactions/users/test_user_regular")
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access admin path", (done) => {
        request(app)
            .get("/api/transactions/users/test_user_regular")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access other user transactions", (done) => {
        request(app)
            .get("/api/users/test_other_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("User not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test('should return 400 if the user does not exist', (done) => {
        request(app)
            .get("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("User does not exist");
                done();
            })
            .catch((err) => done(err));
    });


});

describe("getTransactionsByUserByCategory", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
    });
    test('should return transactions if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), regularUser.save(), transaction2.save()]).then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions/category/category1")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual([{ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test('should return transactions if called by admin user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular", type: "work", amount: 10, date: "2023-05-27T12:00:00Z" });
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "work", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), transaction1.save(), regularUser.save(), transaction2.save()]).then(() => {
            request(app)
                .get("/api/transactions/users/test_user_regular/category/category1")
                .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual([{ username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                    done();
                })
                .catch((err) => done(err));
        });

    });
    test("should return 401 if no cookies are passed", (done) => {
        request(app)
            .get("/api/transactions/users/test_user_regular/category/category1/")
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access admin path", (done) => {
        request(app)
            .get("/api/transactions/users/test_user_regular/category/category1")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access other user transactions", (done) => {
        request(app)
            .get("/api/users/test_other_user_regular/transactions/category/category1")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("User not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test('should return 400 if the user does not exist', (done) => {
        request(app)
            .get("/api/users/test_user_regular/transactions/category/category1")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("User not existing");
                done();
            })
            .catch((err) => done(err));
    });
    test('should return 400 if the category does not exist', (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        regularUser.save().then(() => {
            request(app)
                .get("/api/users/test_user_regular/transactions/category/category1")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toEqual("Category not existing");
                    done();
                })
                .catch((err) => done(err));
        })

    });

})

describe("getTransactionsByGroup", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
        await Group.deleteMany({});
    });
    test('should return transactions if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular2", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular3", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });

        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser3.save()]).then(() => {

                        request(app)
                            .get("/api/groups/test_group/transactions")
                            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body.data).toEqual(expect.arrayContaining([
                                    { username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" },
                                    { username: "test_user_regular2", type: "category2", amount: 10, color: "blue", date: "2023-05-27T12:00:00" }]));
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })

    });
    test('should return transactions if called by admin user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular2", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular3", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });

        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser3.save()]).then(() => {

                        request(app)
                            .get("/api/transactions/groups/test_group")
                            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body.data).toEqual(expect.arrayContaining([
                                    { username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" },
                                    { username: "test_user_regular2", type: "category2", amount: 10, color: "blue", date: "2023-05-27T12:00:00" }]));
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })

    });
    test("should return 401 if no cookies are passed", (done) => {
        new Group({
            name: "test_group",
            members: []
        }).save().then(() => {
            request(app)
                .get("/api/transactions/groups/test_group")
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body.error).toEqual("Unauthorized");
                    done();
                })
                .catch((err) => done(err));
        });
    });
    test("should return 401 if regular user tries to access admin path", (done) => {
        new Group({
            name: "test_group",
            members: []
        }).save().then(() => {
            request(app)
                .get("/api/transactions/groups/test_group")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body.error).toEqual("Regular user not allowed");
                    done();
                })
                .catch((err) => done(err));
        })
        request(app)
            .get("/api/transactions/groups/test_group")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access other groups transactions", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser3.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    regularUser.save().then(() => {
                        request(app)
                            .get("/api/groups/test_group/transactions")
                            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(401);
                                expect(response.body.error).toEqual("User not in group");
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })
    });
    test('should return 400 if the group does not exist', (done) => {
        request(app)
            .get("/api/groups/test_group/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Group does not exist");
                done();
            })
            .catch((err) => done(err));
    });
})

describe("getTransactionsByGroupByCategory", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
        await Group.deleteMany({});
    });
    test('should return transactions if called by regular user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular2", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular3", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });

        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser3.save()]).then(() => {

                        request(app)
                            .get("/api/groups/test_group/transactions/category/category1")
                            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body.data).toEqual([
                                    { username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })

    });
    test('should return transactions if called by admin user', (done) => {
        const transaction1 = new transactions({ username: "test_user_regular", type: "category1", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction2 = new transactions({ username: "test_user_regular2", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });
        const transaction3 = new transactions({ username: "test_user_regular3", type: "category2", amount: 10, date: "2023-05-27T12:00:00Z" });

        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    Promise.all([category1.save(), category2.save(), transaction1.save(), transaction2.save(), transaction3.save(), regularUser3.save()]).then(() => {

                        request(app)
                            .get("/api/transactions/groups/test_group/category/category1")
                            .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(200);
                                expect(response.body.data).toEqual([
                                    { username: "test_user_regular", type: "category1", amount: 10, color: "red", date: "2023-05-27T12:00:00" }]);
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })

    });
    test("should return 401 if no cookies are passed", (done) => {
        new Group({
            name: "test_group",
            members: []
        }).save().then(() => {
            request(app)
                .get("/api/transactions/groups/test_group/category/category1")
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body.error).toEqual("Unauthorized");
                    done();
                })
                .catch((err) => done(err));
        });
    });
    test("should return 401 if regular user tries to access admin path", (done) => {
        new Group({
            name: "test_group",
            members: []
        }).save().then(() => {
            request(app)
                .get("/api/transactions/groups/test_group/category/category1")
                .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                .then((response) => {
                    expect(response.status).toBe(401);
                    expect(response.body.error).toEqual("Regular user not allowed");
                    done();
                })
                .catch((err) => done(err));
        })
        request(app)
            .get("/api/transactions/groups/test_group/category/category1")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if regular user tries to access other groups transactions", (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser3 = new User({

            username: "test_user_regular3",
            email: "test3@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        let members = [];
        regularUser3.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    regularUser.save().then(() => {
                        request(app)
                            .get("/api/groups/test_group/transactions/category/category1")
                            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                            .then((response) => {
                                expect(response.status).toBe(401);
                                expect(response.body.error).toEqual("User not in group");
                                done();
                            })
                            .catch((err) => done(err));
                    });
                })
            })
        })
    });
    test('should return 400 if the group does not exist', (done) => {
        request(app)
            .get("/api/groups/test_group/transactions/category/category1")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Group does not exist");
                done();
            })
            .catch((err) => done(err));
    });
    test('should return 400 if the category does not exist', (done) => {
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });
        const regularUser2 = new User({
            username: "test_user_regular2",
            email: "test2@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });


        let members = [];
        regularUser.save().then((v) => {
            members.push({ email: v.email, _id: v._id });
            regularUser2.save().then((v2) => {
                members.push({ email: v2.email, _id: v2._id });
                const group1 = new Group({
                    name: "test_group",
                    members
                });
                group1.save().then((g) => {
                    request(app)
                        .get("/api/groups/test_group/transactions/category/category1")
                        .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body.error).toEqual("Category does not exist");
                            done();
                        })
                        .catch((err) => done(err));
                });
            })
        })

    });

})

describe("deleteTransaction", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
    });
    test("should return 400 for empty values", (done) => {

        request(app)
            .delete("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ "_id": "" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid values");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 200 for deleted transaction", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10, username: "test_user_regular" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), regularUser.save()]).then(() => {
            transaction1.save().then((t) => {
                request(app)
                    .delete("/api/users/test_user_regular/transactions")
                    .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                    .send({ "_id": t._id })
                    .then((response) => {
                        expect(response.status).toBe(200);
                        expect(response.body.data.message).toEqual("Transaction deleted succesfully!");
                        done();
                    })
                    .catch((err) => done(err));
            });
        });
    });
    test("should return 400 for invalid values", (done) => {

        request(app)
            .delete("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ "_id": undefined })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("Invalid values");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if no cookies", (done) => {

        request(app)
            .delete("/api/users/test_user_regular/transactions")
            .send({ "_id": "test__id" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if user is not allowed", (done) => {

        request(app)
            .delete("/api/users/test_other_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ "_id": "test__id" })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("User not allowed");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 400 if user doesn't exist", (done) => {

        request(app)
            .delete("/api/users/test_user_regular/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ "_id": "test__id" })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body.error).toEqual("User not existing");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 400 if transaction doesn't exist", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), regularUser.save()]).then(() => {
            transaction1.save().then((t) => {
                request(app)
                    .delete("/api/users/test_user_regular/transactions")
                    .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                    .send({ "_id": "test_id" })
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.body.error).toEqual("Transaction not existing");
                        done();
                    })
                    .catch((err) => done(err));
            });
        });
    });
    test("should return 400 if transaction doesn't belong to user", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10, username: "test_user_regular_other" });
        const regularUser = new User({
            username: "test_user_regular",
            email: "test_regular@email.it",
            password: "password",
            refreshToken: "token",
            role: "User",
            timestamps: "2023-05-27T12:00:00Z"
        });

        Promise.all([category1.save(), category2.save(), regularUser.save()]).then(() => {
            transaction1.save().then((t) => {
                request(app)
                    .delete("/api/users/test_user_regular/transactions")
                    .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
                    .send({ "_id": t._id })
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.body.error).toEqual("Transaction not existing");
                        done();
                    })
                    .catch((err) => done(err));
            });
        });
    });
})

describe("deleteTransactions", () => {
    beforeEach(async () => {
        await categories.deleteMany({});
        await transactions.deleteMany({});
        await User.deleteMany({});
    });
    test("should return 400 if one _id is empty", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category1", amount: 15 });


        Promise.all([category1.save(), category2.save()]).then(() => {
            transaction1.save().then((t) => {
                transaction2.save().then((t2) => {
                    request(app)
                        .delete("/api/transactions")
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                        .send({ "_ids": [t._id, ""] })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body.error).toEqual("One or more paramater not valid");
                            done();
                        })
                        .catch((err) => done(err));
                })
            });
        });
    });
    test("should return 200 for deleted transactions", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category1", amount: 15 });


        Promise.all([category1.save(), category2.save()]).then(() => {
            transaction1.save().then((t) => {
                transaction2.save().then((t2) => {
                    request(app)
                        .delete("/api/transactions")
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                        .send({ "_ids": [t._id, t2._id] })
                        .then((response) => {
                            expect(response.status).toBe(200);
                            expect(response.body.data.message).toEqual("Transactions deleted");
                            done();
                        })
                        .catch((err) => done(err));
                })
            });
        });
    });
    test("should return 400 if no _ids is passed", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category1", amount: 15 });


        Promise.all([category1.save(), category2.save()]).then(() => {
            transaction1.save().then((t) => {
                transaction2.save().then((t2) => {
                    request(app)
                        .delete("/api/transactions")
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                        .send({ "_ids": undefined })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body.error).toEqual("One or more paramater not valid");
                            done();
                        })
                        .catch((err) => done(err));
                })
            });
        });
    });
    test("should return 400 if one _id is corrupted", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });
        const transaction2 = new transactions({ type: "category1", amount: 15 });


        Promise.all([category1.save(), category2.save()]).then(() => {
            transaction1.save().then((t) => {
                transaction2.save().then((t2) => {
                    request(app)
                        .delete("/api/transactions")
                        .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                        .send({ "_ids": [t._id, undefined] })
                        .then((response) => {
                            expect(response.status).toBe(400);
                            expect(response.body.error).toEqual("One or more paramater not valid");
                            done();
                        })
                        .catch((err) => done(err));
                })
            });
        });
    });
    test("should return 400 if one or more transaction is not found", (done) => {
        const category1 = new categories({ type: "category1", color: "red" });
        const category2 = new categories({ type: "category2", color: "blue" });
        const transaction1 = new transactions({ type: "category1", amount: 10 });

        Promise.all([category1.save(), category2.save()]).then(() => {
            transaction1.save().then((t) => {
                request(app)
                    .delete("/api/transactions")
                    .set("Cookie", `accessToken=${adminAccessToken}; refreshToken=${adminRefreshToken}`)
                    .send({ "_ids": [t._id, "645b5ac02472c24b7856aa84"] })
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.body.error).toEqual("One or more transactions not found");
                        done();
                    })
                    .catch((err) => done(err));
            });
        });
    });
    test("should return 401 if no cookies", (done) => {
        request(app)
            .delete("/api/transactions")
            .send({ "_ids": ["645b5ac02472c24b7856aa84"] })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Unauthorized");
                done();
            })
            .catch((err) => done(err));
    });
    test("should return 401 if user is not admin", (done) => {
        request(app)
            .delete("/api/transactions")
            .set("Cookie", `accessToken=${regularUserAccessToken}; refreshToken=${regularUserRefreshToken}`)
            .send({ "_ids": ["645b5ac02472c24b7856aa84"] })
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body.error).toEqual("Regular user not allowed");
                done();
            })
            .catch((err) => done(err));
    });

})