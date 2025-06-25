# ShopEZ Online Shopping

ShopEZ is a modern, full-stack e-commerce web application built with React (TypeScript) for the frontend and Node.js/Express/MongoDB for the backend. It provides a seamless shopping experience with features like product browsing, cart management, secure checkout, user authentication, seller dashboard, analytics, and more.

---

## Features

### Customer Features
- **Product Browsing:** Search, filter, and sort products with a responsive grid/list view.
- **Product Details:** View detailed product info, images, reviews, and add to wishlist or cart.
- **Cart & Checkout:** Manage cart, apply promo codes, select shipping methods, and checkout with Cashfree payment gateway.
- **Order History:** View past orders and their statuses in the profile page.
- **Wishlist:** Save favorite products for later.
- **Authentication:** Register and login as customer or seller, with JWT-based authentication.

### Seller/Admin Features
- **Dashboard:** View sales, orders, products, and customer stats.
- **Order Management:** Manage and update order statuses.
- **Product Management:** Add, edit, and delete products.
- **Analytics:** Visualize sales, traffic, and customer insights.

### General
- **Responsive UI:** Mobile-friendly, modern design using Tailwind CSS.
- **Secure Payments:** Integrated with Cashfree for real payment processing.
- **API Integration:** Uses dummyjson.com for demo product data; backend supports real product CRUD.
- **Demo Accounts:** Quick login for customer, seller, and admin roles.

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Payments:** Cashfree Payment Gateway
- **Authentication:** JWT (JSON Web Tokens)
- **Demo Data:** [dummyjson.com](https://dummyjson.com/) for product catalog

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- Yarn or npm

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shopez.git
cd shopez
```

### 2. Setup Environment Variables

Create `.env` files in both `server/` and `client/` directories.

#### Example for `server/.env`:

```
MONGO_URI=mongodb://localhost:27017/shopez
JWT_SECRET=your_jwt_secret
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
```

#### Example for `client/.env`:

```
VITE_API_URL=http://localhost:5000
```

### 3. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../Client
npm install
```

### 4. Run the Application

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd ../Client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```
ShopEZ/
├── Client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, Products, Cart, etc.)
│   │   ├── components/    # Shared UI components (Navbar, etc.)
│   │   ├── services/      # API service functions
│   │   └── App.tsx        # Main app entry
│   └── ...
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, error handling, etc.
│   └── server.js          # App entry
└── README.md
```

---

## Key Functionalities

- **Authentication:** JWT-based, with role-based access (customer, seller, admin).
- **Product Management:** CRUD for products (backend), dummyjson for demo.
- **Cart & Orders:** Cart state in context, order creation after payment.
- **Payments:** Cashfree integration for secure checkout.
- **Promo Codes:** Apply promo code `save10` for 10% discount.
- **Analytics:** Seller dashboard with sales, traffic, and customer insights.
- **Wishlist:** Add/remove products to wishlist (requires login).

---

## Demo Accounts

- **Customer:**  
  Email: sarah@example.com  
  Password: demo123

- **Seller:**  
  Email: seller@example.com  
  Password: demo123

- **Admin:**  
  Email: admin@example.com  
  Password: demo123

Or use the quick login buttons on the login page.

---

## Customization

- **Add Real Products:** Use the seller dashboard or backend API to add/edit products.
- **Payment Gateway:** Set your Cashfree credentials in `.env` for live payments.
- **Styling:** Tailwind CSS is used for easy customization.

---

## License

MIT

---

## Credits

- [dummyjson.com](https://dummyjson.com/) for demo product data
- [Cashfree](https://cashfree.com/) for payment gateway
- [Lucide Icons](https://lucide.dev/) for icons

---

## Screenshots

> Add screenshots of Home, Products, Cart, Checkout, Dashboard, Analytics, etc.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Contact

For support, open an issue or contact [your-email@example.com](mailto:your-email@example.com).

