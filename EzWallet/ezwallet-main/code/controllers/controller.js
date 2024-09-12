
import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }

        let { type, color } = req.body;

        if (type === undefined || type === null || color === undefined || color === null) {
            return res.status(400).json({ error: "Incorrect values" })
        }

        type = type.trim();
        color = color.trim();


        if (!type || !color) {//in type or color are empty string
            return res.status(400).json({ error: "Incorrect values" })
        }

        const existingCategory = await categories.findOne({ type })
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" })
        }

        const new_categories = new categories({ type, color });
        await new_categories.save()
            .then(v => res.status(200).json({ data: { type: v.type, color: v.color }, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause }) // unauthorized
        }


        let { type: newType, color: newColor } = req.body;
        let { type: oldType } = req.params;


        if (newType === undefined || newType === null || newColor === undefined || newColor === null) {
            return res.status(400).json({ error: "Invalid parameters" });
        }

        newType = newType.trim();
        newColor = newColor.trim();
        oldType = oldType.trim();

        if (!newType || !newColor) {
            return res.status(400).json({ error: "Invalid parameters" });
        }

        const existingCategory = await categories.findOne({ type: newType })
        if (existingCategory) {
            return res.status(400).json({ error: "Category already existing" })
        }

        // Modifico la categoria
        const n = await categories.updateOne(
            { type: oldType },
            { $set: { type: newType, color: newColor } }
        );

        if (n.matchedCount != 1) {
            return res.status(400).json({ error: "Category not found" });
        }

        // Modifico tutte le transazioni che erano legate alla categoria
        let count = await transactions.updateMany(
            { type: oldType },
            { $set: { type: newType } }
        );

        count = count.modifiedCount;
        return res.status(200).json({ data: { message: "Category updated succesfully!", count }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }

        let types = [...new Set(req.body.types)];
        
        if (types.length === 0 || types.some(type => (type === undefined || type === null))) {
            return res.status(400).json({ error: "Invalid values" })
        }

        types = types.map((type) => type.trim());

        if (types.length === 0 || types.some(type => !type)) {
            return res.status(400).json({ error: "Invalid values" })
        }
        
        const cats = await categories.find();
        if (cats.length === 1) {
            return res.status(400).json({ error: "Only one category cannot be deleted" })
        }
       
        const toDeleteCategories = cats.filter(cat => types.includes(cat.type)).map(cat => cat.type);

        if (toDeleteCategories.length != types.length) {
            return res.status(400).json({ error: "Category not existing" })
        }
        let toDelete;
        let deletedCategories;
        if (types.length == cats.length) {
            toDelete = types.filter(type => type != cats[0].type);
            deletedCategories = await categories.deleteMany({ type: { $in: toDelete } });
        }
        else if (types.length < cats.length) {
            toDelete = types;
            deletedCategories = await categories.deleteMany({ type: { $in: toDelete } });
        }
        else {
            return res.status(400).json({ error: "Error" })
        }
        const deletedCount = deletedCategories.deletedCount;
        
        const changeCategoryTransactions = cats.filter(cat => !toDelete.includes(cat.type)).map(cat => cat.type);
      
        let updatedTransaction = await transactions.updateMany({ type: { $in: toDelete } }, { $set: { type: changeCategoryTransactions[0] } });
        
        res.status(200).json({ data: { message: 'Category deleted succesfully!', count: updatedTransaction.matchedCount }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Simple" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }

        let cats = await categories.find({})

        //metterei il controllo sul fatto che abbia trovato una categoria

        let myData = cats.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.status(200).json({ data: myData, refreshedTokenMessage: res.locals.refreshedTokenMessage })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };



        const verifyAuthRes = verifyAuth(req, res, { authType: "User", username: req.params.username });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }

        let { username: bodyUsername, amount, type } = req.body;
        let { username: paramUsername } = req.params;
        const myAmount = parseFloat(amount);

        if (bodyUsername === undefined || bodyUsername === null || !amount || type === undefined || type == null || paramUsername === undefined || paramUsername === null || isNaN(myAmount)) {
            return res.status(400).json({ error: "Invalid parameters" });
        }

        bodyUsername = bodyUsername.trim();
        type = type.trim();
        paramUsername = paramUsername.trim();

        if (!bodyUsername || !amount || !type || !paramUsername || isNaN(myAmount)) {
            return res.status(400).json({ error: "Invalid parameters" });
        }

        if (bodyUsername !== paramUsername) {
            return res.status(400).json({ error: "Username mismatch" });
        }
        const user = await User.findOne({ username: bodyUsername });
        if (!user) {
            return res.status(400).json({ error: "User not existing" });
        }

        const category = await categories.findOne({ type });
        if (!category) {
            return res.status(400).json({ error: "Category not existing" });
        }

        const new_transactions = new transactions({ username: bodyUsername, amount: myAmount, type });
        await new_transactions.save()
            .then(v => res.status(200).json({ data: { username: v.username, amount: v.amount, type: v.type, date: v.date.toISOString().slice(0, -5) }, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
            .catch(err => { throw err })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */

        transactions.aggregate([
            {
                $lookup: {  //fa il join tra categories e transaction
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" } //il lookup fa il jon ma inizializza il categories_info come un array, con unwind lo fa diventare un oggetto e quindi estrae dall'array le caratteristiche
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date.toISOString().slice(0, -5) }))
            res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const isAdmin = req.url.indexOf("/transactions/users/") >= 0;

        if (isAdmin) {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        } else {
            const verifyAuthRes = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        }

        let { username } = req.params;

        const userExists = await User.findOne({ username });
        if (!userExists) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const query = { username };


        if (!isAdmin) {
            try {
                const amountFilter = handleAmountFilterParams(req);
                if (amountFilter.amount) {
                    query.amount = amountFilter.amount
                }
                const dataFilter = handleDateFilterParams(req);
                if (dataFilter.date) {
                    query.date = dataFilter.date
                }
            }
            catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }


        const my_transactions = await transactions.aggregate([
            {
                $match: query

            },
            {
                $lookup: {  //fa il join tra categories e transaction
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }]);


        let data = my_transactions.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date.toISOString().slice(0, -5) }))
        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        if (req.url.indexOf("/transactions/users/") >= 0) {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        } else {
            const verifyAuthRes = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        }

        let { username, category } = req.params;


        const userExists = await User.findOne({ username });
        if (!userExists) {
            return res.status(400).json({ error: "User not existing" });
        }

        const categoryExist = await categories.findOne({ type : category });
        if (!categoryExist) {
            return res.status(400).json({ error: "Category not existing" });
        }

        const my_transactions = await transactions.find({ username, type: category });
        let data = my_transactions.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: categoryExist.color, date: v.date.toISOString().slice(0, -5) }))
        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        let { name } = req.params;

        const groupExists = await Group.findOne({ name });
        if (!groupExists) {
            return res.status(400).json({ error: "Group does not exist" });
        }

        if (req.url.indexOf("/transactions/groups/") >= 0) {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        } else {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Group", emails: groupExists.members.map(member => member.email) });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        }


        const my_transactions = await transactions.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'username',
                    foreignField: 'username',
                    as: 'user'
                }
            },
            { $unwind: "$user" },
            {
                $match: { "user.email": { $in: groupExists.members.map(member => member.email) } }

            },
            {
                $lookup: {  //fa il join tra categories e transaction
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }]);

        let data = my_transactions.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date.toISOString().slice(0, -5) }))

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        let { name, category } = req.params;

        const groupExists = await Group.findOne({ name });
        if (!groupExists) {
            return res.status(400).json({ error: "Group does not exist" });
        }

        if (req.url.indexOf("/transactions/groups/") >= 0) {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        } else {
            const verifyAuthRes = verifyAuth(req, res, { authType: "Group", emails: groupExists.members.map(member => member.email) });
            if (!verifyAuthRes.authorized) {
                return res.status(401).json({ error: verifyAuthRes.cause });
            }
        }

        const categoryExist = await categories.findOne({ type : category });
        if (!categoryExist) {
            return res.status(400).json({ error: "Category does not exist" });
        }


        const my_transactions = await transactions.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'username',
                    foreignField: 'username',
                    as: 'user'
                }
            },
            { $unwind: "$user" },
            {
                $match: { "user.email": { $in: groupExists.members.map(member => member.email) }, type: categoryExist.type }

            }]);

        let data = my_transactions.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, color: categoryExist.color, date: v.date.toISOString().slice(0, -5) }))

        return res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        let username = req.params.username;
        let _id = req.body._id;

        if (username === undefined || username === null || _id === undefined || _id === null) {
            return res.status(400).json({ error: "Invalid values" });
        }

        username = username.trim();
        _id = _id.trim();

        if (!username || !_id) {
            return res.status(400).json({ error: "Invalid values" });
        }

        const verifyAuthRes = verifyAuth(req, res, { authType: "User", username });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }


        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).json({ error: "User not existing" });
        }

        try {
            let { deletedCount } = await transactions.deleteOne({ _id, username });
            if (deletedCount === 1) {
                return res.status(200).json({ data: { message: "Transaction deleted succesfully!" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
            }
            else throw new Error;
        }
        catch {
            return res.status(400).json({ error: "Transaction not existing" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        res['locals'] = { refreshedTokenMessage: 'message' };

        const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
        if (!verifyAuthRes.authorized) {
            return res.status(401).json({ error: verifyAuthRes.cause });
        }

        let transactionIds = [...new Set(req.body._ids)];

        if (transactionIds.length == 0 || transactionIds.some(id => (id === undefined || id === null))) {
            return res.status(400).json({ error: "One or more paramater not valid" });
        }

        transactionIds = transactionIds.map((id) => (id.trim()));

        if (transactionIds.length == 0 || transactionIds.some(id => !id)) {
            return res.status(400).json({ error: "One or more paramater not valid" });
        }

        try {
            let trans = await transactions.find({ _id: { $in: transactionIds } })

            if (trans.length != transactionIds.length) {
                return res.status(400).json({ error: "One or more transactions not found" });
            }

            await transactions.deleteMany({ _id: { $in: transactionIds } });

            return res.status(200).json({ data: { message: "Transactions deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

        } catch {
            return res.status(400).json({ error: "One or more paramater not valid" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}