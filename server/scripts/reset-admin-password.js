const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');

async function resetPassword() {
  await connectDB();

  const admins = await Admin.find({}, 'username email role createdAt').lean();
  console.log('Existing Admin accounts in MongoDB:', admins);

  const newPassword = process.env.RESET_ADMIN_PASSWORD || '123456789';

  let targetAdmin = await Admin.findOne();
  if (!targetAdmin) {
    console.log('No admin found, creating default admin...');
    targetAdmin = new Admin({
      username: 'admin',
      email: 'admin@gecr.ac.in',
      password: newPassword,
      role: 'admin',
    });
    await targetAdmin.save();
    console.log(`Created new admin: username='${targetAdmin.username}', password='${newPassword}'`);
  } else {
    targetAdmin.password = newPassword;
    await targetAdmin.save();
    console.log(`Successfully reset password for admin '${targetAdmin.username}' (email: '${targetAdmin.email}') to: '${newPassword}'`);
  }

  process.exit(0);
}

resetPassword().catch((err) => {
  console.error('Error resetting admin password:', err);
  process.exit(1);
});

