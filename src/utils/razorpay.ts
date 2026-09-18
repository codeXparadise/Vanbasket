import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

// [SECURITY] Aegis: Removed hardcoded fallback secrets. Using environment variables.
// [PERFORMANCE] Aegis: Using a Proxy to lazily initialize the Razorpay SDK to prevent Next.js static build failures caused by missing secrets during the build phase. The instance is cached to avoid massive overhead of creating it on every property access.
export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop, receiver) {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not defined.");
      }

      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    return Reflect.get(razorpayInstance, prop, receiver);
  },
});
