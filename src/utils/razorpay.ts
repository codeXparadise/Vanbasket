import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get: function (target, prop) {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay environment variables RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are not defined.");
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
