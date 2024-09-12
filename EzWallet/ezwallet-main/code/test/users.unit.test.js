import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { getUsers, getUser, createGroup, getGroups, getGroup, addToGroup, removeFromGroup, deleteUser, deleteGroup } from '../controllers/users.js'
import * as utils from '../controllers/utils.js'
import jwt from 'jsonwebtoken'
import { verifyAuth } from '../controllers/utils';


import { transactions } from '../models/model';



/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")
jest.mock('../controllers/utils');

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear()
  //additional `mockClear()` must be placed here
  User.findOne.mockClear()
});

// Version updated to 6/6/23. All the cases reported on API.md have been tested.

// OK
describe("getUsers", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(utils, "verifyAuth").mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  // works
  test("verifyauth test", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    const response = await request(app)
      .get("/api/users")
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: "Authentication failed" })
  })

  // works
  test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(User, "find").mockImplementation(() => [])
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: true };
      return ritorno;
    })

    const response = await request(app)
      .get("/api/users")
    expect(response.body).toEqual({ data: [], refreshedTokenMessage: "message" })
  })

  // works
  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', role: 'Regular' }, { username: 'test2', email: 'test2@example.com', role: 'Regular' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: retrievedUsers, refreshedTokenMessage: "message" })
  })
})


// OK
describe("getUser", () => {


  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
      },
      params: {
        username: "username"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { refreshedTokenMessage: "string" },
    };

    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: true };
      return ritorno;
    })

    User.findOne = jest.fn().mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });


  test("verifyauth test", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    const response = await request(app)
      .get("/api/users/fakeUser")
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: "Authentication failed" })
  })

  test('should return Unauthorized if the requested username does not match the user in the database', async () => {
    const mockReq = {
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      },
      params: {
        username: 'differentuser'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockUser = {
      username: 'testuser' // Simula un utente con un nome utente diverso da quello richiesto
    };

  verifyAuth.mockReturnValueOnce({ authorized: false, cause: 'Authentication ok'});
verifyAuth.mockReturnValueOnce({ authorized: true, cause: 'Authentication ok'});
    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser); // Simula la ricerca di un utente
    await getUser(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });


  test('username not in the database', async () => {
    const mockReq = {
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      },
      params: {
        username: 'differentuser'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockUser = {
      username: 'testuser' // Simula un utente con un nome utente diverso da quello richiesto
    };

    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(User, 'findOne').mockResolvedValue(null); // Simula la ricerca di un utente
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
  });


  test('should return the user if all conditions are met', async () => {
    const mockReq = {
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      },
      params: {
        username: 'testuser'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    };
    const mockUser = {
      username: 'testuser',
      // Altri dettagli dell'utente simulato
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser); // Simula la ricerca di un utente
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await getUser(mockReq, mockRes);

    expect(User.findOne).toHaveBeenCalledWith(mockUser);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: mockUser, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage });
  });
})


