// Quick script to check users in database
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const DefaultUser = mongoose.model('DefaultUser', new mongoose.Schema({
      email: String,
      name: String,
      role: String,
      createdAt: Date,
    }, { collection: 'defaultusers' }));

    const users = await DefaultUser.find({}).sort({ createdAt: -1 });

    console.log('\n=== All Users ===');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
