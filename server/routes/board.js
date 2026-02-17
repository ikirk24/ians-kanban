import express from 'express';
import { createBoard, getBoardsFromUser, getBoardById, updateBoard, deleteBoard } from '../db.js';
import { reqAuth } from '../middleware/auth.middleware.js';

const router = express.Router();


//Create Board Route

router.post('/', reqAuth, async (req, res) => {

    const {title, description} = req.body;

    if(!title || !description) {
        return res.status(400).json({message: "User did not fill out information correctly"})
    }

    try {
        const result = await createBoard(req.user.id, title, description)
        return res.status(201).json({message: "Board created successfully ", result})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

//Get all Boards from a single user 
router.get('/', reqAuth, async (req,res) => {

    try {
        const result = await getBoardsFromUser(req.user.id);
        return res.status(200).json({message: `Successfully showing all boards by user ${req.user.id} `, result})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

//Get a board by its id route 
router.get('/:id', reqAuth, async (req,res) => {

    try {
        const result = await getBoardById(req.user.id, req.params.id);
        if (!result || result.length === 0) {
            return res.status(404).json({message: "Board not found"})
        }
        return res.status(200).json({message: `Successfully showing board number ${req.params.id} for user ${req.user.id} `, result})
    } catch (err){
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

//Update a board by its id route
router.put('/:id', reqAuth, async (req, res) => {
    
        const {title, description, status} = req.body || {};   
        
    try {
        const trimTitle = title?.trim() || null;
        const trimDescription = description?.trim() || null;
        let realStatus = null;
        if(status === "active" || status === "completed") {
            realStatus = status
        } 

        const result = await updateBoard(
            req.params.id,
            req.user.id,
            trimTitle, 
            trimDescription,
            realStatus
            )

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Board not found"})
        }

        return res.status(200).json({message: `User ${req.user.id} has successfully updated board number ${req.params.id} `, result})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: err.message});
    }
})

//Delete a board by its id route

router.delete('/:id', reqAuth, async (req,res) => { 

    try {
        const result = await deleteBoard(req.params.id, req.user.id);

        if(result.affectedRows === 0) {
            return res.status(404).json({message: "Board not found"})
        }

        return res.status(200).json({message: "Board successfully deleted ", result})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

export default router