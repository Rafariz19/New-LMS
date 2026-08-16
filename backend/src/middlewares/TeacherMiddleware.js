const db = require("../config/db");

const teacherApproved = async (req, res, next) => {
  if (req.user.role !== "teacher") return next();

  const sql = "SELECT status FROM teachers WHERE teacher_id = ?";
  db.query(sql, 
    [req.user.id], 
    (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (!result.length || result[0].status !== "approved") {
      return res.status(403).json({
        message: "Teacher account is waiting for approval"
      });
    }

    next();
  });
};

module.exports = teacherApproved;