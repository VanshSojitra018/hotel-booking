import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
   console.log("📡 Clerk webhook received");
  try {
    // 1. Create Svix instance using Clerk Webhook Secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // 2. Extract headers for verification
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // 3. Verify the webhook
    await wh.verify(JSON.stringify(req.body), headers);

    // 4. Extract data and event type
    const { data, type } = req.body;

    // 5. Prepare user data for MongoDB
    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "no-email",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || data.profile_image_url || "",
      recentSearchedCity: [], // required in schema
    };

    console.log(`📥 Webhook received: ${type}`);
    console.log("User Data:", userData);

    // 6. Handle webhook events
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log("⚠️ Unhandled event type:", type);
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
