import express, { Router } from 'express';
import { createCard, deleteCard, getCard, getCardByColumn, updateCard } from '../db.js';
import { reqAuth } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true})

//create card route

router.post('/', reqAuth, async (req, res) => {

    const {title, description} = req.body;
    const board_id = req.params.boardId
    const column_id = req.params.columnId
    const cleanTitle = title?.trim() || null;
    const cleanDescription = description?.trim() || null

    try {
        if(!cleanTitle) {
            return res.status(400).json({message: "Error, user did not fill out card correctly"})
        }
        const result = await createCard(req.user.id, board_id, column_id, cleanTitle, cleanDescription);
        return res.status(201).json({message: "New card created! ", result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

// Get one card route

router.get('/:cardId', reqAuth, async (req, res) => {
    const board_id = req.params.boardId
    const column_id = req.params.columnId
    const card_id = req.params.cardId

    try {
        const result = await getCard(req.user.id, board_id, column_id, card_id);

       if (result.affectedRows === 0 ) {
        return res.status(404).json({message: "Cannot find card"})
       }

        return res.status(200).json({message: `Reading card ${card_id} `, result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

router.get('/', reqAuth, async (req, res) => {
    const board_id = req.params.boardId
    const column_id = req.params.columnId

    try {
        const result = await getCardByColumn(req.user.id, board_id, column_id);

       if (result.affectedRows === 0 ) {
        return res.status(404).json({message: "Cannot find column"})
       }

        return res.status(200).json({message: `Reading cards in column ${column_id} `, result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }
})

router.put('/:cardId', reqAuth, async (req,res) => {
    const board_id = req.params.boardId
    const column_id = req.params.columnId
    const card_id = req.params.cardId

    const {title, description, position} = req.body || {} 

    const cleanTitle = title?.trim() || null;
    const cleanDescription = description?.trim() || null;
    const cleanPosition = Number(position) || null 

    try {
        const result = updateCard(req.user.id, board_id, column_id, card_id, cleanTitle, cleanDescription, cleanPosition)

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Card not found"})
        }

        return res.status(200).json({message: `Card ${card_id} successfully updated `, result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }

})

router.delete('/:cardId', reqAuth, async (req,res) => {
    const board_id = req.params.boardId
    const column_id = req.params.columnId
    const card_id = req.params.cardId

    try {
        const result = deleteCard(req.user.id, board_id, column_id, card_id)

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Card not found"})
        }

        return res.status(200).json({message: `Card ${card_id} successfully deleted `, result})
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: err.message})
    }

})

export default router