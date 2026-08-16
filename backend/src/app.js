require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/AuthRoute'));
app.use('/api/admin', require('./routes/AdminRoute'));
app.use('/api/classes', require('./routes/ClassRoute'));
app.use('/api/students', require('./routes/EnrollmentRoute'));
app.use("/api/materials", require('./routes/MaterialsRoutes'))
app.use('/api/assignments', require('./routes/AssignmentRoute'));
app.use('/api/submissions', require('./routes/SubmissionRoute'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API berjalan' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});