import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import jwt from 'jsonwebtoken';


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
    test("should return error if the argument passed in 'from' is not in the correct format", () => {
        const req = {
            query: {
                upTo: "2023-05-02",
                from: "2023-50-2"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument passed in 'from' in the correct format", () => {
        const req = {
            query: {
                from: "2023-05-0",
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });

    test("should return error if the argument passed in 'upTo' in the correct format", () => {
        const req = {
            query: {
                upTo: "2023-13-2"
            },
        };
        expect(() => {
            handleDateFilterParams(req);
        }).toThrow(new Error("Invalid date format"))

    });


    test("should return {} if no date parameters are provided", () => {
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
});

describe("verifyAuth", () => {
    test("should return unauthorized if accessToken or refreshToken is missing", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken"
            },
        };

        const res = {};

        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "Unauthorized" });
    });

    test("should return unauthorized if accessToken is missing information", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "a@b.it", role: undefined }));
        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "Token is missing information" });
    });

    test("should return unauthorized if  refreshToken is missing information", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "a@b.it", role: "Admin" }));
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "a@b.it", role: "" }));
        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "Token is missing information" });
    });

    test("should return unauthorized if accessToken and refreshToken have mismatched users", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockReturnValueOnce({ username: "user1", email: "user1@esempio.com", role: "User" });
        jest.spyOn(jwt, 'verify').mockReturnValueOnce({ username: "user1", email: "user2@esempio.com", role: "Admin" });


        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "Mismatched users" });
    });

    test("should return unauthorized if authType is invalid", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));

        const info = {
            authType: "InvalidAuthType",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "Invalid authType" });
    });

    test("should return authorized if ok", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));
        const info = {
            authType: "User",
            username: "user1",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
    });
    test("should return unauthorized if user is not allowed for authType = User", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));
        const info = {
            authType: "User",
            username: "user2",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "User not allowed" });
    });

    test("should return unauthorized if regular user is not allowed for authType = Admin", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));

        const info = {
            authType: "Admin",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "Regular user not allowed" });
    });

    test("should return unauthorized if user is not in the group for authType = Group", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));

        const info = {
            authType: "Group",
            emails: ["user2@esempio.com", "user3@esempio.com"],
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "User not in group" });
    });

    test("should return unauthorized if accessToken is expired and refreshToken is also expired", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => { throw error; });

        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "Perform login again" });
    });

    test("should return unauthorized if jwt.verify throws an unidentified error", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "testError";

        const res = {};

        jest.spyOn(jwt, 'verify').mockImplementation(() => { throw error; });

        const result = verifyAuth(req, res);

        expect(result).toEqual({ authorized: false, cause: "testError" });
    });

    test("should return authorized if accessToken is expired but refreshToken is refreshed", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {
            cookie: jest.fn(),
            locals: {},
        };

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw error; });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));

        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => { return 'mockedAccessToken'; });

        const info = {
            authType: "User",
            username: "user1",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
        expect(res.cookie).toHaveBeenCalled();
        expect(res.locals.refreshedTokenMessage).toBeDefined();
    });

    test("should return unauthorized if accessToken is expired but refreshToken is refreshed but user is not allowed for authType = User", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {
            cookie: jest.fn(),
            locals: {},
        };

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw error; });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user2", email: "user1@esempio.com", role: "User" }));

        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => { return 'mockedAccessToken'; });

        const info = {
            authType: "User",
            username: "user1",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "User not allowed" });
        expect(res.cookie).toHaveBeenCalled();
        expect(res.locals.refreshedTokenMessage).toBeDefined();
    });

    test("should return unauthorized if accessToken is expired but refreshToken is refreshed but user is not allowed for authType = Admin", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {
            cookie: jest.fn(),
            locals: {},
        };

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw error; });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "user1@esempio.com", role: "User" }));

        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => { return 'mockedAccessToken'; });

        const info = {
            authType: "Admin",
        };

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "Regular user not allowed" });
        expect(res.cookie).toHaveBeenCalled();
        expect(res.locals.refreshedTokenMessage).toBeDefined();
    });

    test("should return unauthorized if accessToken is expired but refreshToken is refreshed but user is not allowed for authType = Group", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {
            cookie: jest.fn(),
            locals: {},
        };

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw error; });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "user1@esempio.com", role: "Group" }));

        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => { return 'mockedAccessToken'; });

        const info = {
            authType: "Group",
            emails: ["user2@esempio.com", "user3@esempio.com"],
        };


        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "User not in group" });
        expect(res.cookie).toHaveBeenCalled();
        expect(res.locals.refreshedTokenMessage).toBeDefined();
    });

    test("should return unauthorized if accessToken is expired but refreshToken is refreshed but authType is not valid", () => {
        const req = {
            cookies: {
                accessToken: "validAccessToken",
                refreshToken: "validRefreshToken",
            },
        };
        const error = new Error("Access token expired");
        error.name = "TokenExpiredError";

        const res = {
            cookie: jest.fn(),
            locals: {},
        };

        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw error; });
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ username: "user1", email: "user1@esempio.com", role: "Group" }));

        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => { return 'mockedAccessToken'; });

        const info = {
            authType: "Invalid",
        };


        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: false, cause: "Invalid authType" });
        expect(res.cookie).toHaveBeenCalled();
        expect(res.locals.refreshedTokenMessage).toBeDefined();
    });

});

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
                min: "dfnm",
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

    test("should return {} if no date parameters are provided", () => {
        const req = {
            query: {},
        };

        const result = handleAmountFilterParams(req);

        expect(result).toStrictEqual({});
    });

});