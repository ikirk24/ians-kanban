import express from 'express' ;
import bcrypt from 'bcrypt';
const router = express.Router();
import {createUser, getOneUser } from '../db.js';



//Hash Password function

async function hashPassword (password) {

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

//Sign Up Route

router.post('/', async (req, res)=> {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({message: "User did not fill out sign up form correctly"})
    }

    try {
        const password_hashed = await hashPassword(password);
        const user = await createUser(username, password_hashed);

        res.status(201).json({message: "User was created ", user})

    } catch (err) {
        res.status(500).json({message: err})
    }
})

router.get('/', (req,res) => {
    res.send({message: "Request granted"})
})

export default router;