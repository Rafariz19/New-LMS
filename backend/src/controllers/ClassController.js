const db = require("../config/db")

exports.store = (
    req,
    res
) => {
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
        async (err, result) => {
            if (err) return res.status(500).json(err)

            res.status(201).json({ message: "Create class successfully" })
        }
        
    )
}

exports.index = (
    req,
    res
) => {
    const {} = req.body
    // ready to implement index logic
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
