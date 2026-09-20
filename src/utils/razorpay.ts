import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

// Security & Performance Rationale:
// We use a Proxy to lazy-load the Razorpay instance. This prevents eager initialization
// with unvalidated fallback secrets (which could expose sensitive data) and removes
// unnecessary overhead during the Next.js build process. It fails securely by throwing an
// error if the required environment variables are missing.
export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop) {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay environment variables are not securely configured.");
      }

      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    const value = (razorpayInstance as any)[prop];
    return typeof value === 'function' ? value.bind(razorpayInstance) : value;
  }
});
