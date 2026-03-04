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
       INSERT INTO users (username, password_hash)
       VALUES (?, ?)  
       `, [username, password])
       const id = result.insertId;
       const user = await getOneUser(id);
       return user;
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
        INSERT INTO boards (user_id, title, description, status)
        VALUES (?, ?, ?, 'active')
        `, [user_id, title, description])
        const id = result.insertId;
       const board = await getBoardById(user_id, id);
       return board;
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



//Column DB Functions

export async function createColumn (user_id, board_id, title) {
    const [result] = await db.query(`
        INSERT INTO columns (board_id, title, position)
        SELECT b.id, ?, COALESCE(MAX(c.position), 0) + 1
        FROM boards b 
        LEFT JOIN columns c ON c.board_id = b.id
        WHERE b.id = ? AND b.user_id = ?
        GROUP BY b.id
        `, [title, board_id, user_id])
        return result;
}

export async function autoColumnCreate (user_id, board_id) {
    const [result] = await db.query(`
        INSERT INTO columns (board_id, title, position)
        SELECT b.id, t.title, t.position
        FROM boards b 
        JOIN (
            SELECT 'To Do' AS title, 1 AS position
            UNION ALL 
            SELECT 'Doing', 2
            UNION ALL 
            SELECT 'Done', 3
        ) t
        WHERE b.id = ? AND b.user_id = ?
            `, [board_id, user_id])
        return result
}

export async function getColumnsFromBoard (user_id, board_id) {
    const [rows] = await db.query(`
        SELECT c.*
        FROM columns c
        JOIN boards b ON b.id = c.board_id
        WHERE c.board_id = ? AND b.user_id = ?
        ORDER BY c.position ASC
        `, [board_id, user_id])
        return rows
}

export async function updateColumn(board_id, id, title, newPosition) {
   
    const conn = await db.getConnection()

    //Get column
try {

    await conn.beginTransaction();

    const [column] = await conn.query(`
        SELECT title, position
        FROM columns
        WHERE board_id = ? AND id = ?
        `, [board_id, id])


    //See if column is moving up or moving down and shift the other columns accordingly 
    if (!column.length) {
        await conn.rollback()
        return { affectedRows: 0 }
        };

    const oldPosition = column[0].position 
    
    if (newPosition !== null && newPosition !== oldPosition) {

        await conn.query(`
            UPDATE columns 
            SET position = 0
            WHERE board_id = ? AND id = ? 
            `, [board_id, id]);

        if (newPosition < oldPosition) {
            await conn.query(`
                UPDATE columns 
                SET position = position + 1
                WHERE board_id = ? 
                AND position >= ? 
                AND position < ?
                ORDER BY position DESC
                `, [board_id, newPosition, oldPosition])
        } else {
            await conn.query(`
                UPDATE columns 
                SET position = position - 1
                WHERE board_id = ? 
                AND position <= ?
                AND position > ?
                ORDER BY position ASC
                `, [board_id, newPosition, oldPosition])
        }
    }

    //Run update

    await conn.query(`
        UPDATE columns 
        SET position = ?
        WHERE board_id = ? AND id = ?
        `, [newPosition, board_id, id])
    
     const [result] = await conn.query(`
        UPDATE columns 
        SET title = COALESCE(?, title)
        WHERE board_id = ? AND id = ? 
        `, [title ?? null, board_id, id])

    await conn.commit()
    return result

    } catch (err){
        await conn.rollback() 
        throw err;
    } finally {
        conn.release()
    }
}

export async function deleteColumn (user_id, board_id, column_id) {

    const conn = await db.getConnection() 
   
    try {
        await conn.beginTransaction();

        const [column] = await conn.query(`
            SELECT c.position
            FROM columns c
            JOIN boards b ON b.id = c.board_id
            WHERE c.board_id = ? AND c.id = ? AND b.user_id = ?
        `, [board_id, column_id, user_id]);

        if(!column.length) {
            await conn.rollback();
            return { affectedRows: 0 }
        }

        const deletedPosition = column[0].position

        const [result] = await conn.query(`
        DELETE c
        FROM columns c
        JOIN boards b ON b.id = c.board_id
        WHERE c.board_id = ? AND b.user_id = ? AND c.id = ? 
        `, [board_id, user_id, column_id])

        if (result.affectedRows === 0) {
            await conn.rollback();
            return result;
        }

        await conn.query(`
            UPDATE columns 
            SET position = position - 1
            WHERE board_id = ? and position > ? 
            ORDER BY position ASC 
            `, [board_id, deletedPosition]);

        await conn.commit();
        return result;
    } catch(err) {
        conn.rollback();
        throw err;
    } finally {
        conn.release()
    }
    
}

//CARDS DB FUNCTIONS 

