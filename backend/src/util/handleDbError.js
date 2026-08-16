const handleDbError = (res, err) => {
    console.error("Database Error Details:", err);
    return res.status(500).json({ success: false, message: "DB error", error: err.message || err });
};
 
module.exports = { handleDbError };