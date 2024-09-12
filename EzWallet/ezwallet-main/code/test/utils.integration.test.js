import request from 'supertest';
import { app } from '../app';
import { categories } from '../models/model';
import { transactions } from '../models/model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleDateFilterParams, handleAmountFilterParams } from '../controllers/utils';


dotenv.config();

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

//necessary setup to ensure that each test can insert the data it needs
/*beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
})*/

/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
const adminAccessTokenValid = jwt.sign({
    email: "admin@email.com",
    //id: existingUser.id, The id field is not required in any check, so it can be omitted
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenValid = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })
const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

describe("verifyAuth", () => {
    /**
     * When calling verifyAuth directly, we do not have access to the req and res objects created by express, so we must define them manually
     * An object with a "cookies" field that in turn contains "accessToken" and "refreshToken" is sufficient for the request
     * The response object is untouched in most cases, so it can be a simple empty object
     */
    test("Tokens are both valid and belong to the requested user", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("Access token missing information", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenEmpty, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Refresh token missing information", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenEmpty } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Mismatched users", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: adminAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Wrong username", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "nome_sbagliato" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Regular user not allowed", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Admin", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("User not in group", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Group", emails: ["wrong_email"] })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Invalid authType", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Wrong_authtype" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Token expired with wrong username", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "wrong_username" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Token expired with not an admin", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Admin", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Token expired with user not in group", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Group", emails: ["wrong_email"] })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Token expired with invalid authtype", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Invalid authtype" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Both token expired", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenExpired } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Not jwt refresh token", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: 'not_a_jwt_token' } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Not jwt access token", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both

        const req = { cookies: { accessToken: 'not_a_jwt_token', refreshToken: testerAccessTokenValid } }
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(false)).toBe(true)
    })

    test("Undefined tokens", () => {
        const req = { cookies: {} }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })

    /**
     * The only situation where the response object is actually interacted with is the case where the access token must be refreshed
     */
    test("Access token expired and refresh token belonging to the requested user", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.cookieArgs).toEqual({
            name: 'accessToken', //The cookie arguments must have the name set to "accessToken" (value updated)
            value: expect.any(String), //The actual value is unpredictable (jwt string), so it must exist
            options: { //The same options as during creation
                httpOnly: true,
                path: '/api',
                maxAge: 60 * 60 * 1000,
                sameSite: 'none',
                secure: true,
            },
        })
        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : res.locals.message ? true : false
        expect(message).toBe(true)
    })
})

describe("handleAmountFilterParams", () => {
    test("should return $gte with min and $lte with max", () => {
        const req = {
            query: {
                min: 2,
                max: 7,
            },
        };
        const result = handleAmountFilterParams(req);
        expect(result).toEqual({ amount: { $gte: 2, $lte: 7 } });
    });


    test("should return $gte with min", () => {
        const req = {
            query: {
                min: 2,
            },
        };
        const result = handleAmountFilterParams(req);
        expect(result).toEqual({ amount: { $gte: 2 } });
    });

    test("should return $lte with max", () => {
        const req = {
            query: {
                max: 7,
            },
        };
        const result = handleAmountFilterParams(req);
        expect(result).toEqual({ amount: { $lte: 7 } });
    });


    test("should return error if the argument passed in 'min' or 'max' are not in the correct format", () => {
        const req = {
            query: {
                min: 2,
                max: "asjl",
            },
        };
        expect(() => {
            handleAmountFilterParams(req);
        }).toThrow(new Error("Invalid amount value"))

    });

    test("should return error if the argument passed in 'min' in the correct format", () => {
        const req = {
            query: {
                min: "fnm",
            },
        };
        expect(() => {
            handleAmountFilterParams(req);
        }).toThrow(new Error("Invalid amount value"))

    });

    test("should return error if the argument passed in 'max' in the correct format", () => {
        const req = {
            query: {
                max: "nmsd",
            },
        };
        expect(() => {
            handleAmountFilterParams(req);
        }).toThrow(new Error("Invalid amount value"))

    });


    test("should return undefined if no date parameters are provided", () => {
        const req = {
            query: {},
        };

        const result = handleAmountFilterParams(req);

        expect(result).toStrictEqual({});
    });
})

describe("handleDateFilterParams", () => {
    test("should return $gte with the date at midnight and $lte with the date 1 minute before the next midnight", () => {
        const req = {
            query: {
                date: "2023-05-01",
            },
        };
        const result = handleDateFilterParams(req);
        expect(result).toEqual({ date: { $gte: new Date("2023-05-01T00:00:00.000Z"), $lte: new Date("2023-05-01T23:59:59.999Z") } });
    });

    test("should return $gte with the from date at midnight and $lte with the upTo date 1 minute before the next midnight", () => {
        const req = {
            query: {
                from: "2023-05-01",
                upTo: "2023-05-02"
            },
        };
        const result = handleDateFilterParams(req);
        expect(result).toEqual({ date: { $gte: new Date("2023-05-01T00:00:00.000Z"), $lte: new Date("2023-05-02T23:59:59.999Z") } });
    });

    test("should return $gte with the from date at midnight", () => {
        const req = {
            query: {
                from: "2023-05-01",
            },
        };
        const result = handleDateFilterParams(req);
        expect(result).toEqual({ date: { $gte: new Date("2023-05-01T00:00:00.000Z") } });
    });

    test("should return $lte with the upTo date 1 minute before the next midnight", () => {
        const req = {
            query: {
                upTo: "2023-05-02"
            },
        };
        const result = handleDateFilterParams(req);
        expect(result).toEqual({ date: { $lte: new Date("2023-05-02T23:59:59.999Z") } });
    });

    test("should return error if the argument passed in 'date' in the correct format", () => {
        const req = {
            query: {
                date: "2023-05-41",
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument passed in 'from' or 'upTo' are not in the correct format", () => {
        const req = {
            query: {
                from: "2023-05-01",
                upTo: "2023-05-40"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument passed in 'upTo' in the correct format", () => {
        const req = {
            query: {
                upTo: "2023-05-42"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument from & upTo passed in 'from' in the correct format", () => {
        const req = {
            query: {
                upTo: "2023-05-02",
                from: "2023-05-42"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument passed in 'from' in the correct format", () => {
        const req = {
            query: {
                from: "2023-05-42"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });


    test("should return undefined if no date parameters are provided", () => {
        const req = {
            query: {},
        };

        const result = handleDateFilterParams(req);

        expect(result).toStrictEqual({});
    });

    test("should throw an error if 'date' parameter is used together with 'from' or 'upTo'", () => {
        const req = {
            query: {
                date: "2023-05-01",
                upTo: "2023-05-01",
            },
        };

        expect(() => {
            handleDateFilterParams(req);
        }).toThrow("Cannot use 'date' parameter together with 'from' or 'upTo'");
    });
})
