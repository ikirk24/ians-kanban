const express = require('express');

const app = express(); 
const port = 8080; 


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