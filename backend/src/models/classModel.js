const db = require('../config/db'); 

const getClassesForStudent = (studentId, callback) => {
    const sql = `
        SELECT c.*,
            EXISTS(
                SELECT 1 FROM enrollments e
                WHERE e.class_id = c.id AND e.student_id = ?
            ) AS is_enrolled
        FROM classes c
    `;
    db.query(sql, [studentId], callback);
};

const getClassesForTeacher = (teacherId, callback) => {
    const sql = `SELECT c.*, u.name AS teacher_name
                FROM classes c 
                JOIN users u
                ON c.teacher_id = u.id
                WHERE c.teacher_id = ?
    `;
    db.query(sql, [teacherId], callback);
};

const getAllClasses = (callback) => {
    const sql = `SELECT * FROM classes`;
    db.query(sql, callback);
};

module.exports = { getClassesForStudent, getClassesForTeacher, getAllClasses };