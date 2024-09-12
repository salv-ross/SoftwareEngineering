import { categories, transactions } from '../models/model';
import { User, Group } from '../models/User';
import { createCategory, updateCategory, deleteCategory, createTransaction, getCategories, getAllTransactions, getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroup, getTransactionsByGroupByCategory, deleteTransaction, deleteTransactions } from '../controllers/controller';
import { verifyAuth, handleAmountFilterParams, handleDateFilterParams } from '../controllers/utils';

jest.mock('../models/model');
jest.mock("../models/User.js")
jest.mock('../controllers/utils');

const regularUser = {
    _id: {
        $oid: "645b5ac02472c24b7856aa84"
    },
    username: "test_user",
    email: "test@mail.it",
    password: "$2a$12$4V7TDvu6UenoRUav.sJ3Lu.ZZg6H2y9qO9QzS7Z/FM5owKvZkyssm",
    role: "Regular",
    createdAt: {
        $date: "2023-05-10T08:50:08.453Z"
    },
    updatedAt: {
        $date: "2023-05-25T18:39:01.631Z"
    },
    __v: 0,
    refreshToken: "eyJhbGcaEiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYi5pdCIsImlkIjoiNjQ1YjVhYzAyNDcyYzI0Yjc4NTZhYTg0IiwidXNlcm5hbWUiOiJyb3NhcmlvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUwMzk5NDEsImV4cCI6MTY4NTY0NDc0MX0.Kwb0PVOPZuONPI4yQj777_G2XqgUZ-mkOngJUAKXkcM"
}
const adminUser = {
    _id: {
        $oid: "645b5ac02472c24b7856aa84"
    },
    username: "test_user",
    email: "test@mail.it",
    password: "$2a$12$4V7TDvu6UenoRUav.sJ3Lu.ZZg6H2y9qO9QzS7Z/FM5owKvZkyssm",
    role: "Admin",
    createdAt: {
        $date: "2023-05-10T08:50:08.453Z"
    },
    updatedAt: {
        $date: "2023-05-25T18:39:01.631Z"
    },
    __v: 0,
    refreshToken: "eyJhbGcaEiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYi5pdCIsImlkIjoiNjQ1YjVhYzAyNDcyYzI0Yjc4NTZhYTg0IiwidXNlcm5hbWUiOiJyb3NhcmlvIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODUwMzk5NDEsImV4cCI6MTY4NTY0NDc0MX0.Kwb0PVOPZuONPI4yQj777_G2XqgUZ-mkOngJUAKXkcM"
}

const aggregatedTransaction = {
    _id: "64623e4efe11ac32bcac04ad",
    username: 'test_user',
    type: 'test_type',
    amount: 4,
    date: new Date("2023-05-15T14:14:38.114Z"),
    __v: 0,
    categories_info: {
        _id: "646236582df47524a659119a",
        type: 'test_type',
        color: 'test_color',
        __v: 0
    }
}
const rawTransaction = {
    _id: "64623e4efe11ac32bcac04ad",
    username: 'test_user',
    type: 'test_type',
    amount: 4,
    date: new Date("2023-05-15T14:14:38.114Z"),
    __v: 0,
}

const resultAggregatedTransaction = {
    username: 'test_user',
    type: 'test_type',
    amount: 4,
    date: "2023-05-15T14:14:38",
    color: 'test_color',
}

const resultTransaction = {
    username: 'test_user',
    type: 'test_type',
    amount: 4,
    date: "2023-05-15T14:14:38",
}

const rawCategory = {
    _id: "646236582df47524a659119a",
    type: 'test_type',
    color: 'test_color',
    __v: 0
}

const resultCategory = {
    type: 'test_type',
    color: 'test_color',
}

const rawGroup = {
    "_id": {
        "$oid": "646abb56e290d27556212fbc"
    },
    "name": "a",
    "members": [
        {
            "email": "a@b.it",
            "user": "645b5ac02472c24b7856aa15"
        },
        {
            "email": "b@c.it",
            "user": "645b5ac02472c24b7856aa76"
        }
    ]
}

beforeEach(() => {
    User.find.mockClear()
    User.findOne.mockClear()
    Group.findOne.mockClear()
    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.deleteMany.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();
});

