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


//USER DB FUNCTIONS

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
    return rows[0];
    
}

export async function getUsername(username) {
    const [rows] = await db.query(`
        SELECT id, username, password_hash
        FROM users
        WHERE username = ?
        `, [username])
        return rows[0];
}

export async function updateUser (id, username, password_hash) {

    const safeUsername = username && username.trim() ? username : null;

    const [result] = await db.query(`
        UPDATE users 
        SET 
            username = COALESCE(?, username),
            password_hash = COALESCE(?, password_hash)
        WHERE id = ?
        `, [safeUsername, password_hash ?? null, id])
        return result;
}

export async function deleteUser(id) {
    const [result] = await db.query(`
        DELETE FROM users 
        WHERE id = ?
        `, [id])
        return result;
}



//BOARD DB FUNCTIONS 

export async function createBoard (user_id, title, description) {
    const [result] = await db.query(`
        INSERT INTO boards (id, user_id, title, description, status)
        VALUES (id, ?, ?, ?, "active")
        `, [user_id, title, description])
        const id = result.id;
        getBoardById(user_id, id);
    }

export async function getBoardsFromUser (user_id) {
    const [rows] = await db.query(`
        SELECT * 
        FROM boards 
        WHERE user_id = ?
        `, [user_id])
        return rows;
}

export async function getBoardById(user_id, id) {
    const [rows] = await db.query(`
        SELECT * 
        FROM boards 
        WHERE user_id = ? AND id = ?
        `, [user_id, id])
        return rows[0]
}

export async function updateBoard (id, user_id, title, description, status) {
    const [result] = await db.query(`
        UPDATE boards
        SET 
            title = COALESCE(?, title),
            description = COALESCE(?, description), 
            status = COALESCE(?, status)
        WHERE id = ? AND user_id = ?
        `, [title ?? null, description ?? null, status ?? null, id, user_id])
        return result;
}

export async function deleteBoard (id, user_id) {
    const [result] = await db.query(` 
        DELETE FROM boards 
        WHERE id = ? AND user_id = ?
        `, [id, user_id])
        return result;
    }