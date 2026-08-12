const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (
    req, 
    res
) => {
    try {
        const { name, email, password, role} = req.body

        const allowedRoles = [
            "student", "teacher"
        ]
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        // let status
        //     if (role === "teacher") {
        //         status = "pending"
        //     } else {
        //         status = "approved"
        //     }
        const status = role === "teacher" ? "pending" : "approved"

        const sqlUser = `
            INSERT INTO users (name, email, password, role, created_at)
            VALUES (?, ?, ?, ?, NOW());
        `
        db.query(sqlUser, 
            [name, email, hashedPassword, role], 
            async (err, result) => {
            if (err) return res.status(500).json(err)

            const userId = result.insertId

            if (role === "student") {
                db.query(
                    `INSERT INTO students (user_id, nim, jurusan) VALUES (?, ?, ?);`,
                    [userId, nim, jurusan],
                    (err) => {
                        if (err) return res.status(500).json(err)

                        res.status(201).json({ message: "User registered successfully" })
                    }
                )
            } else if (role === "teacher") {
                db.query(
                    `INSERT INTO teachers (user_id, status) VALUES (?, ?);`,
                    [userId, status],
                    (err) => {
                        if (err) return res.status(500).json(err)

                        res.status(201).json({ message: "User registered successfully" })
                    }
                )
            }
        })
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.login = (
    req,
    res
) => {
    const {email, password } = req.body
    const sql = `
        SELECT * FROM users WHERE email = ?
    `
    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err)
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const user = result[0]

        const isMatch = await bcrypt.compare(
            password,
            user.password
        )

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                status: user.status
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )

        res.json({
            message: "Login successful",
            token
        })

    })
}

exports.logout = (
    req,
    res
) => {
    const {} = req.body
    // ready to implement logout logic
}

exports.me = (
    req,
    res
) => {
    const user_id = req.user.id
    const sql = `SELECT name, email, role, created_at FROM users WHERE id = ?`

    db.query(
        sql,
        [user_id],
        (err,result) => {
        if (err) return res.status(500).json(err)

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" })
        }

        const role = result[0].role
            if (role == "student") {
                const sqlStudent = `
                        SELECT u.id, u.name, u.email, s.nim, s.jurusan
                        FROM users u JOIN students s ON u.id = s.user_id
                        WHERE u.id = ?;
                    `
                    db.query(sqlStudent, [user_id], (err, studentResult) => {
                        if (err) return res.status(500).json(err)
                        res.status(200).json(studentResult[0])
                    })

            } else if (role == "teacher") {
                    const sqlTeacher = `
                        SELECT u.id, u.name, u.email, t.status, t.approved_at
                        FROM users u JOIN teachers t ON u.id = t.user_id
                        WHERE u.id = ?;
                    `
                    db.query(sqlTeacher, [user_id], (err, teacherResult) => {
                        if (err) return res.status(500).json(err)
                        res.status(200).json(teacherResult[0])
                    })
        }
    })
}
