import Razorpay from "razorpay";

let cachedInstance: Razorpay | null = null;

export const razorpay = new Proxy(
  {} as Razorpay,
  {
    get(target, prop, receiver) {
      if (!cachedInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
          throw new Error("Razorpay environment variables RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are missing.");
        }

        // Initialize the Razorpay instance lazily on first access
        cachedInstance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
      }

      const value = (cachedInstance as any)[prop];
      if (typeof value === "function") {
        return value.bind(cachedInstance);
      }
      return value;
    }
  }
);
