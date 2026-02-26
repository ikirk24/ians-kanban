import express from 'express';
import userRoutes from './routes/user.js';
import boardRoutes from './routes/board.js';
import columnRoutes from './routes/column.js';
import cardRoutes from './routes/card.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express(); 
const port = 8080;  

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/board', boardRoutes);
app.use('/board/:boardId/column', columnRoutes);
app.use('/board/:boardId/column/:columnId/card', cardRoutes)


app.listen(port, () => {
    console.log(`You are now listening live on port ${port}`)
})

