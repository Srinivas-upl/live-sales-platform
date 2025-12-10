const { promisifyDbOperation } = require('../config/database');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.password = data.password;
    this.company_name = data.company_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findById(id, db) {
    try {
      return await promisifyDbOperation(db, 'get', 'SELECT * FROM users WHERE id = ?', [id]);
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async findByEmail(email, db) {
    try {
      return await promisifyDbOperation(db, 'get', 'SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async create(userData, db) {
    try {
      const result = await promisifyDbOperation(db, 'run',
        'INSERT INTO users (first_name, last_name, email, password, company_name) VALUES (?, ?, ?, ?, ?)',
        [userData.first_name, userData.last_name, userData.email, userData.password, userData.company_name]
      );

      const user = await User.findById(result.lastID, db);
      return new User(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
