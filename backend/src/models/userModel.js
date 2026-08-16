const db = require('../config/db'); 

const findRoleById = (id, callback) => {
    const sql = `SELECT id, role FROM users WHERE id = ?`;
    db.query(sql, [id], callback);
};

module.exports = { findRoleById };