export async function createCard (user_id, board_id, column_id, title, description ) {

    const [result] = await db.query(`
        INSERT INTO cards (board_id, column_id, title, description, position)
        SELECT b.id, c.id, ?, ?, COALESCE(MAX(cards.position), 0) + 1
        FROM boards b 
        JOIN columns c ON c.id = ? AND c.board_id = b.id 
        LEFT JOIN cards ON cards.column_id = c.id
        WHERE b.id = ? AND b.user_id = ? 
        GROUP BY b.id, c.id
        `, [title, description, column_id, board_id, user_id])
        return result;
}

export async function getCard (user_id, board_id, column_id, card_id) {

    const [rows] = await db.query(`
        SELECT cards.title, cards.description 
        FROM cards 
        JOIN boards b ON b.id = cards.board_id
        JOIN columns c ON c.id = cards.column_id
        WHERE cards.board_id = ? AND b.user_id = ? AND cards.column_id = ? AND cards.id = ? 
        `, [board_id, user_id, column_id, card_id])
    
        return rows[0];
}

export async function getCardByColumn (user_id, board_id, column_id) {

    const [rows] = await db.query(`
        SELECT cards.position, cards.id, cards.title, cards.description
        FROM cards
        JOIN boards b ON b.id = cards.board_id
        JOIN columns c ON c.id = cards.column_id
        WHERE cards.board_id = ? AND b.user_id = ? AND cards.column_id = ?
        ORDER BY cards.position ASC
        `, [board_id, user_id, column_id])

        return rows;
}

export async function updateCard (user_id, board_id, column_id, id, title, description, newPosition) {

    const conn = await db.getConnection();
    
    try {

        await conn.beginTransaction();

        const [card] = await conn.query(`
            SELECT cards.title, cards.description, cards.position 
            FROM cards 
            JOIN boards b ON b.id = cards.board_id
            WHERE b.user_id = ? AND cards.board_id = ? AND cards.column_id = ? AND cards.id = ?
             `, [user_id, board_id, column_id, id])

        if (!card.length) {
            await conn.rollback() 
            return { affectedRows: 0 }
        };

        const oldPosition = card[0].position 

        if (newPosition !== null && newPosition !== oldPosition) {

            await conn.query(`
                UPDATE cards
                SET position = 0
                WHERE board_id = ? AND column_id = ? AND id = ? 
                `, [board_id, column_id, id])

            if (newPosition < oldPosition) {
                await conn.query(`
                    UPDATE cards 
                    SET position = position + 1
                    WHERE column_id = ?
                    AND position >= ?
                    AND position < ?
                    ORDER BY position DESC 
                    `, [ column_id, newPosition, oldPosition])
            } else {
                await conn.query(`
                    UPDATE cards 
                    SET position = position - 1
                    WHERE column_id = ? 
                    AND position <= ?
                    AND position > ?
                    ORDER BY position ASC 
                    `, [board_id, newPosition, oldPosition])
            }
        }

        await conn.query(` 
            UPDATE cards
            SET position = ? 
            WHERE column_id = ? AND id = ?
            `, [newPosition, column_id, id])

        const [result] = await conn.query(` 
            UPDATE cards 
            SET 
            title = COALESCE(?, title),
            description = COALESCE(?, description)
            WHERE column_id = ? AND id = ?
            `, [title ?? null, description ?? null, column_id, id])
            
            await conn.commit() 
            return result

        } catch (err) {
            await conn.rollback() 
            throw err;
        } finally {
            conn.release() 
        }
}

export async function deleteCard (user_id, board_id, column_id, card_id){

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [card] = await conn.query(`
            SELECT cards.position
            FROM cards
            JOIN boards b ON b.id = cards.board_id
            JOIN columns c ON c.id = cards.column_id 
            WHERE cards.id = ? AND cards.column_id = ? AND cards.board_id = ? AND b.user_id = ?
            `, [card_id, column_id, board_id, user_id])
        
        if (!card.length) {
            await conn.rollback();
            return { affectedRows: 0}
        }

        const deletedPosition = card[0].position

        const [result] = await conn.query(`
            DELETE cards
            FROM cards 
            JOIN boards b ON b.id = cards.board_id 
            JOIN columns c ON c.id = cards.column_id
            WHERE cards.id = ? AND cards.column_id = ? AND cards.board_id = ? AND b.user_id = ? 
            `, [card_id, column_id, board_id, user_id])

        await conn.query(`
            UPDATE cards 
            JOIN boards b ON b.id = cards.board_id
            SET cards.position = cards.position - 1 
            WHERE cards.column_id = ? AND cards.board_id = ? AND b.user_id = ? AND cards.position > ?
            `, [column_id, board_id, user_id, deletedPosition])
        
        await conn.commit();
        return result
    } catch(err) {
        conn.rollback(); 
        throw err;
    } finally {
        conn.release();
    }
}