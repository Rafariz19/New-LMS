const db = require("../config/db")

exports.listTeachers = (
    req,
    res
) => {
    const teacherStatus = req.query.status;
    
    if (!teacherStatus) {
        return res.status(400).json({ message: "Status parameter is required" });
    }

    const sqlList = `
        SELECT u.id, u.name, u.email, t.status, t.approved_at
        FROM teachers t 
        JOIN users u 
        ON t.user_id = u.id
        WHERE t.status = ?;
    ` 
    db.query(sqlList, 
            [teacherStatus], 
            (err, result) => {
            
            if (err) return res.status(500).json(err)
            
            return res.status(200).json({
                success: true,
                data: result
            });
        })
    
}

exports.approveTeacher = (
    req,
    res
) => {
    const approve = req.user.id 
    const teacherId = req.params.userId

    const sqlApprove = `
        UPDATE teachers
        SET status = 'approved', approved_by = ?, approved_at = NOW()
        WHERE teacher_id = ? AND status = 'pending';
    `
    db.query(sqlApprove, 
        [approve, teacherId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed approve teacher",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found or already approved"
                })
            }

            return res.status(200).json({
                success: true,
                message: "teacher success approved"
            });
        }
    )
}

exports.rejectTeacher = (
    req,
    res
) => {
    const user_id = req.params.userId

    const sqlReject = `
        UPDATE teachers
        SET status = 'rejected'
        WHERE user_id = ? AND status = 'pending';
    `
    db.query(sqlReject,
        [user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed rejecte teacher",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found or already rejected"
                })
            }

            return res.status(200).json({
                success: true,
                message: "teacher success rejected"
            });
        }
    )
}
