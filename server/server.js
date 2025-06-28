import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import User from "./models/User.js";


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Webhooks need to be handled BEFORE clerkMiddleware
app.post("/api/clerk", clerkWebhooks);

// Clerk auth middleware (optional for other routes)
app.use(clerkMiddleware());


app.use(cors()); //Enable Cross-Origin Resource Sharing

app.get("/", (req, res) => res.send("API is Working"));

app.get("/all-user", async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});