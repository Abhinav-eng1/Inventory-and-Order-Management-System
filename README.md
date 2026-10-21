# 📦 Inventory and Order Management System (MERN Stack)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)](https://github.com/Abhinav-eng1/Inventory-and-Order-Management-System)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](https://opensource.org/licenses/ISC)

### 🚀 1-Click Cloud Deployment
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Abhinav-eng1/Inventory-and-Order-Management-System)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAbhinav-eng1%2FInventory-and-Order-Management-System&root-directory=frontend&env=VITE_API_URL)

A production-ready, beginner-friendly full-stack **Inventory and Order Management System** built with MongoDB, Express.js, React (Vite), and Node.js. Features strict Role-Based Access Control (Admin & Staff), automated two-way inventory synchronization, PDF-printable order invoices, CSV data exports, and real-time operational analytics.

---

## 🎯 Motive & Motivation

Managing physical inventory and processing customer orders with spreadsheets or fragmented paperwork introduces critical operational liabilities:
- **Overselling & Stockouts**: Orders get accepted for items with zero or insufficient physical stock.
- **Manual Stock Miscalculations**: Team members frequently forget to deduct inventory upon fulfillment or restore stock when an order is cancelled.
- **Lack of Role Separation**: Unrestricted access allows unauthorized staff to alter unit prices, delete catalog items, or tamper with financial metrics.
- **Slow Auditing & Invoicing**: Generating client receipts and exporting operational records is often tedious and error-prone.

### The Objective
This system provides retail businesses, e-commerce warehouses, and supply chain operators with a unified, lightweight, and auditable solution that **guarantees stock integrity**, **automates order life cycles**, and **enforces strict permission boundaries**—all packaged with clean, heavily commented code that serves as an exemplary full-stack reference.

---

## 💼 Work Field & Industry Application

- **Domain**: Supply Chain Management (SCM), Retail ERP, Warehouse Logistics, and Order Fulfillment Operations.
- **Use Cases**:
  - Small to Medium-Sized Enterprises (SMEs) needing centralized inventory tracking.
  - Multi-employee retail storefronts requiring staff order placement with admin-only catalog curation.
  - Distribution hubs generating on-demand printable customer invoices and CSV shipment audits.

---

## 🛠️ Technologies Used

### Frontend
- **React 18 (Vite)**: Lightning-fast reactive single-page application framework.
- **React Router DOM v6**: Declarative client-side routing with guarded routes.
- **Axios**: HTTP client equipped with automated JWT request/response interceptors.
- **Vanilla CSS (Custom Design System)**: Modern, responsive UI with CSS custom properties, glassmorphism, responsive grid layouts, and specialized print stylesheets (`@media print`).

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime environment.
- **Express.js**: RESTful API framework structured with decoupled controllers, routes, and middleware.
- **MongoDB & Mongoose ODM**: Schematized document database with schema-level validation, compound indexing, and aggregation pipelines.
- **JWT (jsonwebtoken)**: Stateless token-based user authentication.
- **bcryptjs**: One-way cryptographic password hashing using 10 salt rounds.
- **cors & dotenv**: Cross-origin resource sharing configuration and environment variable isolation.

---

## 📋 System Specifications & Features

### 1. 🔐 Role-Based Access Control (RBAC)
- **Roles**: `admin` and `staff`.
- **Admin**: Full administrative privileges—Create, Read, Update, and Delete (CRUD) products, update order statuses, export data, and manage team accounts (promote/demote roles, delete accounts).
- **Staff**: Operational access—Browse products, place orders with real-time stock checks, update fulfillment status, and print customer invoices. Administrative action buttons (Edit, Delete, Add Product, User Management) are completely stripped from the UI.
- **Route Security**: Central JWT middleware (`protect`) validates headers, while `authorize('admin')` safeguards privileged API endpoints.