// OK
describe("createGroup", () => {

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

    await createGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test", async () => {
    const mockReq = {
      body: {
        type: "family",
        color: "red"
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    await createGroup(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Authentication failed" })
  })

  test("missing attributes", async () => {
    const mockReq = {
      body: {
        name: "Test Group"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing attributes' })
  })

  test("name passed is empty", async () => {
    const mockReq = {
      body: {
        name: "",
        memberEmails: ["test1@test.com", "test2@test.com", "test3@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Name cannot be empty' })
  })

  test("should return an error message if user is not found", async () => {
    const mockReq = {
      body: {
        name: "Test Group",
        memberEmails: ["test1@test.com", "test2@test.com", "test3@test.com"]
      },

      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(Group, "findOne").mockResolvedValue(null);
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' })
  })

  test("user already in a group", async () => {
    const mockReq = {
      body: {
        name: "Test Group",
        memberEmails: ["test1@test.com", "test2@test.com", "test3@test.com"]
      },

      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })
    jest.spyOn(User, "findOne").mockResolvedValue({ username: "username" });
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null).mockResolvedValue({ name: 'OldGroup' });
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User already in a group' })
  })

  // works
  test("should return an error message if one or more members are already in a group", async () => {
    const mockReq = {
      body: {
        name: "Test Group",
        memberEmails: ["test1@test.com", "test2@test.com", "test3@test.com"]
      },

      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })
    jest.spyOn(User, "findOne").mockResolvedValue({ username: 'username' })
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "name" });
    await createGroup(mockReq, mockRes)
    // expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User already in a group' })
  })

  // works
  test("one or more email is empty", async () => {
    const mockReq = {
      body: {
        name: "Test Group",
        memberEmails: ["", "test2@test.com", "test3@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })

    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
    User.findOne = jest.fn().mockResolvedValue({ username: 'yuewbfu' });
    jest.spyOn(Group, "findOne").mockResolvedValue(null);

    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'email cannot be empty' })
  })

  // works
  test("error message if one or more email is is wrong format", async () => {
    const mockReq = {
      body: {
        name: "Test Group",
        memberEmails: ["emailNotValid", "test2@test.com", "test3@test.com"]
      },

      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })
    jest.spyOn(User, "findOne").mockResolvedValue({ username: "user", email: "user@example.com", password: "password" })
    jest.spyOn(Group, "findOne").mockResolvedValue(null)
    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'wrong email format' })
  })

  test("Emails do not exist or are already in other groups", async () => {
    const mockReq = {
      path: "falsePath",
      body: {
        name: "TestGroup",
        memberEmails: ["test0@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })

    jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "user", email: "test5@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValue({ username: "user", email: "test1@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup" }) // Mocking Group.findOne to return null

    // jest.spyOn(Group.prototype, "save").mockResolvedValue({}) // Mocking save() method to resolve successfully

    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400) // Expect status() not to have been called (indicating success)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Emails do not exist or are already in other groups' }) // Expect json() to have been called

  })

  // works
  test("should create a new group when all members are valid", async () => {
    const mockReq = {
      path: "falsePath",
      body: {
        name: "TestGroup",
        memberEmails: ["test0@test.com", "test1@test.com", "test2@test.com", "test3@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })

    jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "user", email: "test5@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValue({ username: "user", email: "test1@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "TestGroup" }) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValue(null) // Mocking Group.findOne to return null
    // jest.spyOn(Group.prototype, "save").mockResolvedValue({}) // Mocking save() method to resolve successfully

    /*{data: 
        {group: 
            {name: "Family", 
             members: [ {email: "mario.red@email.com"}, 
                        {email: "luigi.red@email.com"}
                      ]
            }, 
          membersNotFound: [], 
          alreadyInGroup: []
        }, 
        refreshedTokenMessage: res.locals.refreshedTokenMessage})`*/
    let result = {
      data: {
        group: {
          name: 'TestGroup',
          members: [{ email: "test1@test.com" },
          { email: "test2@test.com" },
          { email: "test3@test.com" },
          { email: "test5@test.com" }]
        },
        alreadyInGroup: ["test0@test.com"],
        membersNotFound: ["test0@test.com"]
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    };
    Group.prototype.save = jest.fn().mockResolvedValue(result);
    await createGroup(mockReq, mockRes)
    //    expect(mockRes.status).toHaveBeenCalledWith(200) // Expect status() not to have been called (indicating success)
    expect(mockRes.json).toHaveBeenCalledWith(result) // Expect json() to have been called

  })

  test("should create a new group when all members are valid (different path taken)", async () => {
    const mockReq = {
      path: "falsePath",
      body: {
        name: "TestGroup",
        memberEmails: ["test0@test.com", "test1@test.com", "test2@test.com", "test3@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })

    jest.spyOn(User, "findOne").mockResolvedValueOnce({ username: "user", email: "test1@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null) // Mocking User.findOne to return a non-null value
    jest.spyOn(User, "findOne").mockResolvedValue({ username: "user", email: "test1@test.com", password: "password" }) // Mocking User.findOne to return a non-null value
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValueOnce({ name: "TestGroup" }) // Mocking Group.findOne to return null
    jest.spyOn(Group, "findOne").mockResolvedValue(null) // Mocking Group.findOne to return null
    // jest.spyOn(Group.prototype, "save").mockResolvedValue({}) // Mocking save() method to resolve successfully

    /*{data: 
        {group: 
            {name: "Family", 
             members: [ {email: "mario.red@email.com"}, 
                        {email: "luigi.red@email.com"}
                      ]
            }, 
          membersNotFound: [], 
          alreadyInGroup: []
        }, 
        refreshedTokenMessage: res.locals.refreshedTokenMessage})`*/
    let result = {
      data: {
        group: {
          name: 'TestGroup',
          members: [{ email: "test1@test.com" },
          { email: "test2@test.com" },
          { email: "test3@test.com" }]
        },
        alreadyInGroup: ["test0@test.com"],
        membersNotFound: ["test0@test.com"]
      },
      refreshedTokenMessage: mockRes.locals.refreshedTokenMessage
    };
    Group.prototype.save = jest.fn().mockResolvedValue(result);
    await createGroup(mockReq, mockRes)
    //    expect(mockRes.status).toHaveBeenCalledWith(200) // Expect status() not to have been called (indicating success)
    expect(mockRes.json).toHaveBeenCalledWith(result) // Expect json() to have been called

  })

  // works
  test("group with this name already exists", async () => {
    const mockReq = {
      path: "falsePath",
      body: {
        name: "TestGroup",
        memberEmails: ["test1@test.com", "test2@test.com", "test3@test.com"]
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      let ritorno = {};
      ritorno.username = 'yuewbfu';
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup" }) // Mocking Group.findOne to return null
    // jest.spyOn(Group.prototype, "save").mockResolvedValue({}) // Mocking save() method to resolve successfully

    await createGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400) // Expect status() not to have been called (indicating success)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group with this name already exists' }) // Expect json() to have been called

  })


})

// OK
describe("getGroups", () => {

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

    await getGroups(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    const response = await request(app)
      .get("/api/groups")
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: "Authentication failed" })
  })

  test("should return a list of groups indicating success", async () => {
    const mockReq = {

    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })

    jest.spyOn(Group, "find").mockResolvedValue([{ name: "group 1", members: [{ email: "a" }, { email: "b" }] }]) // Mocking Group.findOne to return null
    await getGroups(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: [{ name: "group 1", members: [{ email: "a" }, { email: "b" }] }], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage })
  })


  test("should return an empty array if there are no groups", async () => {
    const mockReq = {

    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })

    jest.spyOn(Group, "find").mockResolvedValue([]) // Mocking Group.findOne to return null
    await getGroups(mockReq, mockRes)
    expect(mockRes.status).not.toHaveBeenCalledWith()
    expect(mockRes.json).toHaveBeenCalledWith({ data: [], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage })
  })



})

// OK
describe("getGroup", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      params: {
        name: 'TestGroup'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Group.findOne.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await getGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test('should return 401 for unauthorized authentication', async () => {
    const req = {
      body: {

      },
      params: {
        name: "TestGroup",
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup", members: [{ email: "1" }, { email: "2" }] });

    jest.spyOn(utils, "verifyAuth").mockImplementation(() => {
      return { authorized: false, cause: 'Authentication failed' };
    });

    await getGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
  });

  test("returns a group", async () => {
    const mockReq = {
      params: {
        name: "group"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })

    // {data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}}, refreshedTokenMessage: res.locals.refreshedTokenMessage})

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "group 1", members: [{ email: "a" }, { email: "b" }] }) // Mocking Group.findOne to return null
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).not.toHaveBeenCalledWith()
    expect(mockRes.json).toHaveBeenCalledWith({ data: { group: { name: "group 1", members: [{ email: "a" }, { email: "b" }] } }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage })
  })


  test("returns 400: group does not exist", async () => {
    const mockReq = {
      params: {
        name: "group"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue(null) // Mocking Group.findOne to return null
    await getGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group does not exist' })
  })


})

// OK
describe("addToGroup", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Group.findOne.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await addToGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test con path add", async () => {
    const mockReq = {
      path: "/groups/TestGroup/add",
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup", members: [{ email: "1" }, { email: "2" }] });

    await addToGroup(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  test("verifyauth test con path insert", async () => {
    const mockReq = {
      path: "/groups/TestGroup/insert",
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup", members: [{ email: "1" }, { email: "2" }] });

    await addToGroup(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  test("missing attributes", async () => {
    const mockReq = {
      body: {
        //  emails: ["pietro.blue@email.com", "pietro.blue@email.com"]
      },
      params: {
        name: 'Group Name'
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing attributes' })
  })


  test("group does not exist", async () => {
    const mockReq = {
      body: {
        emails: ["pietro.blue@email.com", "pietro.blue@email.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue(null);
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group does not exist' })
  })

  // works
  test("email cannot be empty", async () => {
    const mockReq = {
      body: {
        emails: ["email1@gmail.com", "", "pietro.blue@email.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    utils.verifyAuth = jest.fn().mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    Group.findOne = jest.fn().mockResolvedValue({ name: "fakegroup", members: ["email1@gmail.com"] });
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'email cannot be empty' })
  })

  // works
  test("email in wrong format", async () => {
    const mockReq = {
      body: {
        emails: ["emailNotValid", "pietro.blue@email.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: ["email1@gmail.com"] });
    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'one of the emails is not valid' })
  })

  // works
  test("all emails are not valid or in other groups", async () => {
    const mockReq = {
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: ["email1@gmail.com"] });
    jest.spyOn(User, 'findOne').mockResolvedValue();

    await addToGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Emails do not exist or are already in other groups' })
  })

  // works (to clean up)
  test("correct execution: added emails to group", async () => {
    const mockReq = {
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    let mockGroup = { name: 'TestGroup', members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }] };

    jest.spyOn(Group, 'findOne').mockResolvedValueOnce(mockGroup).mockResolvedValue(null);

    jest.spyOn(Group, 'updateOne').mockResolvedValue({ name: "fakegroup", members: ["email1@gmail.com"] });
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(User, 'findOne').mockResolvedValue({ username: "fakeuser" });
    await addToGroup(mockReq, mockRes)
    // expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(
      {
        data: {
          group: { name: "TestGroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }, { email: "email@gmail.com" }] },
          membersNotFound: ["pietro.blue@email.com"],
          alreadyInGroup: []
        },
        refreshedTokenMessage: "message"
      })
  })

})

// OK
describe("removeFromGroup", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Group.findOne.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await removeFromGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test 1", async () => {
    const mockReq = {
      path: "/groups/TestGroup/pull",
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup", members: [{ email: "1" }, { email: "2" }] });

    await removeFromGroup(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  test("verifyauth test 2", async () => {
    const mockReq = {
      path: "/groups/TestGroup/remove",
      body: {
        emails: ["pietro.blue@email.com", "email@gmail.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    jest.spyOn(Group, "findOne").mockResolvedValue({ name: "TestGroup", members: [{ email: "1" }, { email: "2" }] });

    await removeFromGroup(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  // works
  test("missing attributes", async () => {
    const mockReq = {
      body: {
      },
      params: {
        name: 'Group Name'
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing attributes' })
  })

  // works
  test("group does not exist", async () => {
    const mockReq = {
      body: {
        emails: ["pietro.blue@email.com", "pietro.blue@email.com"]
      },
      params: {
        name: "TestGroup",
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue(null);
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group does not exist' })
  })

  // works
  test("email cannot be empty", async () => {
    const mockReq = {
      body: {
        emails: ["", "pietro@email.com"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }] });
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'email cannot be empty' })
  })

  // works
  test("email in wrong format", async () => {
    const mockReq = {
      body: {
        emails: ["emailNotValid", "emailNotValid"]
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: ["user1", "user2"] });
    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'one of the emails is not valid' })
  })

  // works
  test("all emails are not valid or in other groups", async () => {
    const mockReq = {
      body: {
        emails: ["email1@gmail.com", "email2@gmail.com"],
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    //   jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: [{email : "user1"}, {email : "user2"}] });
    Group.findOne = jest.fn().mockResolvedValue({ name: "fakegroup", members: [{ email: "user1" }, { email: "user2" }] });
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insert at least one valid member to delete' })
  })

  test("Insert at least one valid member to delete (while loop)", async () => {
    const mockReq = {
      body: {
        emails: ["email42@gmail.com", "email84@gmail.com", "email8@gmail.com", "email15@gmail.com", "email16@gmail.com"],
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "email1@gmail.com" }] });
    jest.spyOn(Group, 'updateOne').mockResolvedValue({ n: "something" });
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }, { email: "email3@gmail.com" }, { email: "email4@gmail.com" }] });

    jest.spyOn(User, 'findOne').mockResolvedValue({ username: "username" });

    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insert at least one valid member to delete' })
  })

  // works
  test("cannot delete first user of the group", async () => {
    const mockReq = {
      body: {
        emails: ["email2@gmail.com"],
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "TestGroup", members: [{ email: "email1@gmail.com" }] });

    jest.spyOn(User, 'find').mockResolvedValue({ username: "username" });

    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Insert at least one valid member to delete" })
  })

  // works
  test("remove correctly from database", async () => {
    const mockReq = {
      body: {
        emails: ["email42@gmail.com", "email84@gmail.com"],
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }, { email: "email3@gmail.com" }, { email: "email4@gmail.com" }] });
    jest.spyOn(Group, 'updateOne').mockResolvedValue({ n: "something" });
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }, { email: "email3@gmail.com" }, { email: "email4@gmail.com" }] });

    jest.spyOn(User, 'findOne').mockResolvedValue({ username: "username" });

    await removeFromGroup(mockReq, mockRes)
    expect(mockRes.json).toHaveBeenCalledWith(
      {
        data: {
          group: { name: "TestGroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }, { email: "email3@gmail.com" }, { email: "email4@gmail.com" }] },
          notInGroup: ["email42@gmail.com"],
          membersNotFound: []
        },
        refreshedTokenMessage: "message"
      }
    )
  })
})

describe("deleteUser", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    verifyAuth.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test", async () => {
    const mockReq = {
      body: {
      },
      params: {
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })


    await deleteUser(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  // works
  test("missing attributes", async () => {
    const mockReq = {
      body: {
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing attributes' })
  })

  // works
  test("user does not exist", async () => {
    const mockReq = {
      body: {
        email: "pietro.blue@email.com"
      },
      params: {
        name: "TestGroup",
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User does not exist' })
  })

  // works
  test("email cannot be empty", async () => {
    const mockReq = {
      body: {
        email: ""
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: [{ email: "email1@gmail.com" }, { email: "email2@gmail.com" }] });
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'email cannot be empty' })
  })

  // works
  test("email in wrong format", async () => {
    const mockReq = {
      body: {
        email: "emailNotValid"
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: ["user1", "user2"] });

    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'email is not valid' })
  })

  // works
  test("admins cannot be deleted", async () => {
    const mockReq = {
      body: {
        email: "email@gmail.com"
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, 'findOne').mockResolvedValue({ name: "fakegroup", members: ["user1", "user2"] });
    jest.spyOn(User, 'findOne').mockResolvedValue({ username: "fakeName", role: "Admin" });
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Admins cannot be deleted' })
  })

  // works
  test("user correctly deleted", async () => {
    const mockReq = {
      body: {
        email: "email@gmail.com"
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    //   res.json({data : {deletedTransactions: k.deletedCount, deletedFromGroup : bool}, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    jest.spyOn(Group, 'findOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "test@example.com" }] });
    jest.spyOn(Group, 'updateOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "test@example.com" }] });
    //  jest.spyOn(User, 'findOne').mockResolvedValue({ username: "fakeName", role: "Regular" });
    User.findOne = jest.fn().mockResolvedValue({ username: "fakeName", role: "Regular" });
    jest.spyOn(User, 'deleteOne').mockResolvedValue({ j: "j" });
    jest.spyOn(transactions, 'deleteMany').mockResolvedValue({ deletedCount: 0 });
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ data: { deletedTransactions: 0, deletedFromGroup: true }, refreshedTokenMessage: "message" })
  })

  test("user correctly deleted + removed from group condition", async () => {
    const mockReq = {
      body: {
        email: "email@gmail.com"
      },
      params: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "message"
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    //   res.json({data : {deletedTransactions: k.deletedCount, deletedFromGroup : bool}, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    jest.spyOn(Group, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(Group, 'updateOne').mockResolvedValueOnce({ name: "TestGroup", members: [{ email: "test@example.com" }] });
    //  jest.spyOn(User, 'findOne').mockResolvedValue({ username: "fakeName", role: "Regular" });
    User.findOne = jest.fn().mockResolvedValue({ username: "fakeName", role: "Regular" });
    jest.spyOn(User, 'deleteOne').mockResolvedValue({ j: "j" });
    jest.spyOn(transactions, 'deleteMany').mockResolvedValue({ deletedCount: 0 });
    await deleteUser(mockReq, mockRes)
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ data: { deletedTransactions: 0, deletedFromGroup: false }, refreshedTokenMessage: "message" })
  })

})

// OK
describe("deleteGroup", () => {

  test('should return 500 for internal server error', async () => {
    const req = {
      body: {
        name: 'TestGroup'
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    verifyAuth.mockImplementation(() => {
      throw new Error('Internal server error');
    });

    await deleteGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith('Internal server error');
  });

  test("verifyauth test", async () => {
    const mockReq = {
      body: {
        name: "TestGroup"
      },

      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = { authorized: false, cause: "Authentication failed" };
      return ritorno;
    })

    await deleteGroup(mockReq, mockRes);


    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  })

  test("missing attributes", async () => {
    const mockReq = {
      body: {
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing attributes' })
  })

  // works
  test("Group does not exist", async () => {
    const mockReq = {
      body: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValue(null);
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group does not exist' })
  })


  // works
  test("name cannot be empty", async () => {
    const mockReq = {
      body: {
        name: ""
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'name cannot be empty' })
  })

  // works
  test("group deleted correctly", async () => {
    const mockReq = {
      body: {
        name: "TestGroup"
      },
      cookies: {
        accessToken: 'some-access-token',
        refreshToken: 'valid-refresh-token'
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: jest.fn()
      }
    }
    jest.spyOn(utils, 'verifyAuth').mockImplementation(() => {
      let ritorno = {};
      ritorno.authorized = true;
      return ritorno;
    })
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValue({ name: "TestGroup" });
    await deleteGroup(mockReq, mockRes)
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).toHaveBeenCalledWith({ data: { message: 'Group deleted' }, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage })
  })

})