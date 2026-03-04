import express from 'express';
import { createColumn, deleteColumn, getColumnsFromBoard, updateColumn} from '../db.js';
import { reqAuth } from '../middleware/auth.middleware.js';
const router = express.Router({ mergeParams: true})

//Create Column Route

router.post('/', reqAuth, async (req, res) => {
    const boardId = req.params.boardId
    const {title} = req.body
    try {
        if (!title) {
            return res.status(400).json({message: "User did not fill out column correctly"})
        }
        const result = await createColumn(req.user.id, boardId, title);
        
        if (result.affectedRows === 0 ) {
            return res.status(404).json({message: "Board not found"})
        }
        
        return res.status(200).json(({message: "Column created successfully", result}))
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})


//Read Column Route

router.get('/', reqAuth, async (req, res) => {
    const boardId = req.params.boardId

    try {
        const columns = await getColumnsFromBoard(req.user.id, boardId);

        return res.status(200).json({message: `Reading all columns from board number ${boardId} `, columns})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})



//Update Column Route 

router.put('/:columnId',reqAuth, async (req,res) => {
    const columnId = Number(req.params.columnId);
    const { title, position} = req.body || {}
    const boardId = Number(req.params.boardId);
    
    try {
        const trimTitle = title?.trim() || null;
        const newPosition = Number(position) || null
        const result = await updateColumn(boardId, columnId, trimTitle, newPosition)
        return res.status(200).json({message: `Board number ${boardId} successfully updated `, result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})


//Delete Column Route 

router.delete('/:columnId', reqAuth, async (req,res) => {
    const columnId = Number(req.params.columnId)
    const boardId = Number(req.params.boardId)

    try {
        const result = await deleteColumn(req.user.id, boardId, columnId);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Column not found"})
        }

        return res.status(200).json({message: "Column was deleted ", result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

export default router;