const db = require("../config/db")
const { handleDbError } = require('../util/handleDbError');
const userModel = require('../models/userModel');
const classModel = require('../models/classModel');

exports.store = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id = req.user.id
    const {name} = req.body

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Class name is required" })
    }

    const sqlStore = `
    INSERT INTO classes (name, teacher_id) VALUES (?, ?);
    `
    db.query(sqlStore,
        [name, teacher_id],
        (err, result) => {
            if (err) return handleDbError(res, err)

            res.status(201).json({ message: "Create class successfully" })
        }
        
    )
}

exports.index = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const userId = req.user.id;

    userModel.findRoleById(userId, (err, result) => {
        if (err) return handleDbError(res, err);
 
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
 
        const { role } = result[0];
 
        const sendResult = (err, result) => {
            if (err) return handleDbError(res, err);
            return res.status(200).json({ success: true, data: result });
        };
 
        switch (role) {
            case 'student':
                return classModel.getClassesForStudent(userId, sendResult);
            case 'teacher':
                return classModel.getClassesForTeacher(userId, sendResult);
            case 'admin':
                return classModel.getAllClasses(sendResult);
            default:
                return res.status(403).json({ success: false, error: "Forbidden role" });
        }
    });
}

exports.show = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const student_id = req.user.id

    const sql =  `SELECT c.*
                    FROM classes c
                    JOIN enrollments e ON c.id = e.class_id
                    WHERE e.student_id = ?;
                `

    db.query(sql,
        [student_id],
        async (err, result) => {
            if (err) return handleDbError(res, err);
            return res.status(200).json({ success: true, data: result });
        }
    )
    
}

exports.update = (
    req,
    res
) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const teacher_id = req.user.id
    const {name} = req.body
    
    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Class name is required" })
    }

    const class_id = req.params.classId 
    const sql = `UPDATE classes SET name = ? WHERE id = ? AND teacher_id = ?;`
    
    db.query(sql, 
        [name, class_id, teacher_id],
        async(err, result) => {
            if (err) return handleDbError(res, err);
            res.status(201).json({ message: "Update class successfully" })
            console.log(result.affectedRows);
        })
        
    }
    
    exports.destroy = (
        req,
        res
    ) => {
        const class_id = req.params.classId
        const teacher_id = req.user.id
        const sql = `DELETE FROM classes WHERE id = ? AND teacher_id = ?;`
        
        db.query(sql, 
            [class_id, teacher_id],
            async(err, result) => {
                if (err) return handleDbError(res, err);
                res.status(201).json({ message: "Delete class successfully" })
                console.log(result.affectedRows);
        }
    )
}
