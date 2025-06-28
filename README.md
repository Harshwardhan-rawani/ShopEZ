# ShopEZ Online Shopping Platform

A full-stack e-commerce platform built with React, Node.js, and MongoDB, featuring a modern UI, secure payment integration, comprehensive seller management system, and advanced rating & review functionality.

## 🚀 Features

### Customer Features
- **Product Browsing & Search**: Browse products with advanced filtering and search capabilities
- **Shopping Cart**: Add/remove items, quantity management, and promo code support
- **Secure Checkout**: Integrated Cashfree payment gateway with order tracking
- **Product Reviews & Ratings**: 5-star rating system with detailed customer reviews
- **Wishlist Management**: Save favorite products for later
- **Order History**: Track order status and view past purchases
- **User Profile**: Manage personal information and preferences
- **Indian Rupee Support**: Native currency integration throughout the platform

### Seller Features
- **Seller Dashboard**: Comprehensive analytics and order management
- **Product Management**: Add, edit, and delete products with image uploads
- **Order Management**: Update order status (pending → processing → shipping → delivered)
- **Revenue Tracking**: Real-time revenue calculation based on shipped orders only
- **Inventory Management**: Stock tracking and low stock alerts
- **Payment Status Tracking**: Monitor paid/unpaid orders
- **Order Status Control**: Full control over order lifecycle

### Admin Features
- **Multi-role System**: Customer, Seller, and Admin roles
- **Order Analytics**: Detailed sales and revenue reports
- **User Management**: Manage all users and their roles

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cashfree** payment gateway integration
- **Cloudinary** for image uploads

### Key Libraries
- **@cashfreepayments/cashfree-js**: Payment processing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management
- **multer**: File upload handling

## 📁 Project Structure

```
ShopEZ Online Shopping/
├── Client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.tsx         # Navigation component
│   │   │   ├── ReviewSection.tsx  # Product reviews component
│   │   │   └── ui/                # Shadcn/ui components
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Products.tsx      # Product listing
│   │   │   ├── ProductDetail.tsx # Product details
│   │   │   ├── Cart.tsx          # Shopping cart
│   │   │   ├── Checkout.tsx      # Checkout process
│   │   │   ├── Dashboard.tsx     # Seller dashboard
│   │   │   ├── Profile.tsx       # User profile
│   │   │   ├── Login.tsx         # Authentication
│   │   │   └── Register.tsx      # User registration
│   │   ├── lib/                  # Utility functions
│   │   │   ├── utils.ts          # General utilities
│   │   │   └── currency.ts       # Currency formatting
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API services
│   │   └── App.tsx              # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                        # Backend Node.js Application
│   ├── controllers/              # Route controllers
│   │   ├── authController.js     # Authentication logic
│   │   ├── productController.js  # Product management
│   │   ├── orderController.js    # Order processing
│   │   ├── reviewController.js   # Review system
│   │   └── userController.js     # User management
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js              # User model
│   │   ├── Product.js           # Product model
│   │   ├── Order.js             # Order model
│   │   └── Review.js            # Review model
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── orderRoutes.js       # Order endpoints
│   │   ├── reviewRoutes.js      # Review endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── middleware/               # Custom middleware
│   │   └── auth.js              # JWT authentication
│   ├── config/                   # Configuration files
│   │   └── database.js          # MongoDB connection
│   ├── index.js                 # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShopEZ-Online-Shopping
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../Client
   npm install
   ```

3. **Environment Setup**

   Create `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shopez
   JWT_SECRET=your_jwt_secret_key
   CASHFREE_CLIENT_ID=your_cashfree_client_id
   CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Create `.env` file in the Client directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Start the development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server (in new terminal)
   cd Client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 💳 Payment Integration

The platform integrates with **Cashfree Payment Gateway** for secure payment processing:

- **Sandbox Mode**: For testing with test credentials
- **Production Mode**: For live transactions
- **Payment Methods**: Credit/Debit cards, UPI, Net Banking, Wallets
- **Order Tracking**: Real-time payment status updates

### Payment Flow
1. User adds items to cart
2. Proceeds to checkout
3. Cashfree payment session created
4. User completes payment
5. Order status updated to "paid"
6. Order confirmation sent

## ⭐ Rating & Review System

### Features
- **5-Star Rating System**: Interactive star rating for products
- **Review Management**: Write, edit, and delete reviews
- **User Validation**: One review per user per product
- **Real-time Updates**: Automatic product rating recalculation
- **Review Display**: Chronological listing with user attribution

### Review Workflow
1. User purchases a product
2. Can write a review with rating (1-5 stars)
3. Review text limited to 500 characters
4. Product's average rating automatically updated
5. Reviews displayed on product detail page

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer/seller/admin),
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  brand: String,
  price: Number,
  stock: Number,
  images: [String],
  description: String,
  category: String,
  discount: Number,
  ratings: Number,        // Average rating
  reviews: Number,        // Total review count
  sold: Number,
  sellerId: String,
  createdAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: Mixed,
    sellerId: String,
    quantity: Number,
    price: Number,
    name: String,
    brand: String,        // Product brand
    image: String
  }],
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingMethod: String,
  total: Number,
  status: String (pending/processing/shipping/delivered),
  paymentStatus: String (paid/unpaid),
  createdAt: Date
}
```

