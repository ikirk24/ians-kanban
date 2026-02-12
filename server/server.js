import express from 'express';
import userRoutes from './routes/user.js';
const app = express(); 
const port = 8080;  
app.use(express.json())
app.use('/user', userRoutes);

const store = [{
    "apples": "yum", 
    "squash": "aight",
    "beef": "yessir"
}]

app.listen(port, () => {
    console.log(`You are now listening live on port ${port}`)
})

app.get('/', (req, res) => {
    res.json(store);
})