import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.mongodbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 120000, 
        maxPoolSize: 200,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
};

export default connectDb;
