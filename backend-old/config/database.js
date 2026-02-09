const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../', process.env.DB_TYPE === 'sqlite' ? 'lspd.db' : 'database.sqlite');

// Helper function to create database connection
function createDbConnection() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database at:', DB_PATH);
  });
}

// Promise wrapper for database operations
function promisifyDbOperation(db, method, ...args) {
  return new Promise((resolve, reject) => {
    db[method](...args, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result || this);
      }
    });
  });
}

module.exports = {
  createDbConnection,
  promisifyDbOperation,
  DB_PATH
};
