const mongoose = require('mongoose');
require('./src/models/Service');
require('./src/models/Member');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/solis_lawyer_db');
  try {
    const services = await mongoose.model('Service').find().populate('team');
    console.log('Success:', services.length);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
run();
