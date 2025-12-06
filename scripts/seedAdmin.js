require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nfr-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin exists
    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@nfr.com' });
    
    if (admin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password: admin123456');
      console.log('\n✅ You can login with these credentials');
      return;
    }

    // Create admin user with plain password (will be hashed by pre-save hook)
    admin = new User({
      name: process.env.ADMIN_NAME || 'NFR Admin',
      email: process.env.ADMIN_EMAIL || 'admin@nfr.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'admin',
      phone: '+1234567890',
      isActive: true
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123456');
    console.log('\n✅ You can now login to admin dashboard at: http://localhost:3000/admin.html');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

connectDB().then(seedAdmin);

