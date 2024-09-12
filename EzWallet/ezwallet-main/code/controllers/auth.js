import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { verifyAuth } from './utils.js';

/**
 * Register a new user in the system
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


export const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if (username === undefined || email === undefined || password === undefined) {
            return res.status(400).json({ error: "Missing attributes" });
        }
        username = username.trim();
        email = email.trim();
        password = password.trim();
        if (username === "" || email === "" || password === "") {
            return res.status(400).json({ error: "One of the attributes is empty" });
        }
        if (!isEmailValid(email)) {
            return res.status(400).json({ error:  "Email not valid format" });
        }
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) return res.status(400).json({ error: "you are already registered" });

        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) return res.status(400).json({ error: "email already registered" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(200).json({ data: { message: "User added successfully" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Register a new user in the system with an Admin role
  - Request Body Content: An object having attributes `username`, `email` and `password`
  - Response `data` Content: A message confirming successful insertion
  - Optional behavior:
    - error 400 is returned if there is already a user with the same username and/or email
 */
export const registerAdmin = async (req, res) => {

    try {
        let { username, email, password } = req.body
        if (username === undefined || email === undefined || password === undefined) {
            return res.status(400).json({ error: "Missing attributes" });
        }
        username = username.trim();
        email = email.trim();
        password = password.trim();
        if (username === "" || email === "" || password === "") {
            return res.status(400).json({ error: "One of the attributes is empty" });
        }
        if (!isEmailValid(email)) {
            return res.status(400).json({ error: "Email not valid format" });
        }
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) return res.status(400).json({ error: "you are already registered" });

        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) return res.status(400).json({ error: "email already registered" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin"
        });
        res.status(200).json({ data: { message: "User added successfully" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

/**
 * Perform login 
  - Request Body Content: An object having attributes `email` and `password`
  - Response `data` Content: An object with the created accessToken and refreshToken
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - error 400 is returned if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    try {
        let { email, password } = req.body
        if (email === undefined || password === undefined) {
            return res.status(400).json({ error: "Missing attributes" });
        }
        email = email.trim();
        password = password.trim();
        if (email === "" || password === "") {
            return res.status(400).json({ error: "One of the attributes is empty" });
        }
        if (!isEmailValid(email)) {
            return res.status(400).json({ error: "Email not valid format" });
        }

        const cookie = req.cookies
        if (cookie && cookie.accessToken !== undefined) return res.status(200).json({ error: "you are already logged in" })
        const existingUser = await User.findOne({ email: email })
        if (!existingUser) return res.status(400).json({ error: "please you need to register" })


        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) return res.status(400).json({ error: 'wrong credentials' })
        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '1h' })
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign({
            email: existingUser.email,
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.ACCESS_KEY, { expiresIn: '7d' })
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken
        const savedUser = await existingUser.save()
        res.cookie("accessToken", accessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: "localhost", path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.status(200).json({ data: { accessToken: accessToken, refreshToken: refreshToken } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/**
 * Perform logout
  - Auth type: Simple
  - Request Body Content: None
  - Response `data` Content: A message confirming successful logout
  - Optional behavior:
    - error 400 is returned if the user does not exist
 */
export const logout = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(400).json({ error: "You have to be logged in to log out" })
        const user = await User.findOne({ refreshToken: refreshToken })
        if (user === null) return res.status(400).json({ error: 'user not found' })
        user.refreshToken = null
        res.cookie("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        res.cookie('refreshToken', "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
        const savedUser = await user.save()
        res.status(200).json({ data: { message: "User logged out" } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
