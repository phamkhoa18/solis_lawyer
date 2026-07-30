const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solislawyer'); // Need correct URI
  const members = await mongoose.connection.collection('members').find().toArray();
  console.log(JSON.stringify(members, null, 2));
  process.exit(0);
}
run();
