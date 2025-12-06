# NFR Brand E-commerce Store

A full-stack e-commerce platform for NFR Brand fashion products built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Features

- **Admin Dashboard**: Complete product, order, and user management
- **Product Management**: Add, edit, delete products with image uploads
- **Order Management**: Track and update order statuses
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Mobile-friendly interface
- **Real-time Toast Notifications**: User-friendly feedback system

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The `.env` file should already be created. If not, create one with:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/nfr-store
   JWT_SECRET=nfr-store-secret-key-change-in-production-2024
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ADMIN_EMAIL=admin@nfr.com
   ADMIN_PASSWORD=Admin@123
   ADMIN_NAME=NFR Admin
   ```

4. **Start MongoDB**
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   
   # Or run MongoDB directly
   mongod --dbpath ./data
   ```

5. **Seed admin user**
   ```bash
   npm run seed
   ```
   
   This will create an admin user with:
   - Email: `admin@nfr.com`
   - Password: `Admin@123` (or as specified in .env)

6. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

7. **Access the application**
   - Store: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/admin.html`

## 📁 Project Structure

```
webapp/
├── middleware/          # Authentication and authorization middleware
│   └── auth.js
├── models/             # MongoDB data models
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── public/             # Frontend files
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   │   ├── admin-dashboard.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── toast.js
│   ├── admin.html     # Admin dashboard
│   ├── index.html     # Store homepage
│   └── ...
├── routes/            # API routes
│   ├── admin.js       # Admin routes
│   ├── auth.js        # Authentication routes
│   ├── orders.js      # Order routes
│   └── products.js    # Product routes
├── scripts/           # Utility scripts
│   └── seedAdmin.js   # Admin user seeding
├── uploads/           # User uploaded files
│   └── products/      # Product images
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies
└── server.js         # Application entry point
```

## 🔐 Admin Dashboard

### Login Credentials
- Email: `admin@nfr.com`
- Password: `Admin@123` (or as specified in .env)

### Features
1. **Dashboard Overview**
   - Total products, orders, users statistics
   - Revenue tracking
   - Recent orders display
   - Low stock alerts

2. **Product Management**
   - Add new products with multiple images
   - Edit product details
   - Soft delete products
   - Manage sizes and stock
   - Set featured products
   - Add color variants

3. **Order Management**
   - View all orders
   - Filter by status
   - Update order status
   - View customer details

4. **User Management**
   - View all registered users
   - Monitor user activity

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Admin - Products
- `GET /api/admin/products` - Get all products (including inactive)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product (soft delete)

### Admin - Orders
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status

### Admin - Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Admin - Users
- `GET /api/admin/users` - Get all users

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Admin-only routes
- Input validation
- File upload restrictions

## 🚀 Production Deployment

1. **Environment Variables**
   - Change `JWT_SECRET` to a strong random string
   - Set `NODE_ENV=production`
   - Update `CLIENT_URL` to your production URL
   - Use a production MongoDB URI

2. **Build and Deploy**
   ```bash
   npm start
   ```

3. **Security Checklist**
   - [ ] Change default admin password
   - [ ] Update JWT secret
   - [ ] Enable HTTPS
   - [ ] Set up proper CORS origins
   - [ ] Configure MongoDB authentication
   - [ ] Set up file upload limits
   - [ ] Enable rate limiting
   - [ ] Set up logging

## 📝 Notes

- All product images are stored in `/uploads/products/`
- Maximum file size for uploads: 5MB
- Supported image formats: JPEG, JPG, PNG, WEBP
- Products use soft delete (isActive flag)
- Orders cannot be deleted, only status updated

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB port (default: 27017)

### Admin Login Fails
- Run `npm run seed` to create admin user
- Check admin credentials in .env

### Image Upload Fails
- Ensure `uploads/products/` directory exists
- Check file size (max 5MB)
- Verify file format (JPEG, JPG, PNG, WEBP)

## 📄 License

MIT License

## 👨‍💻 Development

Contributions are welcome! Please feel free to submit a Pull Request.
