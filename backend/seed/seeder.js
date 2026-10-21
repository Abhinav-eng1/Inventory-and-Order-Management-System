/**
 * Database Seeder Script
 * 
 * Populates the database with initial demo data:
 * - 1 Admin User (email: admin@inventory.com, pass: admin123)
 * - 1 Staff User (email: staff@inventory.com, pass: staff123)
 * - 10 Sample Products across various categories, including items with low stock
 * 
 * Run via: npm run seed (from inside /backend)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load environment variables
dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@inventory.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Staff Member',
    email: 'staff@inventory.com',
    password: 'staff123',
    role: 'staff'
  }
];

const sampleProducts = [
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'LOG-MX3S-BLK',
    category: 'Peripherals',
    price: 99.99,
    quantity: 24,
    lowStockLimit: 5
  },
  {
    name: 'Keychron K2 Mechanical Keyboard',
    sku: 'KEY-K2-RGB',
    category: 'Peripherals',
    price: 89.50,
    quantity: 12,
    lowStockLimit: 5
  },
  {
    name: 'Dell UltraSharp 27" 4K USB-C Monitor',
    sku: 'MON-DELL-U27',
    category: 'Monitors',
    price: 499.00,
    quantity: 3, // LOW STOCK (quantity <= lowStockLimit)
    lowStockLimit: 5
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    sku: 'AUD-SONY-XM5',
    category: 'Audio',
    price: 349.99,
    quantity: 18,
    lowStockLimit: 6
  },
  {
    name: 'Anker PowerExpand 8-in-1 USB-C Hub',
    sku: 'ACC-ANK-HUB8',
    category: 'Accessories',
    price: 59.99,
    quantity: 2, // LOW STOCK
    lowStockLimit: 4
  },
  {
    name: 'Ergonomic Mesh High-Back Office Chair',
    sku: 'FURN-CHAIR-01',
    category: 'Furniture',
    price: 229.00,
    quantity: 7,
    lowStockLimit: 3
  },
  {
    name: 'Standing Desk Converter 36 Inch',
    sku: 'FURN-DESK-36',
    category: 'Furniture',
    price: 159.95,
    quantity: 4, // LOW STOCK
    lowStockLimit: 5
  },
  {
    name: 'Samsung T7 Shield 1TB Portable SSD',
    sku: 'STR-SAM-T7-1TB',
    category: 'Storage',
    price: 109.99,
    quantity: 30,
    lowStockLimit: 8
  },
  {
    name: 'Apple 140W USB-C Power Adapter',
    sku: 'ACC-APL-140W',
    category: 'Accessories',
    price: 99.00,
    quantity: 1, // LOW STOCK
    lowStockLimit: 5
  },
  {
    name: 'Blue Yeti USB Condenser Microphone',
    sku: 'AUD-BLUE-YETI',
    category: 'Audio',
    price: 129.99,
    quantity: 15,
    lowStockLimit: 4
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to database successfully.');

    // Clear existing data to prevent duplicate keys
    console.log('Clearing existing collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    // Insert Users (User.create invokes pre-save hook to hash password)
    console.log('Seeding users...');
    for (const user of sampleUsers) {
      await User.create(user);
    }
    console.log(` Seeded ${sampleUsers.length} users (1 Admin, 1 Staff).`);

    // Insert Products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(` Seeded ${createdProducts.length} sample products.`);

    console.log('Seeding complete! You can now start the server.');
    process.exit(0);
  } catch (error) {
    console.error(' Error during seeding:', error.message);
    process.exit(1);
  }
};

seedDatabase();
