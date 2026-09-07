import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("Razorpay environment variables are not defined. Check your .env.local file.");
}

export const razorpay = new Razorpay({
  key_id: keyId || "mock_key_id",
  key_secret: keySecret || "mock_key_secret",
});
