import Razorpay from "razorpay";

export const razorpay = new Proxy({} as Razorpay, {
  get: (target, prop) => {
    // Lazy initialization for build-time safety
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("CRITICAL: Razorpay environment variables RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are not set.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(target as any).__instance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (target as any).__instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target as any).__instance[prop];
  }
});