### 2. 📦 Product Catalog & Stock Tracking
- **Schema Attributes**: `name`, `sku` (unique, uppercase), `category`, `price`, `quantity`, and `lowStockLimit`.
- **Low Stock Badges**: Real-time visual alerts flag items when `quantity <= lowStockLimit`.
- **Search & Filter**: Instant client-side search across product titles and SKUs, paired with category filtering.
- **CSV Data Export**: Single-click export of catalog records to CSV format.

### 3. 📑 Order Life Cycle & Stock Synchronization
- **Atomic Stock Checks**: Automatically verifies stock availability before creating an order. Rejects creation with descriptive error messages if requested quantities exceed available inventory.
- **Stock Decrement**: Safely reduces product stock quantities immediately upon order submission.
- **Order Status Workflow**: Transitions across `Pending`, `Completed`, and `Cancelled`.
- **Reversal on Cancellation**: Marking an order as `Cancelled` automatically restores ordered quantities back to product inventory.

### 4. 📄 Printable Order Invoices & Receipts
- Built-in printable invoice modal styled like an official transaction receipt.
- Features company branding, invoice number, customer details, itemized billing table, subtotal, and total due.
- Native **"Print / Save as PDF"** function with dedicated `@media print` CSS isolating the receipt from web navigation elements.

### 5. 📊 Operational Dashboard
- Live analytical cards for:
  - **Total Products** count.
  - **Total Orders** count.
  - **Low-Stock Items** requiring urgent replenishment.
  - **Total Sales Value** aggregated from fulfilled orders.
- Quick preview tables for low-stock items and recent orders.

### 6. 👥 Team & Staff Management (Admin Only)
- Dedicated `/users` view for administrators.
- Direct account creation for new staff/admin members.
- Instant promotion/demotion between roles with safeguards preventing self-demotion or self-deletion.

---

## 📁 File Architecture & Folder Structure

```text
Inventory and Order Management System/
│
├── .gitignore                    # Ignores node_modules, .env, and build artifacts
├── package.json                  # Root runner scripts (start, dev, seed, install-all)
├── README.md                     # Comprehensive technical documentation
│
├── backend/                      # Express.js REST API Server
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile & team management
│   │   ├── productController.js  # Product CRUD logic & inventory threshold checks
│   │   ├── orderController.js    # Order placement, status updates & stock synchronization
│   │   └── dashboardController.js# Aggregated analytics calculation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification & role authorization
│   │   └── errorMiddleware.js    # Centralized 404 & 500 error handlers
│   ├── models/
│   │   ├── User.js               # User schema with pre-save bcrypt hashing hook
│   │   ├── Product.js            # Product schema with validations
│   │   └── Order.js              # Order schema with nested line-items snapshot
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── productRoutes.js      # /api/products endpoints
│   │   ├── orderRoutes.js        # /api/orders endpoints
│   │   └── dashboardRoutes.js    # /api/dashboard endpoints
│   ├── seed/
│   │   └── seeder.js             # Initial database seeder (1 Admin, 1 Staff, 10 Products)
│   ├── .env                      # Local server environment variables (git-ignored)
│   ├── .env.example              # Template for server configuration
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server bootstrap & route mounting
│
└── frontend/                     # React (Vite) Single Page Application
    ├── public/                   # Static favicon and assets
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios client with request & 401 interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation header with user badge & role display
    │   │   └── ProtectedRoute.jsx# Auth guard redirecting unauthenticated requests
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global session state (user, token, login, logout)
    │   ├── pages/
    │   │   ├── Login.jsx         # Sign-in page with quick 1-click demo filler
    │   │   ├── Register.jsx      # Registration page with role assignment
    │   │   ├── Dashboard.jsx     # High-level operational metrics and watchlist
    │   │   ├── Products.jsx      # Inventory table, search, category filter, CRUD modals
    │   │   ├── Orders.jsx        # Order creation, status selector & printable invoice
    │   │   └── Users.jsx         # Admin team directory, role management & account deletion
    │   ├── utils/
    │   │   └── exportCsv.js      # Helper utility to export datasets to CSV files
    │   ├── App.jsx               # Application routes & layout wrapper
    │   ├── index.css             # Vanilla CSS design system with @media print rules
    │   └── main.jsx              # React DOM render entry point
    ├── index.html                # HTML document entry
    ├── package.json              # Frontend dependencies & build scripts
    └── vite.config.js            # Vite configuration with /api backend proxy
```

