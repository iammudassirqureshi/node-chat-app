import mongoose from "mongoose";

export async function initMongoose() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV === "development" ? true : false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connection established");
  } catch (err) {
    console.error("❌ MongoDB failed to connect:", err);
    if (process.env.NODE_ENV !== "production") {
      setTimeout(initMongoose, 5000);
    } else {
      process.exit(1);
    }
  }
}

const handleExit = (signal) => {
  console.log(`Received ${signal}. Closing MongoDB connection...`);
  mongoose.connection
    .close()
    .then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    });
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
