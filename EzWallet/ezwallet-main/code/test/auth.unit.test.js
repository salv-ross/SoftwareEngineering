import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import verifyAuth from '../controllers/utils.js'
import { getUser } from '../controllers/users.js'
import { register, registerAdmin, login, logout } from '../controllers/auth.js'
import bcrypt from 'bcryptjs';
import * as auth from '../controllers/auth.js';
jest.mock("bcryptjs")
jest.mock('../models/User.js');

// Version updated to 6/6/23. All the cases reported on API.md have been tested.

beforeEach(() => {
    User.find.mockClear();
    //additional `mockClear()` must be placed here
    User.findOne.mockClear();
    bcrypt.compare.mockClear();
});

// OK
describe('register', () => {

    test('should return 500 for internal server error', async () => {
        const req = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        User.findOne.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });


    test('req body does not contain all informations', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing attributes' });
    });


    test('one of attributes is empty', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'One of the attributes is empty' });
    });

    test('email not correct format', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "emailNotValid",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email not valid format' });
    });

    test('user already registered', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue({ username: "username" })
        await register(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'you are already registered' });
    });

    test('email already registered', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValueOnce(undefined)

        jest.spyOn(User, "findOne").mockResolvedValue({ email: "existingEmail@gmail.com" })
        await register(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'email already registered' });
    });

    test('correct registration', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(undefined)
        await register(mockReq, mockRes);

        expect(mockRes.status).not.toHaveBeenCalledWith();
        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "User added successfully" } });
    });

});

// OK
describe("registerAdmin", () => {

    test('should return 500 for internal server error', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        User.findOne = jest.fn().mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });


    test('req body does not contain all informations', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing attributes' });
    });


    test('one of attributes is empty', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'One of the attributes is empty' });
    });

    test('user already registered', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue({ username: "username" })
        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'you are already registered' });
    });

    test('email already registered', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValueOnce(undefined)
        jest.spyOn(User, "findOne").mockResolvedValue({ email: "existingEmail@gmail.com" })

        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'email already registered' });
    });

    test('email not correct format', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "emailNotValid",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email not valid format' });
    });

    test('correct registration', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(undefined)
        await registerAdmin(mockReq, mockRes);

        expect(mockRes.status).not.toHaveBeenCalledWith();
        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "User added successfully" } });
    });
});

// OK
describe('login', () => {

    test('should return 500 for internal server error', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(User, "findOne").mockResolvedValue({ username: "username" })

        bcrypt.compare = jest.fn().mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });


    test('req body does not contain all informations', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing attributes' });
    });


    test('one of attributes is empty', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@gmail.com",
                password: ""
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'One of the attributes is empty' });
    });

    test('email not correct format', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "emailNotValid",
                password: "prova"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email not valid format' });
    });

    test('you are already logged in', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@email.com",
                password: "prova"
            },
            cookies: {
                accessToken: "accessToken"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(null)
        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "you are already logged in" });
    });


    test('user does not exist', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@email.com",
                password: "prova"
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(null)
        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "please you need to register" });
    });

    test('password does not match', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@email.com",
                password: "prova"
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),

        };

        jest.spyOn(bcrypt, "compare").mockResolvedValue(null)

        jest.spyOn(User, "findOne").mockResolvedValue({ username: "user", password: "password" })
        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'wrong credentials' });
    });


    test('correct login', async () => {
        const mockReq = {
            body: {
                username: "username",
                email: "email@email.com",
                password: "prova"
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),

        };

        const existingUser = { email: 'test@example.com', password: 'prova', save: jest.fn() };
        jest.spyOn(User, "findOne").mockReturnValue(existingUser);
        jest.spyOn(bcrypt, "compare").mockResolvedValue({ match: "match" });

        jest.spyOn(jwt, "sign").mockResolvedValueOnce("something");
        jest.spyOn(jwt, "sign").mockResolvedValueOnce("something");
        jest.spyOn(User, "create").mockResolvedValue({ username: "user" });
        jest.spyOn(existingUser, "save").mockResolvedValue({ user: { new_user: "user" } });
        await login(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: { accessToken: expect.any(Promise), refreshToken: expect.any(Promise) } });
    });
});

// OK
describe('logout', () => {

    test('should return 500 for internal server error', async () => {
        const mockReq = {
            cookies: {
                refreshToken: "some-refresh-token"
            }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            response: { status: 500 }
        };
        jest.spyOn(User, 'findOne').mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await logout(mockReq, mockRes);

        // const response = { status: 500 };
        // const error = new Error('Internal Server Error');
        //  await expect(myFunction(response)).rejects.toThrow(error);


        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });

    });

    test('cookie not found', async () => {
        const mockReq = {
            cookies: {
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await logout(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "You have to be logged in to log out" });
    });

    test('user not found', async () => {
        const mockReq = {
            cookies: {
                refreshToken: "123"
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        //mock find one
        jest.spyOn(User, "findOne").mockReturnValue(null);
        await logout(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
    });

    test('successfully logged out', async () => {
        const mockReq = {
            cookies: {
                refreshToken: "123"

            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
        //mock find one
        const existingUser = { email: 'test@example.com', password: 'prova', save: jest.fn() };
        jest.spyOn(User, "findOne").mockResolvedValue(existingUser);
        jest.spyOn(existingUser, "save").mockResolvedValue({ user: { new_user: "user" } });
        await logout(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: { message: "User logged out" } });
    });

});
