const db = require("../config/db")
const path = require("path")

exports.uploadMaterial = (
    req,
    res
) => {

    const class_id = req.params.id
    const { title } = req.body

    if (!req.file) {
        return res.status(400).json({ message: "File is required" });
    }
    const file_url = req.file.filename
    
    const teacher_id = req.user.id

    const sql = `
    INSERT INTO materials
    (
        class_id,
        title,
        file_url,
        uploaded_at
    )
    SELECT 
        c.id,
        ?,
        ?,
        NOW()
    FROM classes c
    WHERE c.id = ?
    AND c.teacher_id = ?;
    `

    db.query(
        sql,
        [
            title,
            file_url,
            class_id,
            teacher_id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to add material",
                    error: err.message
                })
            }

            res.status(201).json({
                success: true,
                message: "Material added successfully",
                data: {
                    id: result.insertId,
                    title,
                    file_url
                }
            })
        }
    )

}

exports.getMaterialsByClass = (req, res) => {
    const class_id = req.params.id

    const sql = `
        SELECT
            m.id AS material_id,
            c.name AS class_name,
            m.title AS material_title,
            m.file_url,
            u.name AS teacher_name,
            m.uploaded_at
        FROM materials m
        JOIN classes c
            ON m.class_id = c.id
        JOIN users u
            ON c.teacher_id = u.id
        WHERE m.class_id = ?
        ORDER BY m.uploaded_at DESC
        `

    db.query(
        sql,
        [class_id],
        (err, result) => {

            if (err) {
                return handleDbError(res, err);
            }

            res.json(result)

        }
    )
}

exports.downloadMaterial = (
    req,
    res
) => {

    const uploadsDir = path.resolve(__dirname, "../uploads");
    const filePath = path.resolve(uploadsDir, req.params.filename);

    if (!filePath.startsWith(uploadsDir)) {
        return res.status(400).json({ message: "Invalid filename" });
    }

    res.download(filePath);

}