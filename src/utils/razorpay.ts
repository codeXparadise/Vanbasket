import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("Razorpay environment variables are not defined. Check your .env.local file.");
}

export const razorpay = (keyId && keySecret) ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : {} as Razorpay;
