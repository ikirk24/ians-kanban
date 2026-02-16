import express from 'express';
import { createBoard, getBoardsFromUser } from '../db.js';
import { reqAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', reqAuth, async (req, res) => {

    const {title, description} = req.body;

    if(!title || !description) {
        res.status(400).json({message: "User did not fill out information correctly"})
    }

    try {
        const board = await createBoard(req.user.id, title, description)
        res.status(201).json({message: "Board created successfully ", board})
    } catch (err) {
        res.status(500).json({message: err})
    }
})

router.get('/', reqAuth, async (req,res) => {

    try {
        const boards = await getBoardsFromUser(req.user.id);
        res.status(200).json({message: `Successfully showing all boards by user ${req.user.id} `, boards})
    } catch (err) {
        res.status(500).json({message: err})
    }
})

export default router