CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
    nickname VARCHAR(255),
    balance_usd NUMERIC(10, 2) DEFAULT 0,
    balance_eur NUMERIC(10, 2) DEFAULT 0,
    balance_gbp NUMERIC(10, 2) DEFAULT 0,
    balance_chf NUMERIC(10, 2) DEFAULT 0,
    balance_pln NUMERIC(10, 2) DEFAULT 0
);
