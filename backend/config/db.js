/**
 * Database Connection Configuration
 * 
 * This module connects our Express application to MongoDB using Mongoose.
 * It reads the connection string from environment variables (MONGO_URI).
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB with the URI specified in .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`💡 Note: Please ensure your MongoDB server is running (e.g. via local MongoDB service/mongod) or provide a MongoDB Atlas URI in backend/.env`);
    // Exit if unable to connect
    process.exit(1);
  }
};

module.exports = connectDB;
