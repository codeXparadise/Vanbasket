import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("CRITICAL: Razorpay secrets (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing from the environment.");
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });

  return razorpayInstance;
}

export const razorpay = new Proxy({} as Razorpay, {
  get(target, prop) {
    const instance = getRazorpayInstance();
    return Reflect.get(instance, prop);
  }
});
