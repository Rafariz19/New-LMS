// //exports.register = async (req, res) => {
//     try {
//         const { name, email, password, role, nim, jurusan } = req.body
//         const hashedPassword = await bcrypt.hash(password, 10)

//         const allowedRoles = ["student", "teacher"]
//         if (!allowedRoles.includes(role)) {
//             return res.status(400).json({ message: "Invalid role" })
//         }

//         if (role === "student") {
//             if (!nim || !jurusan) {
//                 return res.status(400).json({ message: "Missing student fields: nim or jurusan" })
//             }
//         }

//         let status = "approved"
//         if (role === "teacher") status = "pending"

//         // Use a transaction: insert user, then insert student (only for students)
//         db.beginTransaction((txErr) => {
//             if (txErr) return res.status(500).json(txErr)

//             const insertUserSql = `INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())`
//             db.query(insertUserSql, [name, email, hashedPassword, role, status], (err, result) => {
//                 if (err) {
//                     return db.rollback(() => res.status(500).json(err))
//                 }

//                 const userId = result.insertId

//                 if (role === "student") {
//                     const insertStudentSql = `INSERT INTO students (user_id, nim, jurusan) VALUES (?, ?, ?)`
//                     db.query(insertStudentSql, [userId, nim, jurusan], (err2) => {
//                         if (err2) {
//                             return db.rollback(() => res.status(500).json(err2))
//                         }

//                         db.commit((commitErr) => {
//                             if (commitErr) {
//                                 return db.rollback(() => res.status(500).json(commitErr))
//                             }
//                             res.status(201).json({ message: "User registered successfully" })
//                         })
//                     })
//                 } else {
//                     // For teachers (or other roles), no students record needed
//                     db.commit((commitErr) => {
//                         if (commitErr) {
//                             return db.rollback(() => res.status(500).json(commitErr))
//                         }
//                         res.status(201).json({ message: "User registered successfully" })
//                     })
//                 }
//             })
//         })

//     } catch (error) {
//         res.status(500).json(error)
//     }
// }