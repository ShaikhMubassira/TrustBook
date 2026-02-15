const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Load Environment Variables
dotenv.config();

const app = express();

// 2. Middleware
// Configure CORS for production and development
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'http://localhost:5173',  // Vite dev server
  'https://trustbook-kwdhahpmi-mubassira-shaikhs-projects.vercel.app', // Production frontend
  process.env.FRONTEND_URL, // Production frontend from env (from Render)
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Allows the server to understand JSON data sent from the frontend
app.use(express.json()); 

// 3. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/TrustBook';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ TrustBook Database Connected Successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Stop the server if DB connection fails
    });

// 4. Import Routes
const authRoutes = require('./routes/authRoute');
const accountRoutes = require('./routes/accountRoute');
const transactionRoutes = require('./routes/transactionRoute');
const exportRoutes = require('./routes/exportRoute');

// 5. Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/export', exportRoutes);

// 6. Root Route (Optional - for testing)
app.get('/', (req, res) => {
    res.send('TrustBook API is running...');
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});