import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, planName } = req.body || {};
    const amountInRupees = Number(amount);

    if (!amountInRupees || amountInRupees < 1) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay keys are not configured in Vercel environment variables.' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      receipt: `jss_${Date.now()}`,
      notes: { planName: planName || 'JSS Career Academy Plan' },
    });

    return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to create Razorpay order' });
  }
}
