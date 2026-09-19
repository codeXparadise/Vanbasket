import Razorpay from "razorpay";

let cachedRazorpay: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get: function (target, prop) {
    if (!cachedRazorpay) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay environment variables are not defined. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.");
      }

      cachedRazorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    return (cachedRazorpay as any)[prop];
  },
});
