# Live Sales Platform

A professional, production-ready e-commerce platform designed for small merchants to automate their live sales process using QR codes and direct customer purchases.

## 🎯 Key Features

- **Merchant Dashboard**: Dedicated interface for product management and sales tracking
- **QR Code Generation**: Automatic QR codes and shareable links for each product
- **Real-time Order Processing**: Instant customer purchases with delivery information
- **Order Export**: CSV export functionality for accounting integration
- **Responsive Design**: Optimized for desktop and mobile devices
- **Secure Authentication**: JWT-based authentication with password encryption

## 🚀 Live Demo

**Frontend**: http://localhost:5173
**API**: http://localhost:3001

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design tokens
- **React Router** for client-side navigation
- **QRCode.js** for QR code generation
- **Custom hooks** and context for state management

### Backend
- **Node.js** with Express.js framework
- **SQLite** database with proper schema management
- **JWT authentication** with secure middleware
- **Environment-based configuration**
- **Comprehensive error handling**

### Development Tools
- **ESLint** & **TypeScript** for code quality
- **Modular architecture** with clear separation of concerns
- **Environment variables** for configuration
- **Professional CSS design system**

## 📁 Project Structure

```
live-sales-platform/
├── backend/
│   ├── config/           # Configuration management
│   ├── models/           # Database models
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes (organized)
│   ├── controllers/      # Controller logic
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service functions
│   │   ├── types/        # TypeScript type definitions
│   │   ├── styles/       # Design tokens and CSS
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   ├── index.html        # HTML template
│   └── vite.config.ts    # Frontend configuration
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: Sky blue (#0ea5e9) for buttons and accents
- **Success**: Emerald green (#22c55e) for positive actions
- **Neutral**: Professional grays with proper contrast ratios
- **Semantic**: Red for errors, yellow for warnings

### Typography
- **Font**: Inter for modern, readable text
- **Hierarchy**: Clear heading and body text scaling
- **Accessibility**: Proper contrast ratios for all text

### Components
- Reusable CSS classes for consistent UI
- Hover states and smooth transitions
- Responsive design patterns
- Loading states and proper feedback

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone <repository-url>
cd live-sales-platform
```

2. **Configure environment**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your preferred JWT secret
```

3. **Launch the application**:
```bash
docker-compose up --build
```

4. **Access the application**:
   - Frontend: http://localhost (port 80)
   - API: http://localhost:3001 (port 3001)

### Docker Services

- **Frontend**: React app served by nginx on port 80
- **Backend**: Node.js API server on port 3001
- **Database**: SQLite persisted in container volume

## 🔧 Manual Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Development Setup

1. **Clone and setup**:
```bash
git clone <repository-url>
cd live-sales-platform
```

2. **Install dependencies**:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

3. **Environment setup**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your preferred settings
```

4. **Start development servers**:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001

## 📖 Usage Guide

### For Merchants

1. **Register**: Create your merchant account
2. **Login**: Access your personalized dashboard
3. **Add Products**: Include name, price, description, and stock levels
4. **Share Products**: Use generated QR codes during live sales
5. **Monitor Orders**: Track customer purchases in real-time
6. **Export Data**: Download order reports as CSV files

### For Customers

1. **Scan QR Code**: Access product page instantly
2. **Enter Details**: Provide name, phone, and delivery address
3. **Complete Purchase**: Order is confirmed and tracked

## 🔒 Security Features

- **JWT authentication** with configurable expiration
- **Password encryption** (bypassed for demo, add bcryptjs for production)
- **Input validation** and sanitization
- **CORS configuration** for API security
- **Environment variable validation**
- **Error logging** without exposing sensitive data

## 🏗️ Architecture Principles

### Backend
- **Separation of Concerns**: Config, models, routes, middleware
- **Error Handling**: Comprehensive error boundaries
- **Database Layer**: Promisified operations for consistent async handling
- **Middleware Stack**: Logging, authentication, CORS, error handling

### Frontend
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Reusable, props-based components
- **State Management**: Custom hooks with React Context
- **Design System**: Consistent styling with design tokens

### Code Quality
- **ESLint**: Code linting and formatting rules
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Environment Config**: Configurable for different deployments
- **Error Boundaries**: Graceful error handling

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables in hosting platform
# Deploy with Node.js runtime
```

## 📊 Performance Features

- **Lazy Loading**: Component-based code splitting
- **Optimized Assets**: Tree-shaking and dead code elimination
- **Database Indexing**: Efficient queries for scalability
- **Caching Strategy**: Ready for Redis implementation
- **Minification**: Production builds with asset optimization

## 🔮 Future Enhancements

- **Real Payment Integration**: Razorpay/Stripe setup
- **Email Notifications**: Order confirmations and updates
- **Analytics Dashboard**: Sales insights and reporting
- **Multi-language Support**: Internationalization
- **Admin Panel**: Advanced management features
- **Mobile App**: React Native implementation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Push to the feature branch
5. Create a Pull Request

---

Built with modern web development best practices for production-ready applications.
