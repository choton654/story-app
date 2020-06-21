const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(`Mongoodb connected`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;
