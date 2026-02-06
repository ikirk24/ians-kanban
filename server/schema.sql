

CREATE DATABASE kanban; 

USE kanban; 

CREATE TABLE users(
    id INT AUTO_INCREMENT NOT NULL, 
    username VARCHAR(255) UNIQUE NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

CREATE TABLE boards(
    id INT AUTO_INCREMENT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, 
    `description` TEXT, 
    `status` ENUM('active','completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_boards PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE columns(
    id INT AUTO_INCREMENT NOT NULL, 
    board_id INT NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,      
    CONSTRAINT pk_columns PRIMARY KEY (id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE cards(
    id INT AUTO_INCREMENT NOT NULL,
    board_id INT NOT NULL,
    column_id INT NOT NULL,
    title VARCHAR(255) NOT NULL ,
    `description` TEXT,
    position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_cards PRIMARY KEY (id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE 

);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_cards_board_id ON cards(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);

CREATE UNIQUE INDEX uq_columns_board_position ON columns(board_id, position);
CREATE UNIQUE INDEX uq_cards_column_position ON cards(column_id, position);
