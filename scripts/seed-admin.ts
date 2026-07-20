import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solis_lawyer_db';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'editor', 'author'], default: 'admin' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    // Check if user exists
    let admin = await User.findOne({ email });
    
    if (admin) {
      console.log('Admin user already exists. Updating password...');
      admin.password = await bcrypt.hash(password, 12);
      await admin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      admin = new User({
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        isActive: true,
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
