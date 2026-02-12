import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})


//Create a user DB FUNCTION 
export async function createUser(username, password) {
    
    const [result] = await db.query(`
       INSERT INTO users (id, username, password_hash)
       VALUES (id, ?, ?)  
       `, [username, password])
       const id = result.id;
       getOneUser(id);
       
}

export async function getOneUser(id) {
    
    const [rows] = await db.query(`
        SELECT id, username, created_at
        FROM users 
        WHERE id = ?
        `, [id])
    return rows;
    
}

export async function getUsername(username) {
    const [rows] = await db.query(`
        SELECT id, username, password_hash
        FROM users
        WHERE username = ?
        `, [username])
        return rows[0];
}