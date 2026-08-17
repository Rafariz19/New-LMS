const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');

exports.store = (
    req,
    res
) => {
    const {title, deadline} = req.body

    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required!" })
    }
    if (!deadline || !deadline.trim()) {
        return res.status(400).json({ message: "Deadline is required!" })
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
    const class_id = req.params.id;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id;
    const enrollmentSql = `
        SELECT id
        FROM enrollments
        WHERE class_id = ? AND student_id = ?;
    `;

    db.query(enrollmentSql, [class_id, student_id], (err, enrollmentResult) => {
        if (err) return handleDbError(res, err);

        if (enrollmentResult.length === 0) {
            return res.status(403).json({
                message: "Student is not enrolled in this class"
            });
        }

        db.query(
            `SELECT * FROM assignments WHERE class_id = ? ORDER BY deadline DESC;`,
            [class_id],
            (assignmentErr, assignmentResult) => {
                if (assignmentErr) return handleDbError(res, assignmentErr);
                return res.status(200).json({ success: true, data: assignmentResult });
            }
        );
    });
};

exports.show = (
    req,
    res
) => {
    const class_id = req.params.id
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id = req.user.id

    const sql = `SELECT id FROM classes WHERE id = ? AND teacher_id = ?;`
    const showSql = `
    SELECT
        a.*,
        c.teacher_id,
        c.id
    FROM assignments a
    JOIN classes c
        ON a.class_id = c.id
    WHERE a.class_id = ? AND c.teacher_id = ?
    `

    db.query(sql, [class_id, teacher_id], (err, result) => {
        if (err) return handleDbError(res, err);

        if (result.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not the teacher of this class"
            });
        }

        db.query(
            showSql, 
            [class_id, teacher_id],
            (showErr, showResult) => {
                if (showErr) return handleDbError(res, showErr);
                return res.status(200).json({ success: true, data: showResult });
            }
        )
    })
}

exports.update = (
    req,
    res
) => {
    const {title, deadline,} = req.body

    if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required!" })
    }
    if (!deadline || !deadline.trim()) {
        return res.status(400).json({ message: "Deadline is required!" })
    }

    const assignment_id  =  req.params.id

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id =  req.user.id
    const sql = `
    UPDATE assignments a
    JOIN classes c ON a.class_id = c.id
    SET a.title = ?, a.deadline = ?
    WHERE a.id = ? AND c.teacher_id = ?;
    `
    db.query(
        sql,
        [title, deadline, assignment_id, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: "Assignment not found" });
            }

            return res.status(200).json({ success: true, message: "Update assignment successfully", data: result });
        }
    )
    
}

exports.destroy = (
    req,
    res
) => {
    const assignment_id  =  req.params.id

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id =  req.user.id
    const sql = `
    DELETE a
    FROM assignments a
    JOIN classes c ON a.class_id = c.id
    WHERE a.id = ? AND c.teacher_id = ?;
    `
    db.query(
        sql,
        [assignment_id, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: "Assignment not found" });
            }

            return res.status(200).json({ success: true, message: "Delete assignment successfully", data: result });
        }
    )
}
