# 📊 TrustBook - Personal Financial Management System

A modern, full-stack web application for managing personal finances with ease. TrustBook helps users track accounts, manage transactions, and export financial statements with a beautiful, intuitive interface.

---

## 🎯 Project Overview

TrustBook is a comprehensive financial management platform designed to help individuals:
- **Manage multiple bank accounts** with real-time balance tracking
- **Track transactions** and categorize spending patterns
- **Generate financial reports** and export statements
- **Secure authentication** with JWT tokens
- **Responsive design** that works on desktop, tablet, and mobile

**Live Demo:** [TrustBook Frontend](https://my-trustbook.vercel.app)  
**Backend API:** [TrustBook API](https://trustbook.onrender.com/)

---

## ✨ Key Functionalities

### 1. **User Authentication**
- User registration with email and password
- Secure login with JWT token-based authentication
- Password hashing using bcryptjs
- Protected routes and API endpoints

### 2. **Account Management**
- Create and manage multiple bank accounts
- Track account types (Checking, Savings, Credit Card, etc.)
- Real-time balance computation
- Account detail view with transaction history

### 3. **Transaction Management**
- Record income and expense transactions
- Categorize transactions
- Filter transactions by account, date, or category
- Transaction history and analytics

### 4. **Financial Reports & Export**
- Generate transaction statements in **PDF** format
- Export data to **Excel** spreadsheets
- Monthly and custom date range reports
- Detailed transaction summaries

### 5. **User Profile Management**
- View and update user information
- Manage account settings
- View usage statistics

### 6. **Responsive Dashboard**
- Overview of all accounts and balances
- Recent transactions feed
- Quick action buttons
- Real-time data updates

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework for building interactive components |
| **Vite 7** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **Axios** | HTTP client for API communication |
| **React Hot Toast** | Toast notifications for user feedback |
| **Lucide React** | Beautiful, consistent icon library |
| **React Icons** | Additional icon set |
| **Context API** | State management for authentication |

### **Backend**
| Technology | Purpose |
|------------|---------|
| **Node.js 22** | JavaScript runtime environment |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB** | NoSQL database for storing user data |
| **Mongoose** | MongoDB object modeling |
| **JWT (jsonwebtoken)** | Secure token-based authentication |
| **bcryptjs** | Password hashing and security |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |
| **PDFKit** | Generate PDF reports |
| **ExcelJS** | Generate Excel spreadsheets |

### **Deployment**
| Service | Purpose |
|---------|---------|
| **Render** | Backend hosting (Node.js) |
| **Vercel** | Frontend hosting (React/Vite) |
| **MongoDB Atlas** | Cloud database |
| **GitHub** | Version control and CI/CD |

---

## 📂 Project Structure

```
TrustBook/
│
├── trustbook-backend/              # Node.js/Express API server
│   ├── config/
│   │   └── db.js                  # MongoDB connection config
│   ├── controllers/
│   │   ├── authController.js      # Auth logic (signup, login)
│   │   ├── accountController.js   # Account CRUD operations
│   │   ├── transactionController.js # Transaction management
│   │   └── exportController.js    # PDF/Excel export logic
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Account.js             # Account schema
│   │   └── Transaction.js         # Transaction schema
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoute.js           # Authentication endpoints
│   │   ├── accountRoute.js        # Account endpoints
│   │   ├── transactionRoute.js    # Transaction endpoints
│   │   └── exportRoute.js         # Export endpoints
│   ├── server.js                   # Express app setup
│   ├── package.json
│   ├── .env.example               # Example env variables
│   └── .env                       # (gitignored) Local env vars
│
├── trustbook-frontend/             # React/Vite application
│   ├── public/
│   │   └── favicon.png            # App favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPage.jsx       # Login/Signup page
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Accounts.jsx       # Accounts list
│   │   │   ├── AccountDetail.jsx  # Single account detail
│   │   │   ├── TransactionForm.jsx # Add transaction form
│   │   │   ├── Statement.jsx      # Statement view
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── services/
│   │   │   └── api.js             # Axios instance & API calls
│   │   ├── theme/
│   │   │   └── colors.js          # Color theme constants
│   │   ├── utils/
│   │   │   └── helpers.js         # Utility functions
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # React entry point
│   ├── package.json
│   ├── .env                       # (gitignored) Dev env vars
│   ├── .env.production            # Production env vars
│   └── vite.config.js             # Vite config
│
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git installed

### **1. Clone the Repository**
```bash
git clone https://github.com/ShaikhMubassira/TrustBook.git
cd TrustBook
```

### **2. Backend Setup**

```bash
cd trustbook-backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and update)
cp .env.example .env

# Edit .env with your values:
# - MONGO_URI: MongoDB Atlas connection string
# - JWT_SECRET: Your secret key
# - FRONTEND_URL: http://localhost:5173 (for local dev)
```

**Start Backend:**
```bash
npm run dev      # For development (with nodemon)
npm start        # For production
```

Backend runs on `http://localhost:5000`

### **3. Frontend Setup**

```bash
# In a new terminal
cd trustbook-frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

**Start Frontend:**
```bash
npm run dev       # Starts Vite dev server
npm run build     # Build for production
```

Frontend runs on `http://localhost:5173`

### **4. Test the Application**
1. Open browser → `http://localhost:5173`
2. Sign up with email and password
3. Create an account and add transactions
4. Test PDF/Excel export functionality

---

## 📋 Environment Variables

### **Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/TrustBook

# Authentication
JWT_SECRET=your_secret_key_here

# CORS
FRONTEND_URL=http://localhost:5173
```

### **Frontend (.env)**
```env
# Development
VITE_API_URL=http://localhost:5000/api
```

### **Frontend (.env.production)**
```env
# Production
VITE_API_URL=https://trustbook.onrender.com/api
```

---

## 🌐 Deployment Guide

### **Deploy Backend to Render** (Free)
1. Push code to GitHub
2. Create account on [Render.com](https://render.com)
3. Connect GitHub repository
4. Set root directory: `trustbook-backend`
5. Add environment variables (MONGO_URI, JWT_SECRET, FRONTEND_URL)
6. Deploy

### **Deploy Frontend to Vercel** (Free)
1. Create account on [Vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Set root directory: `trustbook-frontend`
4. Add environment variable: `VITE_API_URL=your-render-backend-url/api`
5. Deploy

### **MongoDB Setup** (Free)
1. Create account on [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster (M0)
3. Create database user
4. Get connection string
5. Add to Render environment variables

### **Keep Server Awake** (Free Tier)
Use [UptimeRobot](https://uptimerobot.com) to ping `/health` endpoint every 5 minutes

---

## 🔒 Security Features

✅ **Password Hashing** - Passwords hashed with bcryptjs (salt rounds: 12)  
✅ **JWT Authentication** - Secure token-based authentication  
✅ **CORS Protection** - Whitelist specific origins  
✅ **Environment Variables** - Sensitive data not in repo  
✅ **Protected Routes** - Authentication middleware on API endpoints  
✅ **Input Validation** - Schema validation with Mongoose  

---

## 📈 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### **Accounts**
- `GET /api/accounts` - List all accounts (protected)
- `POST /api/accounts` - Create new account (protected)
- `GET /api/accounts/:id` - Get account detail (protected)
- `PUT /api/accounts/:id` - Update account (protected)
- `DELETE /api/accounts/:id` - Delete account (protected)

### **Transactions**
- `GET /api/transactions` - List transactions (protected)
- `POST /api/transactions` - Add transaction (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

### **Export**
- `GET /api/export/pdf` - Export to PDF (protected)
- `GET /api/export/excel` - Export to Excel (protected)

### **Health**
- `GET /health` - Health check (for cron jobs)

---

## 💡 Key Benefits

### **For Users**
🎯 **Comprehensive Financial Overview** - See all accounts and transactions in one place  
📊 **Smart Analytics** - Understand spending patterns and habits  
📥 **Easy Export** - Generate reports in PDF or Excel format  
🔒 **Secure** - Bank-level encryption and security measures  
📱 **Mobile Friendly** - Works seamlessly on all devices  
⚡ **Fast** - Optimized for performance and user experience  

### **For Developers**
🏗️ **Modern Stack** - Latest technologies (React 19, Node.js 22, Vite)  
🔄 **RESTful API** - Clean, organized endpoint structure  
🧩 **Modular Code** - Easy to extend and maintain  
📚 **Well-Documented** - Code comments and clear structure  
🚀 **Production Ready** - Deployed on reliable free platforms  
🔌 **Easy Integration** - Can integrate with payment gateways or other services  

### **For Business**
💰 **Cost Effective** - Deployed completely free using Render & Vercel  
🌍 **Scalable** - Can handle growing user base  
📈 **Monetization Ready** - Easy to add premium features or subscriptions  
🔗 **Integrable** - Can connect to banking APIs or fintech services  

---

## 🐛 Troubleshooting

### **CORS Errors**
- Update `FRONTEND_URL` in Render environment variables
- Make sure frontend URL is in `allowedOrigins` array in server.js

### **MongoDB Connection Issues**
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Check MONGO_URI format in .env
- Ensure database exists in MongoDB

### **Frontend Not Loading Data**
- Check browser console for errors
- Verify VITE_API_URL is correct
- Ensure JWT token is valid

### **Server Goes to Sleep**
- Set up UptimeRobot to ping `/health` every 5 minutes
- Or use GitHub Actions cron job

---

## 📞 Support & Contact

- **GitHub:** [github.com/ShaikhMubassira/TrustBook](https://github.com/ShaikhMubassira/TrustBook)
- **Live App:** [trustbook-kwdhahpmi-mubassira-shaikhs-projects.vercel.app](https://trustbook-kwdhahpmi-mubassira-shaikhs-projects.vercel.app/)

---

## 📄 License

This project is open source and available under the ISC License.

---

## 🎉 Acknowledgments

- Built with **React**, **Node.js**, **MongoDB**, and **Tailwind CSS**
- Deployed on **Render** and **Vercel**
- Database hosted on **MongoDB Atlas**
- Icons from **Lucide React** and **React Icons**

---

**Made with ❤️ by Shaikh Mubassira**

Last Updated: February 15, 2026