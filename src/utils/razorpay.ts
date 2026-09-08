import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop) {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Critical Security: Razorpay environment variables (KEY_ID or KEY_SECRET) are missing.");
      }

      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (razorpayInstance as any)[prop];
    return typeof value === "function" ? value.bind(razorpayInstance) : value;
  },
});
