import Razorpay from "razorpay";

// Lazy initialize Razorpay client to avoid build-time errors and
// prevent hardcoding fallback secrets
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("Razorpay environment variables are not defined. Check your .env.local file.");
    }

    razorpayInstance = new Razorpay({
      key_id: keyId as string,
      key_secret: keySecret as string,
    });
  }
  return razorpayInstance;
}

export const razorpay = new Proxy({} as Razorpay, {
  get: function (target, prop) {
    const instance = getRazorpayInstance();
    // @ts-expect-error dynamic proxy
    return instance[prop];
  },
});
