import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop) {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("CRITICAL: Razorpay environment variables (key_id, key_secret) are not set.");
      }

      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (razorpayInstance as any)[prop];
  },
});
