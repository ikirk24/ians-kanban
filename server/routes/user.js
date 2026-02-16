import express from 'express' ;
import bcrypt from 'bcrypt';
import {createUser, getOneUser, getUsername, updateUser, deleteUser } from '../db.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { reqAuth } from '../middleware/auth.middleware.js';
dotenv.config()

const router = express.Router();

//Hash Password function

async function hashPassword (password) {

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

//Sign Up Route

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "User did not fill out sign up form correctly"})
    }

    try {
        const password_hashed = await hashPassword(password);
        const user = await createUser(username, password_hashed);

        return res.status(201).json({message: "User was created ", user})

    } catch (err) {
        return res.status(500).json({message: err})
    }
})


//Login route

router.post('/', async (req, res) => {
    const {username, password} = req.body; 

    if (!username || !password) {
        return res.status(400).json({message: "Missing username or password"})
    }

    const user = await getUsername(username);
    
    if(!user) {
        return res.status(404).json({message: "Username or password is incorrect"})
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if(!isMatch) {
        return res.status(404).json({message: "Username or password is incorrect"})
    }

    const accessToken = jwt.sign(
        { id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'2hr'})

    res.cookie("accessToken", accessToken, {
        httpOnly: true, 
        sameSite: "lax",
        secure: false,
        path:"/",
        maxAge: 1000 * 60 * 60 * 2
    })

    return res.status(200).json({
        message: "User successfully logged in!",
        user: user.username
    })
})

// Update route 

router.put('/', reqAuth, async(req, res) => {
    const {username, password} = req.body || {};

    try {
        const trimUsername = username?.trim() || null;
        const trimPassword = password?.trim() || null;
        const updatedPassword = trimPassword ? await hashPassword(trimPassword) : null;
        const result = await updateUser(req.user.id, trimUsername, updatedPassword);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "User not found"})
        }

        return res.status(200).json({message: `User ${req.user.id} has been updated `, result})
    } catch (err) {
        console.error(err)
        return res.status(500).json({message: err.message});
    }
})

//Delete route

router.delete('/', reqAuth, async (req, res) => {

    try {
        const result = await deleteUser(req.user.id);
         if(result.affectedRows === 0) {
            return res.status(404).json({message: "User not found"})
        }
        res.clearCookie("accessToken");
        return res.status(200).json({message:`User ${req.user.id} has been deleted `, result})

       
    } catch(err){
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

// Logout route 
router.post('/logout', reqAuth, async (req, res) => {
    res.clearCookie("accessToken")
    return res.status(200).json({message: "User has been logged out"})
})

router.get('/', (req,res) => {
    return res.send({message: "Request granted"})
})

export default router;