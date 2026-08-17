require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/AuthRoute'));
app.use('/api/admin', require('./routes/AdminRoute'));
app.use('/api/classes', require('./routes/ClassRoute'));
app.use('/api/students', require('./routes/EnrollmentRoute'));
app.use("/api/materials", require('./routes/MaterialsRoutes'))
app.use('/api/assignments', require('./routes/AssignmentRoute'));
app.use('/api/submissions', require('./routes/SubmissionRoute'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
