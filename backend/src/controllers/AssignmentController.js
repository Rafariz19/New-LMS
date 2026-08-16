const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');

exports.store = (
    req,
    res
) => {
    const {title, deadline} = req.body
    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" })
    }
    if (!deadline || !deadline.trim()) {
        return res.status(400).json({ message: "Deadline is required" })
    }

    const class_id = req.params.id;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id = req.user.id;
    const sql = `
    INSERT INTO assignments (
        title, class_id, deadline
    )
    SELECT
        ?,
        id,
        ?
    FROM classes
    WHERE id = ?
        AND teacher_id = ?;
    `
    db.query(sql, 
        [title, deadline, class_id, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err);

            if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Class not found or you don't have access" });
        }
            res.status(201).json({ message: "Assignment created successfully" })
        }
    )
}

exports.index = (
    req,
    res
) => {
    const class_id = req.params.id
    const student_id = req.user.id
    const sql = `SELECT id FROM enrollments WHERE class_id = ? AND student_id = ?;`
    db.query(sql, 
        [class_id, student_id],
    (err, result) => {
        if (err) return handleDbError(res, err);
        res.status(201).json({ data : result})
    })
    
}

exports.show = (
    req,
    res
) => {
    const {} = req.body
    // ready to implement show logic
}

exports.update = (
    req,
    res
) => {
    const {} = req.body
    // ready to implement update logic
}

exports.destroy = (
    req,
    res
) => {
    const {} = req.body
    // ready to implement destroy logic
}
