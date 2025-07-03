# ChatApp - Facebook-like Social Media Platform

A modern social media application built with React, Node.js, Express, MySQL, and Prisma ORM. Features include real-time chat, news feed, stories, user profiles, and more.

## 🚀 Features

- **Real-time Chat**: Instant messaging with Socket.IO
- **News Feed**: Facebook-like feed with posts, likes, comments, and shares
- **Stories**: 24-hour disappearing stories with image upload
- **User Profiles**: Complete user profiles with cover images and bio
- **Friend System**: Send/accept friend requests and manage friendships
- **Notifications**: Real-time notifications for various activities
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: JWT-based authentication system
- **File Upload**: Image upload for posts, stories, and avatars

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **Heroicons** for icons

### Backend
- **Node.js** with Express
- **MySQL** database
- **Prisma ORM** for database management
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd CHATAPP
```

### 2. Install dependencies

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd client
npm install
```

### 3. Environment Setup

#### Server Environment
1. Copy the example environment file:
```bash
cd server
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/chatapp_db"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173
```

#### Client Environment
1. Copy the example environment file:
```bash
cd client
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=ChatApp
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_SOCKETS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true
```

### 4. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE chatapp_db;
```

2. Run Prisma migrations:
```bash
cd server
npx prisma migrate dev --name init
```

3. Generate Prisma client:
```bash
npx prisma generate
```

### 5. Start the application

#### Development Mode

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal):
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
CHATAPP/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature-based components
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── prisma/             # Database schema and migrations
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── controllers/        # Route controllers
│   ├── services/           # Business logic
│   └── uploads/            # File uploads
└── README.md
```

## 🔧 Available Scripts

### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build for production
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Implementation

### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes
- Session management

### Real-time Features
- Socket.IO for instant messaging
- Real-time notifications
- Online/offline status
- Typing indicators

### File Upload
- Image upload for posts and stories
- Avatar and cover image upload
- File size validation
- Image compression

### Database Design
- Comprehensive user relationships
- Optimized queries with Prisma
- Proper indexing
- Data integrity constraints

## 🔒 Security Features

- Password hashing
- JWT token validation
- CORS configuration
- Input validation
- File upload security
- SQL injection prevention (Prisma ORM)

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Responsive navigation
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Set up environment variables
2. Configure database connection
3. Deploy using the platform's CLI or dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Updates

Stay updated with the latest features and bug fixes by:
- Following the repository
- Checking the releases page
- Reading the changelog

---

**Happy Coding! 🎉** 