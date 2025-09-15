import dotenv from "dotenv";
dotenv.config({ path: "src/config/.env.dev" }); // تحميل ملف env

import mongoose from "mongoose";

// console.log("DB_URI from env:", process.env.DB_URI);

const connectDB = async () => {
  try {
    const uri = process.env.DB_URI;
    if (!uri) {
      throw new Error("DB_URI is not defined in environment variables");
    }

    const result = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(result.models);
    console.log("DB connected successfully ✅");
  } catch (error) {
    console.log("fail to connect on DB ❌", error);
  }
};

export default connectDB;

