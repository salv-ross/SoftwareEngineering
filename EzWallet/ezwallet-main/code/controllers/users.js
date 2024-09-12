import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";
import jwt from 'jsonwebtoken'

function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {

  try {
    res['locals'] = { refreshedTokenMessage: 'message' };
    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if (!verifyAuthRes.authorized) {
      return res.status(401).json({ message: verifyAuthRes.cause }) // unauthorized
    }
    const users = await User.find();
    res.status(200).json({ data: users.map((x) => { return { username: x.username, email: x.email, role: x.role }; }), refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  res['locals'] = { refreshedTokenMessage: 'message' };
  const verifyAuthResAdmin = verifyAuth(req, res, { authType: "Admin" });
  const verifyAuthResUser = verifyAuth(req, res, { authType: "User", username: req.params.username });
  if ((!verifyAuthResAdmin.authorized && !verifyAuthResUser.authorized)) {

    return res.status(401).json({ message: verifyAuthResUser.cause }) // unauthorized
  }

  try {
    const cookie = req.cookies

    const username = req.params.username
    const user = await User.findOne({ username: username })
    if (!user) return res.status(400).json({ message: "User not found" })
    if (user.username !== username && !verifyAuthResAdmin.authorized) return res.status(400).json({ message: "Unauthorized" })
    res.status(200).json({ data: { username: user.username, email: user.email, role: user.role }, refreshedTokenMessage: res.locals.refreshedTokenMessage })
  } catch (error) {
    res.status(500).json(error.message)
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 400 is returned if there is already an existing group with the same name
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    res['locals'] = { refreshedTokenMessage: 'message' };
    const verifyAuthRes = verifyAuth(req, res, { authType: "Simple" });
    if ((!verifyAuthRes.authorized)) {
      return res.status(401).json({ message: verifyAuthRes.cause }) // unauthorized
    }
    let { name, memberEmails } = req.body;
    if (name === undefined || memberEmails === undefined) {
      return res.status(400).json({ message: 'Missing attributes' })
    }
    name = name.trim();

    memberEmails = memberEmails.map((x) => x.trim());

    if (name === '') {
      return res.status(400).json({ message: 'Name cannot be empty' })
    }
    let group = await Group.findOne({ 'name': name });

    if (group !== null) {
      return res.status(400).json({ message: 'Group with this name already exists' })
    }
    let alreadyInGroup = [...memberEmails];  // copies of memberEmails from which i will filter out the
    let notFound = [...memberEmails];        // ones that don't match the condition

    const cookie = req.cookies
    const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);

    const user = await User.findOne({ 'username': decodedRefreshToken.username });

    if (user === null) {
      return res.status(400).json({ message: "User not found" })
    }

    group = await Group.findOne({ 'members.email': user.email });

    if (group !== null) {
      return res.status(400).json({ message: 'User already in a group' })
    }
    // iterate over memberEmails
    for (let x of memberEmails) {
      // look for user with given email
      if (x === '') {
        return res.status(400).json({ message: `email cannot be empty` })
      }
      if (!isEmailValid(x)) {
        return res.status(400).json({ message: `wrong email format` })
      }
      let m = await User.findOne({ 'email': x })
      if (m === null) {
        // if not present, i filter it leaving the "found" memberEmails in "memberEmails"
        memberEmails = memberEmails.filter((j) => j != x);
      }
      else {
        // if yes, i filter it leaving only the "not found" memberEmails
        notFound = notFound.filter((j) => j != x);
      }

      // look for user in group table
      let n = await Group.findOne({ 'members.email': x })
      if (n === null) {
        // if not present, delete it from "already in group" emails
        alreadyInGroup = alreadyInGroup.filter((j) => j != x);
      }
      else {
        // if yes, delete it from the "not already in a group" memberEmails
        memberEmails = memberEmails.filter((j) => j != x);
      }
    }

    if (!memberEmails.includes(user.email)) {
      memberEmails.push(user.email);
    }

    if (memberEmails.length === 1) {
      return res.status(400).json({ message: 'Emails do not exist or are already in other groups' })
    }

    let members = memberEmails.map((x) => { return { email: x }; })

    // create the new group with the remaining memberEmails
    const new_group = new Group({ name, members });


    // create the object to return
    let gruppo = { "group": { "name": name, "members": members }, 'alreadyInGroup': alreadyInGroup, "membersNotFound": notFound }

    // save it
    new_group.save()
      .then(() => res.status(200).json({ data: gruppo, refreshedTokenMessage: res.locals.refreshedTokenMessage }))

  } catch (err) {
    res.status(500).json(err.message)

  }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    res['locals'] = { refreshedTokenMessage: 'message' };
    // get all groups
    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if ((!verifyAuthRes.authorized)) {
      return res.status(401).json({ message: verifyAuthRes.cause }) // unauthorized
    }
    let data = await Group.find({})
    let list_groups = [];
    data.map(x => { let json = { name: x.name, members: x.members.map((y) => { return { email: y.email }; }) }; list_groups.push(json); });
    return res.json({ data: list_groups, refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    res['locals'] = { refreshedTokenMessage: 'message' };
    const name = req.params.name;

    // look for the group with given name
    let data = await Group.findOne({ 'name': name })
    if (data === null) {
      return res.status(400).json({ message: 'Group does not exist' })
    }
    let email = [];
    data.members.map((v) => email.push(v.email));
    const verifyAuthRes = verifyAuth(req, res, { authType: "Group", emails: email });
    const verifyAuthResAdmin = verifyAuth(req, res, { authType: "Admin" });
    if ((!verifyAuthRes.authorized && !verifyAuthResAdmin.authorized)) {

      return res.status(401).json({ message: verifyAuthRes.cause }) // unauthorized
    }

    let new_members = [];
    data.members.map((x) => { let json = { email: x.email }; new_members.push(json); });
    return res.json({ data: { group: { name: data.name, members: new_members } }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - {"emails" : ["ciao"]}
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {

    const oldName = req.params.name;
    let emails = req.body.emails;

    if (emails === undefined) {
      return res.status(400).json({ message: 'Missing attributes' })
    }

    emails = emails.map((x) => x.trim());
    let data = await Group.findOne({ 'name': oldName });
    if (data === null) {
      return res.status(400).json({ message: 'Group does not exist' })
    }

    const verifyAuthResGroup = verifyAuth(req, res, { authType: "Group", emails: data.members.map((x) => x.email) });
    if (!verifyAuthResGroup.authorized && req.path === `/groups/${oldName}/add`) {
      return res.status(401).json({ error: verifyAuthResGroup.cause });
    }

    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if (!verifyAuthRes.authorized && req.path === `/groups/${oldName}/insert`) {
      return res.status(401).json({ error: verifyAuthRes.cause });
    }

    let alreadyInGroup = [...emails];
    let notFound = [...emails];

    for (let x of emails) {

      if (x === '') {
        return res.status(400).json({ message: `email cannot be empty` })
      }
      if (!isEmailValid(x)) {
        return res.status(400).json({ message: `one of the emails is not valid` })
      }

      // look for user with given email
      let m = await User.findOne({ 'email': x })
      if (m === null) {
        // if not present, delete it from "already in group" emails
        emails = emails.filter((j) => j != x);
      }
      else {
        // if yes, i filter it leaving only the "not found" members
        notFound = notFound.filter((j) => j != x);
      }

      // look for user in group table        
      let n = await Group.findOne({ 'members.email': x })
      if (n === null) {
        // if not present, delete it from "already in group" emails
        alreadyInGroup = alreadyInGroup.filter((j) => j != x);
      }
      else {
        // if yes, delete it from the "not already in a group" members
        emails = emails.filter((j) => j != x);
      }

    }


    if (emails.length === 0) {
      return res.status(400).json({ message: 'Emails do not exist or are already in other groups' })
    }

    // update data.members
    emails.map(v => { data.members.push({ email: v }) })
    // create the return object
    let gruppo = { "group": { "name": data.name, "members": data.members.map((x) => { return { email: x.email }; }) }, 'alreadyInGroup': alreadyInGroup, "membersNotFound": notFound }
    // update in database
    const n = await Group.updateOne(
      { name: oldName },
      { $set: { members: data.members } })


    return res.json({ data: gruppo, refreshedTokenMessage: res.locals.refreshedTokenMessage })

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
  - Request Body Content: An array of strings containing the emails of the members to remove to the group
  - {"email" : "ok"}
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {

    res['locals'] = { refreshedTokenMessage: 'message' };
    const oldName = req.params.name;
    let emails = req.body.emails;

    if (emails === undefined) {
      return res.status(400).json({ message: 'Missing attributes' })
    }

    emails = emails.map((x) => x.trim())

    // find group with given name
    let data = await Group.findOne({ 'name': oldName });
    if (data === null) {
      return res.status(400).json({ message: 'Group does not exist' })
    }


    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if (!verifyAuthRes.authorized && req.path === `/groups/${oldName}/pull`) {
      return res.status(401).json({ error: verifyAuthRes.cause });
    }

    let email = [];
    data.members.map((v) => email.push(v.email));
    const verifyAuthResGroup = verifyAuth(req, res, { authType: "Group", emails: email });
    if (!verifyAuthResGroup.authorized && req.path === `/groups/${oldName}/remove`) {
      return res.status(401).json({ error: verifyAuthResGroup.cause });
    }

    let notFound = [...emails];
    let notInGroup = [...emails];

    for (let x of emails) {

      if (x === '') {
        return res.status(400).json({ message: `email cannot be empty` })
      }
      if (!isEmailValid(x)) {
        return res.status(400).json({ message: `one of the emails is not valid` })
      }

      // look for user with x email
      let m = await User.findOne({ 'email': x })
      if (m === null) {
        // if not present, delete it from emails
        emails = emails.filter((j) => j != x);
        notInGroup = notInGroup.filter((j) => j != x);
      }
      else {
        // if yes, i filter it leaving only the "not found" members
        notFound = notFound.filter((j) => j != x);
      }
      // look for user in group table        
      let n = await Group.findOne({ 'name': oldName, 'members.email': x })
      if (n === null) {
        // if yes, delete it from the "not already in a group" members
        emails = emails.filter((j) => j != x);
      }
      else {
        // if not present, delete it from "already in group" emails
        notInGroup = notInGroup.filter((j) => j != x);
      }
    }

    if (emails.length === 0) {
      return res.status(400).json({ message: 'Insert at least one valid member to delete' })
    }
    while (emails.length >= data.members.length) {
      emails.pop();
      if (emails.length === 0) {
        return res.status(400).json({ message: 'Insert at least one valid member to delete' })
      }
    }

    // delete the email from data.members
    for (let email of emails) {
      data.members = data.members.filter((x) => x.email != email);
    }

    let gruppo = { "group": { "name": data.name, "members": data.members.map((x) => { return { email: x.email }; }) }, 'notInGroup': notInGroup, "membersNotFound": notFound }


    // update in database
    const k = await Group.updateOne(
      { name: oldName },
      { $set: { members: data.members } })

    return res.json({ data: gruppo, refreshedTokenMessage: res.locals.refreshedTokenMessage })

  } catch (err) {
    res.status(500).json(err.message)
  }
}


/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 400 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {

    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if (!verifyAuthRes.authorized) {
      return res.status(401).json({ error: verifyAuthRes.cause });
    }

    let email = req.body.email;
    let bool = false;
    if (email === undefined) {
      return res.status(400).json({ message: 'Missing attributes' })
    }
    email = email.trim();
    if (email === '') {
      return res.status(400).json({ message: `email cannot be empty` })
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: `email is not valid` })
    }

    // look for the user to be deleted
    const user = await User.findOne({ 'email': email });
    if (user === null) {
      return res.status(400).json({ message: 'User does not exist' });
    }
    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Admins cannot be deleted' });
    }
    let username = user.username;
    const n = await User.deleteOne({ 'email': email });

    const k = await transactions.deleteMany({ 'username': username });

    const j = await Group.findOne({ 'members.email': email })

    // i found a group with that email so i filter it
    if (j != null) {
      j.members = j.members.filter((x) => x.email != email);
      bool = true;
      const w = await Group.updateOne(
        { name: j.name },
        { $set: { members: j.members } })

      if(j.members.length === 0){
          const z = await Group.deleteOne({name : j.name});
      }
    }

    res.json({ data: { deletedTransactions: k.deletedCount, deletedFromGroup: bool }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    let name = req.body.name;
    if (name === undefined) {
      return res.status(400).json({ message: 'Missing attributes' })
    }
    name = name.trim();
    if (name === '') {
      return res.status(400).json({ message: `name cannot be empty` })
    }
    const verifyAuthRes = verifyAuth(req, res, { authType: "Admin" });
    if (!verifyAuthRes.authorized) {
      return res.status(401).json({ error: verifyAuthRes.cause });
    }
    // look for the group to be deleted

    const toDelete = await Group.findOneAndDelete({ name: name })
    if (toDelete === null) {
      return res.status(400).json({ message: 'Group does not exist' });
    }

    return res.json({ data: { message: 'Group deleted' }, refreshedTokenMessage: res.locals.refreshedTokenMessage })

  } catch (err) {
    res.status(500).json(err.message)
  }
}

