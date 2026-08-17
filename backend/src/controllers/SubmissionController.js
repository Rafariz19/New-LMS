const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');

exports.store = (
    req,
    res
) => {
    const assignments_id = req.params.id
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id
    const file_url = req.file.filename
    const sql = `
    SELECT e.id
    FROM enrollments e
    JOIN assignments a ON a.class_id = e.class_id
    WHERE a.id = ? AND e.student_id = ?;
    `
    db.query(
        sql,
        [assignments_id, student_id, file_url],
        (err, result) => {
            if (err) return handleDbError(res, err);

            if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Class not found or you don't have access" });
            }

            db.query(
                `
                INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                file_url = VALUES(file_url),
                submitted_at = VALUES(submitted_at)
                `,
                [assignments_id, student_id, file_url],
                (err, result) => {
                    if (err) return handleDbError(res, err);
                    res.status(201).json({ message: "Submissions created successfully" })
                }
            )
        }
    )
}

exports.listForAssignment = (
    req,
    res
) => {
    const assignments_id = req.params.id

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id
    const sql = `
    SELECT sub.*, u.name AS student_name
    FROM submissions sub
    JOIN students s ON sub.student_id = s.student_id
    JOIN users u ON s.student_id = u.id
    WHERE sub.assignment_id = ? AND sub.student_id = ?;
    `
    db.query(
        sql,
        [assignments_id, student_id],
        (err, result) => {
            if (err) return handleDbError(res, err);
                return res.status(200).json({ success: true, data: result });
        }
    )
}

exports.show = (
    req,
    res
) => {
    const classes_id = req.params.id
    const teacher_id = req.user.id
    const sql = `SELECT id FROM classes WHERE id = ? AND teacher_id = ?;`

    db.query(
        sql,
        [classes_id, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err);
            
            if (result.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not the teacher of this class"
            });
            }

            db.query(
                `
                SELECT
                s.*,
                c.teacher_id,
                e.class_id,
                u.name AS student_name
            FROM submissions s
            JOIN assignments a ON a.id = s.assignment_id
            JOIN enrollments e ON e.student_id = s.student_id AND e.class_id = a.class_id
            JOIN classes c ON c.id = a.class_id
            JOIN users u ON u.id = e.student_id
            WHERE a.class_id = ? AND c.teacher_id = ?;
                `,
                [classes_id, teacher_id],
                (err, result) => {
                    if (err) return handleDbError(res, err);
                    return res.status(200).json({ success: true, data: result });
                }
            )
        }
    )
    
}

exports.grade = (
    req,
    res
) => {
    const {grade, feedback} = req.body

    if (grade === undefined || grade === null || isNaN(grade) || grade < 0 || grade > 100) {
    return res.status(400).json({ message: "Grade is required and must be a valid number!" });
    }

    const submission_id = req.params.id

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id = req.user.id
    const sql = `
    UPDATE submissions sub
    JOIN assignments a ON sub.assignment_id = a.id
    JOIN classes c ON a.class_id = c.id
    SET sub.grade = ?, sub.feedback = ?
    WHERE sub.id = ? AND c.teacher_id = ?;
    `
    db.query(
        sql,
        [grade, feedback, submission_id, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err);
            
            if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Submission not found or not accessible" });
            }

            res.status(201).json({ message: "Grade updated successfully", data: result})
        }
    )
}

exports.mySubmissions = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id
    const sql = `
    SELECT sub.*, a.title AS assignment_title
    FROM submissions sub
    JOIN assignments a ON sub.assignment_id = a.id
    WHERE sub.student_id = ?;
    `
    db.query(
        sql,
        [student_id],
        (err, result) => {
            if (err) return handleDbError(res, err);
            return res.status(200).json({ success: true, data: result });
        }
    )
}