---

## 📡 REST API Reference

All API routes are prefixed under `/api`.

### 🔐 Authentication & Team Management (`/api/auth`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT |
| `GET` | `/api/auth/me` | Protected (Any) | Fetch current user session profile |
| `GET` | `/api/auth/users` | Admin Only | Retrieve list of all registered team members |
| `PUT` | `/api/auth/users/:id/role`| Admin Only | Update team member role (`admin` / `staff`) |
| `DELETE`| `/api/auth/users/:id` | Admin Only | Delete a team member account |

### 📦 Products Catalog (`/api/products`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Protected (Any) | List all products with `isLowStock` indicator |
| `GET` | `/api/products/:id` | Protected (Any) | Retrieve single product details |
| `POST` | `/api/products` | Admin Only | Create a new inventory product |
| `PUT` | `/api/products/:id` | Admin Only | Update an existing product |
| `DELETE`| `/api/products/:id` | Admin Only | Delete product from catalog |

### 📑 Customer Orders (`/api/orders`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Protected (Any) | List all orders with items and fulfillment statuses |
| `POST` | `/api/orders` | Protected (Any) | Place order; performs stock check and auto-deduction |
| `PUT` | `/api/orders/:id/status`| Protected (Any) | Update order status; auto-restores stock on cancellation |

### 📊 Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Protected (Any) | Aggregates total products, orders, low stock, and sales |

---

## 🚀 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or a MongoDB Atlas connection string)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Abhinav-eng1/Inventory-and-Order-Management-System.git
cd Inventory-and-Order-Management-System
```

---

### Step 2: Install Dependencies
You can install dependencies for both the backend and frontend simultaneously from the root directory:
```bash
npm run install-all
```
*(Or navigate to `/backend` and `/frontend` separately and run `npm install` in each).*

---

### Step 3: Environment Configuration
Create a `.env` file inside the `backend/` folder (or copy from `backend/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
JWT_SECRET=supersecretjwtkey_change_in_production
```
> **Note**: If using MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/inventory_db`.

---

### Step 4: Seed Demo Data
Populate the database with pre-configured accounts and inventory products:
```bash
npm run seed
```
This seeds:
- **Admin Account**: `admin@inventory.com` | Password: `admin123`
- **Staff Account**: `staff@inventory.com` | Password: `staff123`
- **10 Sample Products**: Spanning various categories, with items below their low-stock threshold to demonstrate alerts.

---

### Step 5: Run the Application
Open two separate terminals:

**Terminal 1 (Backend API):**
```bash
npm run backend
```
*API will run at [http://localhost:5000](http://localhost:5000).*

**Terminal 2 (Frontend Client):**
```bash
npm run frontend
```
*Frontend will run at [http://localhost:3000](http://localhost:3000).*

---

## 👨‍💻 Developer & Profile Links

- **Author**: **Abhinav Garg**
- **GitHub**: [@Abhinav-eng1](https://github.com/Abhinav-eng1)
- **Primary Repository**: [Inventory-and-Order-Management-System](https://github.com/Abhinav-eng1/Inventory-and-Order-Management-System)
- **Work Field**: Full-Stack Web Development, MERN Stack Architectures, Enterprise Operations & Healthcare Systems.

### 🔗 Other Featured Projects & Repositories
- **[Hospital & Clinic Appointment System](https://github.com/Abhinav-eng1)**: Full-stack healthcare appointment scheduling system with patient portals, doctor availability management, and administrative dashboards.
- Explore more projects and open-source contributions on [GitHub Profile (@Abhinav-eng1)](https://github.com/Abhinav-eng1).

---

## 📄 License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
