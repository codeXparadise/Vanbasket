import Razorpay from "razorpay";

// Security & Performance Rationale: Use Proxy for lazy initialization.
// This prevents Next.js static builds from crashing if secrets are missing at build time,
// and ensures we don't hold an invalid instance in memory.
export const razorpay = new Proxy({} as Razorpay, {
  get: (target: any, prop: string | symbol) => {
    if (!target._instance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        console.warn("Razorpay environment variables are not defined. Check your .env.local file.");
        throw new Error("Missing Razorpay credentials");
      }

      target._instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return target._instance[prop];
  },
});