### Review Model
```javascript
{
  product: ObjectId (ref: Product),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  review: String (max 500 chars),
  userName: String,
  createdAt: Date
}
```

## 🔐 Authentication & Authorization

### JWT-based Authentication
- Secure token-based authentication
- Role-based access control
- Protected routes for sensitive operations
- Automatic token refresh

### User Roles
- **Customer**: Browse products, place orders, write reviews
- **Seller**: Manage products, view orders, update status
- **Admin**: Full system access and user management

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, responsive design
- **Indian Rupee Integration**: Native currency support (₹)
- **Color Scheme**: Orange theme with professional styling
- **Responsive Design**: Mobile-first approach

### Key Components
- **Product Cards**: Image gallery, pricing, ratings
- **Shopping Cart**: Real-time updates, quantity controls
- **Order Management**: Status tracking, payment info
- **Review System**: Star ratings, user feedback
- **Dashboard**: Analytics, charts, data visualization

## 📈 Business Logic

### Order Status Management
1. **Pending**: Order placed, payment pending
2. **Processing**: Payment received, order being prepared
3. **Shipping**: Order shipped to customer
4. **Delivered**: Order successfully delivered

### Payment Status
- **Paid**: Payment completed successfully
- **Unpaid**: Payment pending or failed

### Revenue Calculation
- Only **shipped orders** count towards revenue
- Real-time calculation in seller dashboard
- Historical data tracking

### Inventory Management
- **Stock Tracking**: Real-time stock updates
- **Low Stock Alerts**: Visual indicators for sellers
- **Sold Count**: Track product performance

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `GET /api/orders` - Get orders (filtered by seller)
- `POST /api/orders/create-after-payment` - Create order
- `POST /api/orders/cashfree` - Create payment session
- `PUT /api/orders/:id/status` - Update order status

### Reviews
- `GET /api/reviews/product/:id` - Get product reviews
- `POST /api/reviews/product/:id` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Users
- `GET /api/users/:id/wishlist` - Get user wishlist
- `POST /api/users/:id/wishlist` - Add to wishlist
- `DELETE /api/users/:id/wishlist` - Remove from wishlist

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd Client
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd server
# Set environment variables
npm start
```

### Environment Variables for Production
- Update API URLs to production endpoints
- Set secure JWT secrets
- Configure production payment credentials
- Set up production MongoDB connection

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Payment integration
- [ ] Order management
- [ ] Review system
- [ ] Seller dashboard
- [ ] Admin functionality
- [ ] Currency display (Indian Rupee)
- [ ] Order status updates
- [ ] Review submission and editing

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure credential management
- **Rate Limiting**: API request throttling (recommended)

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout and touch interactions
- **Mobile**: Streamlined interface for small screens

## 🎯 Future Enhancements

### Planned Features
- **Real-time Chat**: Customer-seller communication
- **Advanced Analytics**: Detailed sales reports and insights
- **Multi-language Support**: Internationalization
- **Push Notifications**: Order updates and promotions
- **Advanced Search**: Elasticsearch integration
- **Inventory Alerts**: Automated low stock notifications
- **Bulk Operations**: Mass product updates
- **API Documentation**: Swagger/OpenAPI integration

### Technical Improvements
- **Caching**: Redis for improved performance
- **Image Optimization**: WebP format and lazy loading
- **PWA Support**: Progressive Web App features
- **SEO Optimization**: Meta tags and structured data
- **Performance Monitoring**: Application insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer**: React, TypeScript, Tailwind CSS
- **Backend Developer**: Node.js, Express, MongoDB
- **UI/UX Designer**: Modern, responsive design
- **DevOps**: Deployment and infrastructure

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**ShopEZ Online Shopping** - Building the future of e-commerce with modern technology and user-centric design.