describe("createCategory", () => {
    test('should return 400 for null value', async () => {
        const req = {
            body: {
                type: null
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect values' });
    });


    test('should return 200 for create a new category', async () => {
        const req = {
            body: {
                type: " family",
                color: " red"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories.prototype, "save").mockImplementation(() => {
            return Promise.resolve(rawCategory);
        });

        await createCategory(req, res);

        //expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: resultCategory,
            refreshedTokenMessage: "message"
        });
    });

    test('should return 401 for unauthorized authentication', async () => {
        const req = {
            body: {
                type: "family",
                color: "red"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test('should return 400 for missing type or color', async () => {
        const req = {
            body: {
                type: "family"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect values' });
    });

    test('should return 400 for existing category', async () => {
        const req = {
            body: {
                type: "family",
                color: "red"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Category already exists' });
    });

    test('should return 500 for internal server error', async () => {
        const req = {
            body: {
                type: "family",
                color: "red"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

});

describe("updateCategory", () => {
    test('should return 400 for null value', async () => {
        const req = {
            body: {
                color: null
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid parameters' });
    });

    test('should return 401 for unauthorized authentication', async () => {
        const req = {
            body: {
                type: "family",
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test('should return 400 for invalid parameters', async () => {
        const req = {
            body: {
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid parameters' });
    });

    test('should return 400 for existing category', async () => {
        const req = {
            body: {
                type: "newType",
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Category already existing' });
    });

    test('should return 400 for category not found', async () => {
        const req = {
            body: {
                type: "newType",
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);
        jest.spyOn(categories, "updateOne").mockImplementation(() => ({ matchedCount: 0 }));

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    test('should return 200 for update transactions and return success message', async () => {
        const req = {
            body: {
                type: "newType",
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);
        jest.spyOn(categories, "updateOne").mockImplementation(() => ({ matchedCount: 1 }));
        jest.spyOn(transactions, "updateMany").mockImplementation(() => ({ modifiedCount: 10 }));


        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: { message: 'Category updated succesfully!', count: 10 }, refreshedTokenMessage: 'message' });
    });

    test('should return 500 for internal server error', async () => {
        const req = {
            body: {
                type: "newType",
                color: "red"
            },
            params: {
                type: "oldType"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

describe("deleteCategory", () => {

    test('should return 400 for null value', async () => {
        const req = {
            body: {
                types: [null]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid values' });
    });

    test('should return 401 for unauthorized authentication', async () => {
        const req = {
            body: {
                types: ["family", "work"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test('should return 400 for invalid values', async () => {
        const req = {
            body: {
                types: []
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid values' });
    });

    test('should return 400 for only one category not deletable', async () => {
        const req = {
            body: {
                types: ["family"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });


        jest.spyOn(categories, "find").mockResolvedValue(["family"]);


        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Only one category cannot be deleted' });
    });

    test('should return 400 for non-existing categories', async () => {
        const req = {
            body: {
                types: ["family", "work"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "find").mockResolvedValue(["family", "personal"]);

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Category not existing' });
    });

    test('should return 200 for delete categories except one and update transactions', async () => {
        const req = {
            body: {
                types: ["family", "work"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        const mockCategories = [{ type: "family", color: "red" },
        { type: "work", color: "blue" },
        { type: "personal", color: "yellow" }];

        jest.spyOn(categories, "find").mockResolvedValue(mockCategories);
        jest.spyOn(categories, "deleteMany").mockResolvedValue({ deletedCount: 2 });
        jest.spyOn(transactions, "updateMany").mockResolvedValue({matchedCount: 2});

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: { message: 'Category deleted succesfully!', count: 2 }, refreshedTokenMessage: 'message' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: ["family", "work"] } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: ["family", "work"] } }, { $set: { type: "personal" } });
    });

    test('should return 200 for trying delete all categories and update transactions', async () => {
        const req = {
            body: {
                types: ["family", "work", "school"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        const mockCategories = [{ type: "family", color: "red" },
        { type: "work", color: "blue" },
        { type: "school", color: "yellow" }];

        jest.spyOn(categories, "find").mockResolvedValue(mockCategories);
        jest.spyOn(categories, "deleteMany").mockResolvedValue({ deletedCount: 2 });
        jest.spyOn(transactions, "updateMany").mockResolvedValue({matchedCount : 2});

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: { message: 'Category deleted succesfully!', count: 2 }, refreshedTokenMessage: 'message' });
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: ["work", "school"] } });
        expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: ["work", "school"] } }, { $set: { type: "family" } });
    });

    test('should return 500 for internal server error', async () => {
        const req = {
            body: {
                types: ["family", "work"]
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "find").mockImplementation(() => {
            throw new Error('Database error')
        });

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });

})

describe("getCategories", () => {
    test("should return 200 for get categories successfully", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "find").mockResolvedValue([rawCategory, rawCategory]);


        await getCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [resultCategory, resultCategory],
            refreshedTokenMessage: 'message'
        });
    });

    test("should return 401 for unauthorized authentication", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await getCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test("should return 500 for internal server error", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(categories, "find").mockImplementation(() => {
            throw new Error('Internal server error')
        });

        await getCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});

describe("createTransaction", () => {
    test('should return 400 for null value', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: null,
                amount: 50.0
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid parameters' });
    });


    test("should return 401 for unauthorized authentication", async () => {
        const req = {
            params: {
                username: 'User'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test('should return 200 for create a new transaction', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'john',
                amount: 45.0,
                type: 'expense'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });


        jest.spyOn(User, "findOne").mockImplementation(() => adminUser);
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);
        jest.spyOn(transactions.prototype, "save").mockImplementation(() => {
            return Promise.resolve(
                rawTransaction
            );
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: resultTransaction,
            refreshedTokenMessage: 'message'
        });
    });

    test('should return 400 if parameters are missing', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'john',
                amount: 50.0
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid parameters' });
    });

    test('should return 400 if username in body does not match username in params', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'jane',
                amount: 50.0,
                type: 'expense'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Username mismatch' });
    });

    test('should return 400 if user does not exist', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'john',
                amount: 50.0,
                type: 'expense'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => null);

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not existing' });
    });

    test('should return 400 if category does not exist', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'john',
                amount: 50.0,
                type: 'expense'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => ({ username: 'john' }));
        jest.spyOn(categories, "findOne").mockImplementation(() => null);


        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Category not existing' });
    });

    test('should return 500 if save operation fails', async () => {
        const req = {
            params: {
                username: 'john'
            },
            body: {
                username: 'john',
                amount: 50.0,
                type: 'expense'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => ({ username: 'john' }));
        jest.spyOn(categories, "findOne").mockImplementation(() => ({ type: 'expense' }));
        jest.spyOn(transactions.prototype, "save").mockImplementation(() => {
            return Promise.reject(new Error('Save operation failed'));
        });

        await createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Save operation failed' });
    });

})

describe("getAllTransactions", () => {
    test("should return 200 for return all transactions with category information successfully", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(transactions, "aggregate").mockImplementation(() =>
            Promise.resolve([aggregatedTransaction, aggregatedTransaction])
        );


        await getAllTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction, resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
    })

    test("should return 401 for unauthorized authentication", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Authentication failed' };
        });

        await getAllTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });

    test("should return 500 for internal server error", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: 'message'
            }
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authentication ok' };
        });

        jest.spyOn(transactions, "aggregate").mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await getAllTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });


});

describe("getTransactionsByUser", () => {
    test('should return empty list if there are no transaction made by a regular user', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/users/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        handleAmountFilterParams.mockImplementation(()=>{
            return {};
        })
        handleDateFilterParams.mockImplementation(()=>{
            return {};
        })


        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return empty list if there are no transaction made by a admin user', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/transactions/users/test_user"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };



        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        handleAmountFilterParams.mockImplementation(() => "mock_amount_return");
        handleDateFilterParams.mockImplementation(() => "mock_date_return");
        jest.spyOn(User, "findOne").mockImplementation(() => adminUser)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return unauthorized user', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "users/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Not Authorized' };
        });

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Not Authorized"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return 401 if regular user try to access admin user path', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/transactions/users/test_user"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Regular user not allowed' };
        });

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Regular user not allowed"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return error if the user is not found', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "users/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        handleAmountFilterParams.mockImplementation(()=>{
            return {};
        })
        handleDateFilterParams.mockImplementation(()=>{
            return {};
        })



        jest.spyOn(User, "findOne").mockImplementation(() => undefined)

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "User does not exist"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return transactions', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "users/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        handleAmountFilterParams.mockImplementation(()=>{
            return {};
        })
        handleDateFilterParams.mockImplementation(()=>{
            return {};
        })

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => [aggregatedTransaction, aggregatedTransaction]);

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction, resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });

    test('should return 500 for internal server error', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "users/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('should return transactions if query params are passed', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/users/test_user/transactions",
            query: {
                max: "mock_amount",
                date: "mock_date"
            }

        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        handleAmountFilterParams.mockImplementation(() => {
            return { amount: "mock_amount_return" };
        });
        handleDateFilterParams.mockImplementation(() => {
            return { date: "mock_date_return" };
        });



        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => [aggregatedTransaction]);

        await getTransactionsByUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return 400 if filters fail', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/users/test_user/transactions",
            query: {
                max: "mock_amount",
                date: "mock_date"
            }

        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        handleAmountFilterParams.mockImplementation(() => "mock_amount_return");
        handleDateFilterParams.mockImplementation(() => {
            throw new Error("Invalid amount value");
        });


        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => [aggregatedTransaction]);

        await getTransactionsByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid amount value' });



    });
})

describe("getTransactionsByUserByCategory", () => {
    test('should return empty list if there are no transaction made by a regular user', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"
            },
            url: "/users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "find").mockImplementation(() => []);
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });

    test('should return empty list if there are no transaction made by a admin user', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"
            },
            url: "/transactions/users/test_user/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => adminUser)
        jest.spyOn(transactions, "find").mockImplementation(() => []);
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return 401 if regular user try to access admin user path', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/transactions/users/test_user/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Regular user not allowed' };
        });

        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Regular user not allowed"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should unauthorized user', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"
            },
            url: "/users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Not Authorized' };
        });

        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Not Authorized"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return error if the user is not found', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"

            },
            url: "/users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => undefined)
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "User not existing"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if the catrgory is not found', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"

            },
            url: "/users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(categories, "findOne").mockImplementation(() => undefined);


        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Category not existing"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return transactions', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"
            },
            url: "/users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);
        jest.spyOn(transactions, "find").mockImplementation(() => [rawTransaction, rawTransaction]);

        await getTransactionsByUserByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction, resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
    test('should return 500 for internal server error', async () => {
        const req = {
            params: {
                username: "test_username",
                category: "test_category"
            },
            url: "users/test_user/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await getTransactionsByUserByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

describe("getTransactionsByGroup", () => {
    test('should return empty list if there are no transaction made by a regular user', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/groups/test_group/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return empty list if there are no transaction made by a admin user', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/transactions/groups/test_group"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should unauthorized user', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/groups/test_group/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Not Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Not Authorized"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return 401 if regular user try to access admin user path', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/transactions/groups/test_group"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Regular user not allowed' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Regular user not allowed"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return error if the group is not found', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/groups/test_group/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => undefined)

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Group does not exist"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return transactions', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/groups/test_group/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => [aggregatedTransaction, aggregatedTransaction]);

        await getTransactionsByGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction, resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return 500 for internal server error', async () => {
        const req = {
            params: {
                name: "test_group"
            },
            url: "/groups/test_group/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await getTransactionsByGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

})

describe("getTransactionsByGroupByCategory", () => {
    test('should return empty list if there are no transaction made by a regular user', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"
            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return empty list if there are no transaction made by a admin user', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"
            },
            url: "/transactions/groups/test_group/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(transactions, "aggregate").mockImplementation(() => []);
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return unauthorized user', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"
            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Not Authorized' };
        });

        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Not Authorized"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return 401 if regular user try to access admin user path', async () => {
        const req = {
            params: {
                username: "test_username"
            },
            url: "/transactions/groups/test_group/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Regular user not allowed' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)

        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Regular user not allowed"
        });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return error if the group is not found', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"

            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => undefined)
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);


        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Group does not exist"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if the catrgory is not found', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"

            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(categories, "findOne").mockImplementation(() => undefined);


        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Category does not exist"
        });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return transactions', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"
            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(Group, "findOne").mockImplementation(() => rawGroup)
        jest.spyOn(categories, "findOne").mockImplementation(() => rawCategory);
        jest.spyOn(transactions, "aggregate").mockImplementation(() => [aggregatedTransaction, aggregatedTransaction]);

        await getTransactionsByGroupByCategory(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: [resultAggregatedTransaction, resultAggregatedTransaction],
            refreshedTokenMessage: 'message'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
    test('should return 500 for internal server error', async () => {
        const req = {
            params: {
                name: "test_group",
                category: "test_category"
            },
            url: "/groups/test_group/transactions/category/test_category"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await getTransactionsByGroupByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

describe("deleteTransaction", () => {
    test('should return error if values are null', async () => {
        const req = {
            params: {
                username: ""
            },
            body: {
                _id: undefined
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Invalid values" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if values are not valid', async () => {
        const req = {
            params: {
                username: ""
            },
            body: {
                _id: ""
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Invalid values" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if user does not exist', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        jest.spyOn(User, "findOne").mockImplementation(() => undefined)

        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "User not existing" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if the user is unauthorized', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Unauthorized' };
        });

        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return ok message', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "deleteOne").mockImplementation(() => { return { deletedCount: 1 } })


        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ data: { message: "Transaction deleted succesfully!" }, refreshedTokenMessage: "message" });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return error message because the transaction was not found', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "deleteOne").mockImplementation(() => { return { deletedCount: 0 } })


        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Transaction not existing" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error message if the transaction to be deleted does not belong to the user', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(User, "findOne").mockImplementation(() => regularUser)
        jest.spyOn(transactions, "deleteOne").mockImplementation(() => { return { deletedCount: 0 } })


        await deleteTransaction(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Transaction not existing" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return 500 for internal server error', async () => {
        const req = {
            params: {
                username: "test_user"
            },
            body: {
                _id: "test_id"
            },
            url: "/user/test_user/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await deleteTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

describe("deleteTransactions", () => {
    test('should return error if at least one of _ids is empty', async () => {
        const req = {
            body: {
                _ids: ["_id_test", ""]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "One or more paramater not valid" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if _id is undefined', async () => {
        const req = {
            body: {
                _ids: undefined
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "One or more paramater not valid" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if at least one of _ids is undefined', async () => {
        const req = {
            body: {
                _ids: ["_id_test", undefined]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });
        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "One or more paramater not valid" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if deleteMany does not work', async () => {
        const req = {
            body: {
                _ids: ["_id_test", "_id_test_2"]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(transactions, "find").mockImplementation(() => [rawTransaction, rawTransaction]);
        jest.spyOn(transactions, "deleteMany").mockImplementation(() => {
            throw new Error("error")
        });

        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "One or more paramater not valid" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return error if user is not admin', async () => {
        const req = {
            body: {
                _ids: ["_id_test", "_id_test2"]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: 'Regular user not allowed' };
        });
        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "Regular user not allowed" });
        expect(res.status).toHaveBeenCalledWith(401);

    });
    test('should return error if at least one category is not found', async () => {
        const req = {
            body: {
                _ids: ["_id_test", "_id_test2"]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(transactions, "find").mockImplementation(() => [rawTransaction]);


        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ error: "One or more transactions not found" });
        expect(res.status).toHaveBeenCalledWith(400);

    });
    test('should return ok message', async () => {
        const req = {
            body: {
                _ids: ["_id_test", "_id_test2"]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: 'Authorized' };
        });

        jest.spyOn(transactions, "find").mockImplementation(() => [rawTransaction, rawTransaction]);
        jest.spyOn(transactions, "deleteMany").mockImplementation(() => undefined);


        await deleteTransactions(req, res);

        expect(res.json).toHaveBeenCalledWith({ data: { message: "Transactions deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        expect(res.status).toHaveBeenCalledWith(200);

    });
    test('should return 500 for internal server error', async () => {
        const req = {
            body: {
                _ids: ["_id_test", "_id_test2"]
            },
            url: "/transactions"
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        verifyAuth.mockImplementation(() => {
            throw new Error('Internal server error');
        });

        await deleteTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

