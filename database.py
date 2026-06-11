import sqlite3
import os

DB_PATH = "wasify.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_user(username, name, password_hash):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, name, password_hash) VALUES (?, ?, ?)", (username, name, password_hash))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        # Username already exists
        return False
    finally:
        conn.close()

def get_all_users():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username, name, password_hash FROM users")
    users = cursor.fetchall()
    conn.close()
    
    credentials = {"usernames": {}}
    for user in users:
        username, name, password_hash = user
        credentials["usernames"][username] = {
            "name": name,
            "password": password_hash
        }
    return credentials
