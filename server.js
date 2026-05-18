const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');   // <-- यह लाइन जोड़ें

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);                  // <-- यह लाइन जोड़ें

app.get('/', (req, res) => {
  res.send('Raftaar Fresh API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});