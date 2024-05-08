const sqlite3 = require("sqlite3");
const bcrypt = require('bcrypt');
const chalk = require('chalk')
const saltRounds = 10;
//I might need this database stuff later.
class CoreUtils {
    constructor() {
        this.db = new sqlite3.Database('sys.db');
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    }
    register(user, password, email) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    const sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
                    this.db.run(sql, [user, hash, email], function(err) {
                        if (err) {
                            if (err.code === 'SQLITE_CONSTRAINT') {
                                reject('Username or email already taken');
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve("Registration successful.");
                        }
                    });
                }
            });
        });
    }
    login(user, password) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE username = ?";
            this.db.get(sql, [user], function(err, row) {
                if (err) {
                    reject(err);
                } else {
                    if(row) {
                        bcrypt.compare(password, row.password, function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                if(result) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            }
                        });
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }
    DBlist() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT id, username, email, created_at FROM users", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    DBclear() {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM users";
            this.db.run(sql, [], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve("Database cleared.");
                }
            });
        });
    }
}

module.exports = CoreUtils;