const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');

exports.enroll = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id 
    const {name} = req.body

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Class name is required" })
    }


    const sql = `
    INSERT INTO enrollments (class_id, student_id, enrolled_at)
    SELECT id, ?, NOW()
    FROM classes
    WHERE name = ?;
    `
    db.query(sql, 
        [student_id, name],
        (err, result) => {
            if (err) return handleDbError(res, err);
            res.status(201).json({ message: "Enroll successfully" })
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
            res.status(201).json({ message: "Unenroll successfully" })
    })


    
}

exports.listtStudents = (
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
