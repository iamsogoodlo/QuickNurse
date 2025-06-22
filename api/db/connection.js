const mongoose = require('mongoose');

// MONGODB_URI should be available from process.env if server.js (or the main app entry point)
// has already called require('dotenv').config().
// Your server.js should have this.

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables. Ensure .env file is in the root of quicknurse-api and loaded by your server.js.');
      process.exit(1);
    }
    console.log('🔗 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI); // Mongoose v6+ no longer needs useNewUrlParser/UnifiedTopology
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Ensure your MONGODB_URI in the .env file (in the root of quicknurse-api) is correct and your IP is whitelisted in MongoDB Atlas if necessary.');
    process.exit(1);
  }
};

module.exports = connectDatabase;
