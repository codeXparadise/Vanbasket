import Razorpay from "razorpay";

// Lazy initialization of Razorpay SDK to prevent Next.js static build failures
// when runtime environment variables are missing during the build phase.
let razorpayInstance: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get: (target, prop) => {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Critical Error: Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing.");
      }

      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (razorpayInstance as any)[prop];
    return typeof value === 'function' ? value.bind(razorpayInstance) : value;
  }
});
