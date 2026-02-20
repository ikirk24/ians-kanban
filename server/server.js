import express from 'express';
import userRoutes from './routes/user.js';
import boardRoutes from './routes/board.js';
import columnRoutes from './routes/column.js';
import cardRoutes from './routes/card.js';
import { reqAuth } from './middleware/auth.middleware.js';
import cookieParser from 'cookie-parser';
const app = express(); 
const port = 8080;  

app.use(express.json())
app.use(cookieParser())
app.use('/user', userRoutes);
app.use('/board', boardRoutes);
app.use('/board/:boardId/column', columnRoutes);
app.use('/board/:boardId/column/:columnId/card', cardRoutes)

const store = [{
    "apples": "yum", 
    "squash": "aight",
    "beef": "yessir"
}]

app.listen(port, () => {
    console.log(`You are now listening live on port ${port}`)
})

app.get('/', reqAuth, (req, res) => {
    return res.json(store);
})