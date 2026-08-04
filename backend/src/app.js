require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API berjalan' });
});

// Nanti route controller kamu didaftarkan di sini, contoh:
// const classRoutes = require('./routes/class.routes');
// app.use('/api/v1/classes', classRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});