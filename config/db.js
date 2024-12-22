import mongoose from "mongoose";


const connectDB = async () => {
    try {
      const response = await mongoose.connect(
        "mongodb+srv://lakshmipriyan0606:lakshmi123@cluster0.vjn1b.mongodb.net/noteapp?retryWrites=true&w=majority&appName=Cluster0",
      );
      console.log("MongoDB connected successfully!");
    } catch (err) {
      console.error("Error connecting to MongoDB:", err.message); 
      process.exit(1);
    }
  };

  export default connectDB