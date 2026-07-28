import express from 'express';
import userRoutes from './routes/user.js';
import boardRoutes from './routes/board.js';
import columnRoutes from './routes/column.js';
import cardRoutes from './routes/card.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); 

const app = express(); 
const port = process.env.PORT || 8080; 

const allowedOrigins = [
    "http://localhost:5173", 
    process.env.CLIENT_URL
].filter(Boolean);

console.log("NODE_ENV:", process.env.NODE_ENV);
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback (null, true);
        }
        return callback(new Error("Origin not allowed by CORS"));
     },
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/board', boardRoutes);
app.use('/board/:boardId/column', columnRoutes);
app.use('/board/:boardId/column/:columnId/card', cardRoutes)


app.listen(port, () => {
    console.log(`You are now listening live on port ${port}`)
})

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Kanban API is running"
    });
});