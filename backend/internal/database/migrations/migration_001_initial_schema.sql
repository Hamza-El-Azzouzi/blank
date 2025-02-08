CREATE TABLE
    users (
        id TEXT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        age INTEGER NOT NULL,
        gender VARCHAR(50) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
        CHECK (age BETWEEN 16 AND 120),
        CHECK (gender IN ('Male', 'Female'))
    );

CREATE TABLE
    messages (
        id TEXT PRIMARY KEY,
        user_id_sender TEXT NOT NULL,
        user_id_receiver TEXT NOT NULL,
        message TEXT NOT NULL,
        un_readed BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id_sender) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (user_id_receiver) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
        CHECK (user_id_sender != user_id_receiver),
        CHECK (un_readed IN (0, 1))
    );

CREATE TABLE
    posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE TABLE
    comments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE TABLE
    categories (
        id TEXT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE
    );

CREATE TABLE
    post_categories (
        post_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        PRIMARY KEY (post_id, category_id),
        FOREIGN KEY (post_id) REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE TABLE
    likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT,
        comment_id TEXT,
        react_type TEXT,
        created_at TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments (id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT unique_user_post_comment UNIQUE (user_id, post_id, comment_id),
        CHECK (
            (
                post_id IS NOT NULL
                AND comment_id IS NULL
            )
            OR (
                post_id IS NULL
                AND comment_id IS NOT NULL
            )
        ) CHECK (react_type IN ('like', 'dislike'))
    );

CREATE TABLE
    sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE CHECK (expires_at > created_at)
    );

CREATE INDEX idx_messages_user_id_sender ON messages (user_id_sender);

CREATE INDEX idx_messages_user_id_receiver ON messages (user_id_receiver);

CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);

CREATE INDEX idx_comments_post_id ON comments (post_id);

CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);

CREATE INDEX idx_likes_post_id ON likes (post_id);

CREATE INDEX idx_likes_comment_id ON likes (comment_id);

CREATE INDEX idx_posts_user_id ON posts (user_id);

CREATE INDEX idx_comments_user_id ON comments (user_id);