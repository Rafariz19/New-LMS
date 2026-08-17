const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');
const bcrypt = require('bcrypt');

exports.enroll = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id 

    const {name, code} = req.body

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Class name is required" })
    }
    if (!code || !code.trim()) {
        return res.status(400).json({ message: "Class code is required" });
    }

    const sql = `SELECT id, code FROM classes WHERE name = ?;`
    db.query(sql, 
        [student_id, code],
        async (err, rows) => {
            if (err) return handleDbError(res, err);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            const classData = rows[0]

            try {
                const isMatch = await bcrypt.compare(
                    code,
                    classData.code
                )
                if (!isMatch) {
                    return res.status(401).json({
                        message: "Invalid code"
                    })
                }

                const sqlEnroll = `
                    INSERT INTO enrollments (class_id, student_id, enrolled_at)
                    VALUES (?, ?, NOW());
                `;
                db.query(sqlEnroll, [classData.id, student_id], (err2, result) => {
                    if (err2) return handleDbError(res, err2);
                    return res.status(201).json({ message: "Enroll successfully" });
                });

                return res.status(201).json({ message: "Enroll successfully" });
            } catch (compareErr) {
            return handleDbError(res, compareErr);

        }
        } 
    )
    
}

exports.unenroll = (
    req,
    res
) => {
    const class_id = req.params.id

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id
    const sql = `DELETE FROM enrollments WHERE class_id = ? AND student_id = ?;`

    db.query(sql, 
        [class_id, student_id],
    (err, result) => {
        if (err) return handleDbError(res, err);
            res.status(200).json({ message: "Unenroll successfully" })
    })


    
}

exports.listStudents = (
    req,
    res
) => {
    const class_id = req.params.id
    const sql = `
    SELECT 
        u.id AS student_id, 
        u.name, 
        u.email, 
        s.nim, 
        s.jurusan, 
        e.enrolled_at
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN users u ON s.student_id = u.id
    WHERE e.class_id = ?;
    `

    db.query(sql, 
        [class_id],
    (err, result) => {
        if (err) return handleDbError(res, err);
        return res.status(200).json({ success: true, data: result });
    })
}
